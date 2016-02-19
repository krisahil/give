Template.Users.helpers({
  users: function () {
    return Meteor.users.find();
  },
  roleName: function () {
    let role = this;
    return '<label class="label label-success">' + role + '</label>';
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
  'click .disable-user': function (e) {
    e.preventDefault();
    console.log("got remove");
    let btn = $(e.currentTarget);

    btn.button('loading');

    let _id = btn.data('_id');

    console.log(_id);

    Meteor.call( 'removeUser', _id, function( error, response ) {
      if ( error ) {
        btn.button('reset');
        Bert.alert( error.reason, 'warning' );
      } else {
        btn.button('reset');
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
    FlowRouter.go('user', {_id: this._id});
  }
});

Template.Users.onCreated(function () {
  let self = this;
  self.autorun(function() {
    self.subscribe('roles');
    self.subscribe('users');
  });
});

