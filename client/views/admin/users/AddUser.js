
AutoForm.hooks({
  'new-user-form': {
    onSuccess: function (operation, result, template) {
      Session.set("addingNew", false);
      toastr.success("Added a User");
      FlowRouter.go('users');
    },

    onError: function(operation, error, template) {
      console.log(error);
      console.log(operation);

      toastr.error(error.message);
    }
  }
});


Template.AddUser.helpers({
  schema: function () {
    return Schema.CreateUserFormSchema;
  },
  roles: function () {
    return Meteor.roles.find({});
  }
});
Template.AddUser.events({
  'click .cancel-button': function () {
    console.log("Clicked cancel");
    Session.set("addingNew", false);
  }
});

Template.AddUser.onRendered( function () {
  $('.selectpicker').selectpicker();
});
