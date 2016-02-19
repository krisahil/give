Template.AddRole.helpers({
  roles: function () {
    console.log(Meteor.roles.find().fetch());
    return Meteor.roles.find();
  },
  roleName: function () {
    return '<label class="label label-success">' + this.name + '</label>';
  }
});

Template.AddRole.events( {
  'submit form': function ( e ) {
    e.preventDefault();

    let roleName = $("#roleName").val();
    if(Router.current().route.getName() === 'User') {
      var add_to =  FlowRouter.getParam("_id");
    }
    Meteor.call("addRole", roleName, add_to ? add_to : '', function (err, res) {
      if(err) {
        console.log(err);
        toastr.error(err);
      } else {
        toastr.success(res);
        $("#roleName").val("");
      }
    });
  },
  'click .cancel-button': function () {
    console.log("Clicked cancel");
    Session.set("addingNew", false);
  }
});
