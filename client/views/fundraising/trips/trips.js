AutoForm.hooks({
  'trips-form': {
    onSuccess: function () {
      Bert.alert({
        message: "Good work",
        type: 'success',
        icon: 'fa-smile-o',
        style: 'growl-bottom-right'
      });
    },
    onError: function(formType, error) {
      console.error(error);
      Bert.alert({
        message: "Looks like you might be missing some required fields.",
        type: 'danger',
        icon: 'fa-frown-o',
        style: 'growl-bottom-right'
      });
    },
    onSubmit: function () {
      return this.event.preventDefault();
    }
  }
});

Template.Trips.onCreated(function () {
  this.formType = new ReactiveVar('insert');
  this.autorun(()=> {
    this.subscribe("userDTFunds");
    this.subscribe("travelDTSplits");
    this.subscribe("trips");
    this.subscribe("fundraisers");
  })
});

Template.Trips.onRendered(function () {
  Meteor.call("updateTripFunds", moment().subtract(365, 'days').format('MMM+DD+YYYY'), moment().format('MMM+DD+YYYY'), function ( error, result ) {
    if(!error) {
      console.dir(result);
    } else {
      console.dir(error);
    }
  });
});

Template.Trips.helpers({
  formType: function() {
    var formType = Template.instance().formType.get();
    return formType;
  },
  trips() {
    return Trips.find();
  },
  name() {
    let dtFund = DT_funds.findOne({_id: this.fundId});
    if (dtFund) {
      return dtFund.name;
    }
    return;
  },
  getParticipantNumber() {
    let number = Fundraisers.find({'trips.id': this._id}).count();
    return number;
  }/*,
  getTripCost() {
    let deadlinesTotal = this.deadlines.reduce( function(previousVal, deadline){
      return previousVal + deadline.amount;
    }, 0);
    return deadlinesTotal;
  },
  getTripCostPercentage() {
    console.log(this._id);
    let trip = Trips.findOne({_id: this._id});
    let number = Fundraisers.find({'trips.id': this._id}).count();

    if (trip && number) {
      let deadlinesTotal = trip.deadlines.reduce( function(previousVal, deadline){
        return previousVal + deadline.amount;
      }, 0);
      let groupTotal = deadlinesTotal * number;

      if (trip.fundTotal > groupTotal) {
        return trip.fundTotal/groupTotal;
      }
      return 100*(trip.fundTotal/groupTotal);
    }
    return;
  }*/
});

Template.Trips.events({
  'click .trips-row': function (e) {
    console.log("CLicked row" );
    let tripId = $(e.currentTarget).attr("data-id");
    Router.go('trip', {_id: tripId});
  },
  'click #getFundsList'(){
    console.log("getFundsList button clicked");
    $("#getFundsList").button("loading");
    Meteor.call("get_dt_funds", ()=>{
      $("#getFundsList").button("reset");
      alert("Got the funds");
    });
  }
});
