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
    parentParent.trips && parentParent.trips[tripElementPosition] &&
    parentParent.trips[tripElementPosition].deadlines &&
    parentParent.trips[tripElementPosition].deadlines[deadlineElementPosition] &&
    parentParent.trips[tripElementPosition].deadlines[deadlineElementPosition].amount) {
    return Number(parentParent.trips[tripElementPosition].deadlines[deadlineElementPosition].amount);
  }
  return '0';
}

Template.TripMember.onRendered(function () {
  $('[data-toggle="popover"]').popover({html: true});
});
Template.TripMember.onCreated(function () {
  let tripId = Router.current().params._id;
  // TODO: need to also pass this user's fundraiser id so that only those splits are passed back
  this.autorun(()=> {
    this.subscribe("userDTFunds");
    this.subscribe("tripsMember");
    this.subscribe("travelDTSplits", tripId);
  });
});

Template.TripMember.helpers({
  trip() {
    let trip = Trips.findOne();
    return Trips.findOne();
  },
  subscribed: function () {
    if (this && this.metadata && this.metadata.subscribed && this.metadata.subscribed === "true") {
      return 'subscribed';
    } else {
      return 'not-subscribed';
    }
  },
  name() {
    let DTFund = DT_funds.findOne({_id: this.fundId});
    if (DTFund) {
      return DTFund.name;
    }
    return;
  },
  participant() {
    let participant = Fundraisers.findOne();
    if(participant) {
      return participant;
    }
    return;
  },
  amountRaised(){
    let raised = getAmountRaised(this.fname + " " + this.lname);
    return raised;
  },
  amountRaisedPercent(amountRaised){
    let deadlines = Trips.findOne() && Trips.findOne().deadlines;
    if (!deadlines){
      return;
    }

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

Template.TripMember.events({
  'click .subscribed-span'() {
    // TODO: subscribe this fundraiser to email alerts (or unsubscribe)
    // depending on whether they were already subscribed or unsubscribed

    
  }
});