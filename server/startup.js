Meteor.startup( function() {

  return Mandrill.config({
    username: Meteor.settings.mandrillUsername,
    "key": Meteor.settings.mandrillKey
  });

});