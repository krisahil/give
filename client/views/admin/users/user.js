Template.User.helpers({
  edit_user: function () {
    const _id = FlowRouter.getParam("_id");
    console.log(_id);
    return Meteor.users.findOne({_id: _id});
  },
  roles: function () {
    const _id = FlowRouter.getParam("_id");

    return Meteor.users.findOne({_id: _id}) &&
      Meteor.users.findOne({_id: _id}).roles;
  },
  timelineSide: function (index) {
    if(index % 2){
      return 'timeline-inverted';
    } else {
      return '';
    }
  },
  roleName: function () {
    let role = this;
    return '<label class="label label-success">' + role + '</label> ';
  }
});

Template.User.events({
  'click .nav-tabs a': function (e) {
    e.preventDefault();
    $( e.currentTarget ).tab( 'show' );
  },
  'click .adding-new': function ( e ){
    e.preventDefault();
    let addingNew = $(".adding-new").data("add");
    Session.set("addingNew", addingNew);
  },
  'click .cancel-button': function () {
    console.log("Clicked cancel");
    Session.set("addingNew", false);
  },
  'click .addNewSkill': function ( e ){
    e.preventDefault();
    let addingNew = $(".addNewSkill").data("add");
    Session.set("addingNew", addingNew);
  }
});

Template.User.onRendered( function() {
  $('[name="date.taken"]').datepicker({
    pickTime: false,
    format: 'YYYY-MM-DD'
  });

  if(Session.get("lastDate")){
    $("[name='date.taken']").val(Session.get("lastDate"));
    //console.log($("[name='date.taken']").val());
  }
});