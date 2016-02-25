
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


Template.Users.helpers({
  users: function () {
    return Meteor.users.find({}, { sort: { createdAt: 1} });
  },
  schema: function () {
    return Schema.UpdateUserFormSchema;
  },
  roles: function () {
    return Meteor.roles.find({});
  },
  user_roles: function () {
    return this.roles;
  },
  selected: function () {
    let editUserID = Session.get("params.userID");
    if(editUserID) {
      let thisUser = Meteor.users.findOne({_id: editUserID});
      if ( thisUser.roles.indexOf( this.name ) > -1 ){
        return 'selected';
      }
    } else {
      return;
    }
  },
  disabledUserFA: function () {
    if(!this.state){
      return '<i class="fa fa-lock"></i>';
    }
    if(this.state && this.state.status && this.state.status === 'disabled'){
      return '<i class="fa fa-unlock"></i>';
    } else {
      return '<i class="fa fa-lock"></i>';
    }
  },
  toggleUserText: function () {
    if(this.state && this.state.status && this.state.status === 'disabled'){
      return "Enable User";
    } else {
      return "Disable User";
    }
  },
  disabledIfDisabled: function () {
    if(this.state && this.state.status && this.state.status === 'disabled'){
      return "disabled"
    } else {
      return "";
    }
  },
  showSingleUser: function () {
    return Session.equals("showSingleUserDashboard", true);
  },
  persona_info: function () {
    return Session.equals("persona_info_exists", true);
  }
});
Template.Users.events({
  'submit form': function (e) {
    e.preventDefault();

    let _handleSignup = ( template ) => {
      let user = {
        email: template.find( '[name="emailAddress"]' ).value,
        password: template.find( '[name="password"]' ).value
      };

      Accounts.createUser( user, ( error ) => {
        if ( error ) {
          Bert.alert( error.reason, 'danger' );
        } else {
          Bert.alert( 'Welcome!', 'success' );
        }
      });
    };
  },
  'click .disable-enable-user': function (e) {
    console.log("got remove");

    let self = this;

    let toggleState;

    if(self.state && self.state.status && self.state.status === 'disabled'){
      toggleState = 'enabled';
    } else {
      toggleState = 'disabled';
    }

    swal({
      title: "Are you sure?",
      text: "Are you sure you want to " +  toggleState.slice(0, -1) + " this user?",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Yes",
      cancelButtonText: "Nevermind",
      closeOnConfirm: false,
      closeOnCancel: true,
      showLoaderOnConfirm: true
    }, function(isConfirm) {
      if (isConfirm) {

        Meteor.call( 'set_user_state', self._id, toggleState, function( error, response ) {
          if ( error ) {
            console.log(error);
            swal("Error", "Something went wrong", "error");
          } else {
            console.log(response);
            swal({title: "Done", text: "The user was " + toggleState + ".", type: 'success'}, function(){
              // self.state.status === 'enabled' because self is a copy of the
              // data that was set when we started this call
              if(self.state.status === 'enabled' &&
                Session.equals("showSingleUserDashboard", true)){
                $(".cancel-button").click();
              }
            });
          }
        });
      }
    });

  },
  'click .addRole': function (e) {
    console.log("got addRole")
  },
  'click .addingNewUser': function ( e ){
    e.preventDefault();
    let addingNew = $(".addingNewUser").data("add");
    Session.set("addingNew", addingNew);
  },
  'click .addingNewRole': function ( e ){
    e.preventDefault();
    let addingNew = $(".addingNewRole").data("add");
    Session.set("addingNew", addingNew);
  },
  'click .edit-user': function () {
    //setup modal for entering give toward information
    Session.set('params.userID', this._id);
  },
  'click .forgot-password': function (e) {
    let resetButton = $(e.currentTarget).button('loading');
    let self = this;

    swal({
        title: "Are you sure?",
        text: "Are you sure you want to send a password reset to this user?",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes, send it!",
        cancelButtonText: "Nevermind",
        closeOnConfirm: false,
        closeOnCancel: true,
        showLoaderOnConfirm: true
      }, function(isConfirm) {
      if (isConfirm) {
        Accounts.forgotPassword(
          {
            email: self.emails[0].address
          }, function ( err, res ) {
            swal("Sent", "The user was sent a password reset email.", 'success');
            resetButton.button( 'reset' );
          } );
      } else {
        resetButton.button( 'reset' );
      }
    });
  },
  'click .cancel-button': function () {
    console.log("Clicked cancel");
    Session.delete("activeTab");

    if(Router.current().params.query && Router.current().params.query.userID){
      Router.go('Users');
    }
    Session.set("addingNew", false);
    Session.delete("params.userID");
    Session.delete("showSingleUserDashboard");
    Session.delete("got_all_donations");
    Session.delete("NotDTUser");
    Session.delete("persona_info_exists");
  }
});

Template.Users.onCreated(function () {
  let self = this;
  self.autorun(function () {
    if(Session.get("params.userID")) {
      if( Meteor.users.findOne( { _id: Session.get( "params.userID" ) } ) &&
        Meteor.users.findOne( { _id: Session.get( "params.userID" ) } ).persona_info ) {
        Session.set( "persona_info_exists", true );
      } else {
        Session.set( "persona_info_exists", false );
      }
    }
  });

});
