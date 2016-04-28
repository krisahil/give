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

function onFormError() {
  Bert.alert({
    message: "Looks like you might be missing some required fields.",
    type: 'danger',
    icon: 'fa-frown-o'
  });
}

function onFormSuccess() {
  Bert.alert({
    message: "Good work",
    type: 'success',
    icon: 'fa-smile-o'
  });
}

function getAdjustmentAmount(id) {

  let parent = Template.parentData(1);
  let parentParent = Template.parentData(2);
  let trip_id = parent._id;
  let deadline_id = id;

  let deadlineElementPosition = parent.deadlines
    .map(function(item) {return item.id; }).indexOf(deadline_id);

  let tripElementPosition = parentParent.trips
    .map(function(item) {return item.id; }).indexOf(trip_id);

  if (parentParent &&
    parentParent.trips[tripElementPosition] &&
    parentParent.trips[tripElementPosition].deadlines[deadlineElementPosition] &&
    parentParent.trips[tripElementPosition].deadlines[deadlineElementPosition].amount) {
    return Number(parentParent.trips[tripElementPosition].deadlines[deadlineElementPosition].amount);
  }
  return '0';
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
      insertDoc.trips = [{id : Trips.findOne()._id}];
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
  },
  adjustedAmount() {
    let deadlineAmount = this.amount;
    let adjustment = getAdjustmentAmount(this.id);
    return Number(deadlineAmount) + Number(adjustment);
  },
  deadlineAdjustmentValue() {
    let adjustmentValue = getAdjustmentAmount(this.id);
    return adjustmentValue;
  }
});

Template.Trip.events({
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
  },
  'submit .update-participant'(e){
    console.log("Clicked update adjustments");
    e.preventDefault();
    let target = e.target;
    let participant_id = this._id;
    console.log(participant_id);
    let adjustments = $.map($("[name=" + participant_id + "] .trip-adjustments"),
      function(item, index){
        console.log(index, item);
        return {
          id: $(item).attr('name'),
          amount: $(item).val()
        };
      });

    let formValues = {
      trip_id: Trips.findOne()._id,
      participant_id: participant_id,
      deadlines: adjustments,
      fname: target.fname.value,
      lname: target.lname.value,
      email: target.email.value
    };
    
    Meteor.call("updateTripParticipantAndAdjustments", formValues, ( err, res )=> {
      if (err) {
        console.error(err);
        onFormError();
      } else {
        console.log(res);
        onFormSuccess();
        $("#collapse-edit-" + participant_id).collapse('toggle');
      }

    })
  }
});