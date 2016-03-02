Template.ProfileModal.helpers({
  this_persona: function () {
    var persona_info;
    if(Session.get('params.userID')) {
      persona_info = Meteor.users.findOne({_id: Session.get('params.userID')}) &&
        Meteor.users.findOne({_id: Session.get('params.userID')}).persona_info;
      return _.where(persona_info, {id: Number(Session.get('activeTab'))});
    } else if(Session.get('activeTab')) {
      persona_info = Meteor.users.findOne() && Meteor.users.findOne().persona_info;
      return _.where(persona_info, {id: Number(Session.get('activeTab'))});
    } else {
      return;
    }
  },
  personaStreetAddress: function () {
    var street_address = this[0].addresses[0].street_address;
    street_address = street_address.split("\n");
    return street_address;
  }
});