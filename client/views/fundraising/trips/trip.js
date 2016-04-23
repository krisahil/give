function getAmountRaised(name) {
  let dtSplits = DT_splits.find( { 'memo': {
    $regex: name, $options: 'i'
  } } );
  let amount = dtSplits.fetch().reduce(function ( prevValue, item ) {
    return prevValue + item.amount_in_cents;
  }, 0);
  if (amount) {
    return amount/100;
  }
  return 0;
}

function onFormError(  ) {
  Bert.alert({
    message: "Looks like you might be missing some required fields.",
    type: 'danger',
    icon: 'fa-frown-o',
    style: 'growl-bottom-right'
  });
}

function onFormSuccess(  ) {
  Bert.alert({
    message: "Good work",
    type: 'success',
    icon: 'fa-smile-o',
    style: 'growl-bottom-right'
  });
}

AutoForm.hooks({
  'fundraisers-form': {
    onSuccess: function () {
      onFormSuccess();
    },
    onError: function(formType, error) {
      onFormError();
    },
    onSubmit: function (insertDoc) {
      insertDoc.addParticipants.forEach(function ( participant ) {
        participant.trips = [{id : Trips.findOne()._id}];
      });
      Meteor.call("insertFundraisersWithTrip", insertDoc, function ( err, res ) {
        if(err) {
          console.error(err);
          onFormError();
        } else {
          AutoForm.resetForm('fundraisers-form');
          $("[type='submit']").prop("disalbed", false);
          $("[type='submit']").removeAttr("disabled");
          onFormSuccess();
        }
      });
      return false;
    }
  }
});

Template.Trip.onCreated(function () {
  let tripId = Router.current().params._id;
  this.autorun(()=> {
    this.subscribe("userDTFunds");
    this.subscribe("fundraisers", tripId);
    this.subscribe("travelDTSplits", tripId);
  });
});

Template.Trip.helpers({
  trip() {
    let trip = Trips.findOne();
    return Trips.findOne();
  },
  name() {
    let DTFund = DT_funds.findOne({_id: this.fundId});
    if (DTFund) {
      return DTFund.name;
    }
    return;
  },
  participant() {
    let participant = Fundraisers.find();
    if(participant) {
      return participant;
    }
    return;
  },
  participantName(){
    let name = this.fname + " " + this.lname;
    return name;
  },
  amountRaised(){
    let raised = getAmountRaised(this.fname + " " + this.lname);
    return raised;
  },
  amountRaisedPercent(amountRaised){
    let deadlines = Trips.findOne().deadlines;

    let deadlinesTotal = deadlines.reduce( function(previousVal, deadline){
      return previousVal + deadline.amount;
    }, 0);

    if (deadlinesTotal && amountRaised) {
      console.log(amountRaised, " / ", deadlinesTotal);
      return Math.ceil(100*(amountRaised/deadlinesTotal));
    }
    return 0;
  },
  deadlines() {
    if (this.deadlines && this.deadlines.length > 0 ) {
      return this.deadlines.sort(function(item, nextItem){return item.dueDate - nextItem.dueDate;});
    } else if (this.deadlines) {
      return this.deadlines;
    }
    return;
  },
  percentageOfDeadline() {
    let parent = Template.parentData(1);

    // Sort the deadlines in case the user entered them out of order,
    let deadlinesSorted = parent.deadlines
      .sort(function(item, nextItem){return item.dueDate - nextItem.dueDate;});

    // Get the index position of this deadline
    let elementPosition = deadlinesSorted
      .map(function(item) {return item.id; }).indexOf(this.id);

    let deadlinesTotal = parent.deadlines
      .reduce( function(previousVal, deadline, index){
      if (elementPosition > index) {
        return previousVal + deadline.amount;
      } else {
        return previousVal;
      }
    }, this.amount);


    let raised = getAmountRaised(parent.fname + " " + parent.lname);
    let percentOfDeadline = 100*(raised/deadlinesTotal);

    if (elementPosition === 0 ){
      return percentOfDeadline;
    } else {
      if (deadlinesSorted[elementPosition - 1].amount > raised) {
        return 0;
      } else {
        return 100*((raised-deadlinesSorted[elementPosition - 1]
            .amount)/(deadlinesTotal-deadlinesSorted[elementPosition - 1]
            .amount));
      }
    }
  },
  donationForThisFundraiser() {
    let name = this.fname + " " + this.lname;
    let dtSplits = DT_splits.find( { 'memo': {
      $regex: name, $options: 'i'
    } } );
    if (dtSplits && dtSplits.count() > 0) {
      return dtSplits;
    }
    return;
  },
  donorName(){
    // inside split
    let donation = DT_donations.findOne({_id: this.donation_id});
    if (donation) {
      let dtPersona = DT_personas.findOne({_id: donation.persona_id});
      if (dtPersona) {
        return dtPersona.recognition_name;
      } else {
        Meteor.call("getDTPerson", donation.persona_id, function ( err, res ) {
          if(!err){
            return res.recognition_name;
          } else {
            console.error(err);
          }
        })
      }  
    }
    return;    
  },
  splitAmount(){
    return this.amount_in_cents ? (this.amount_in_cents/100) : "";
  }
});

Template.Trip.events({
  'click .edit-participant'(){
    console.log("Clicked edit-participant");
  },
  'click .remove-participant'(){
    let self = this;

    console.log("remove participant clicked");
    swal({
      title: "Are you sure you want to remove this participant?",
      type: "info",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      closeOnConfirm: false,
      closeOnCancel: true,
      showLoaderOnConfirm: true
    }, function(isConfirm) {
      if (isConfirm) {

        let tripId = Router.current().params._id;
        Meteor.call( 'removeTripParticipant', self._id, tripId, function( error, response ) {
          if ( error ) {
            console.log(error);
            swal("Error", "Something went wrong", "error");
          } else {
            console.log(response);
            swal({
              title: "Done",
              text: "Ok, I've removed that participant.",
              type: 'success'
            });
          }
        });
      }
    });
  }
});