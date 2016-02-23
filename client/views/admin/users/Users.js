Template.Users.helpers({
  users: function () {
    return Meteor.users.find();
  },
  roleName: function () {
    let role = this;
    return '<label class="label label-success">' + role + '</label>';
  },
  editUser: function () {
    return false;
  },
  disabledUserFA: function () {
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
    e.preventDefault();
    console.log("got remove");

    let toggleState;

    if(this.state && this.state.status && this.state.status === 'disabled'){
      toggleState = 'enabled';
    } else {
      toggleState = 'disabled';
    }
    Meteor.call( 'set_user_state', this._id, toggleState, function( error, response ) {
      if ( error ) {
        Bert.alert( error.reason, 'warning' );
      } else {
        Bert.alert( response, 'success' );
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
    Router.go('/dashboard/edit_user/' + this._id);
  },
  'click .forgot-password': function (e) {
    let resetButton = $(e.currentTarget).button('loading');
    Accounts.forgotPassword(
      {
        email: this.emails[0].address
      }, function (err, res){
        console.log(err, res);
        Bert.alert( 'Password Reset Email Sent', 'success', 'growl-top-right' );
        resetButton.button('reset');
      });
  }
});

Template.Users.onCreated(function () {
  let self = this;
  self.autorun(function() {
    self.subscribe('roles');
    self.subscribe('users');
  });
});

