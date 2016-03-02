Template.UserNav.events({
  'click #nav-password': function(evt){
    evt.preventDefault();
    Router.go('changePwd');
  },
  'click #nav-sign-out': function(evt){
    evt.preventDefault();
    AccountsTemplates.logout();
  },
  'click #nav-profile': function(evt){
    evt.preventDefault();
    Router.go('user.profile');
  },
  'click #nav-subscriptions': function(evt){
    evt.preventDefault();
    Session.set('addingNewCreditCard', false);
    Router.go('subscriptions');
  }
});

Template.UserNav.helpers({
  dismissedNewStuff: function () {
    let newStuffVersion = Meteor.user() && Meteor.user().profile &&
      Meteor.user().profile.newStuffVersion;
    if(newStuffVersion && newStuffVersion > Meteor.settings.public.newStuffVersion){
      return true;
    } else {
      return false;
    }
  }
});