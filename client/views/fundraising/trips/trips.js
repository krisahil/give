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
  Session.set('showUpdateTrip', false);
  Session.set('tripDoc', '');
  this.autorun(()=> {
    this.subscribe("userDTFunds");
    this.subscribe("travelDTSplits");
    this.subscribe("trips");
    this.subscribe("fundraisers");
  })
});

Template.Trips.onDestroyed(function () {
  Session.delete('tripDoc');
  Session.delete('showUpdateTrip');
});

Template.Trips.helpers({
  showUpdateTrip() {
    return Session.get('showUpdateTrip');
  },
  tripDoc() {
    return Session.get('tripDoc');
  },
  formType() {
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
  }
});

Template.Trips.events({
  'click .see-trip'(e) {
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
  },
  'click .edit-trip'(e){
    console.log($(e.currentTarget).data("id"));
    Session.set('showUpdateTrip', true);
    Session.set('tripDoc', Trips.findOne({_id: $(e.currentTarget).data("id")}));
  }
});
