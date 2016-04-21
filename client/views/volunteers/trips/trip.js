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
  'volunteers-form': {
    onSuccess: function () {
      onFormSuccess();
    },
    onError: function(formType, error) {
      onFormError();
    },
    onSubmit: function (insertDoc) {
      console.log(insertDoc);
      insertDoc.addParticipants.forEach(function ( participant ) {
        participant.trips = [{id : Trips.findOne()._id}];
      });
      Meteor.call("insertVolunteersWithTrip", insertDoc, function ( err, res ) {
        if(err) {
          console.error(err);
          onFormError();
        } else {
          console.log(res);
          AutoForm.resetForm('volunteers-form');
          $("[type='submit']").prop("disalbed", false)
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
    this.subscribe("volunteers", tripId);
    this.subscribe("travelDTSplits");
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
    let participant = Volunteers.find();
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
    let name = this.fname + " " + this.lname;
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
  },
  amountRaisedPercent(amountRaised){
    let deadlines = Trips.findOne().deadlines;

    let deadlinesTotal = deadlines.reduce( function(previousVal, deadline){
      return previousVal + deadline.amount;
    }, 0);

    if (deadlinesTotal && amountRaised) {
      return 100*(amountRaised/deadlinesTotal);
    }
    return 0;
  }
});