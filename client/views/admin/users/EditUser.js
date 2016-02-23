
AutoForm.hooks({
  'edit-user-form': {
    onSuccess: function (operation, result, template) {
      Session.set("addingNew", false);
      Bert.alert( result, 'success', 'growl-top-right' );
      Router.go("/dashboard/users");
    },

    onError: function(operation, error, template) {
      console.log(error);
      console.log(operation);

      Bert.alert( error.message, 'danger', 'growl-top-right' );
    },

    onSubmit: function (insertDoc, updateDoc, currentDoc) {
      return this.event.preventDefault();
    }
  }
});


Template.EditUser.helpers({
  schema: function () {
    return Schema.UpdateUserFormSchema;
  },
  roles: function () {
    return Meteor.roles.find({});
  },
  selected: function () {
    let editUserID = Router.current().params._id;
    if(editUserID) {
      let thisUser = Meteor.users.findOne({_id: editUserID});
      if ( thisUser.roles.indexOf( this.name ) > -1 ){
        return 'selected';
      }
    } else {
      return;
    }
  }
});
Template.EditUser.events({
  'click .cancel-button': function () {
    console.log("Clicked cancel");
    Session.set("addingNew", false);
    Router.go("/dashboard/users");
  }
});