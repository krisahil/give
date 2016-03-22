Template.Dashboard.helpers({
  showGetStripeEvent: function() {
    return Session.get("showGetStripeEvent");
  },
  showFixNoUser: function() {
    return Session.get("showFixNoUser");
  }
});

Template.Dashboard.events({
  'click #new-gift': function(evt) {
    evt.preventDefault();
    $('#modal_for_admin_give_form').modal({
      show: true,
      backdrop: 'static'
    });
  },
  'click #move-gift': function(evt) {
    evt.preventDefault();
    $('#modal_for_admin_move_gift').modal({
      show: true,
      backdrop: 'static'
    });
  },
  'click #show-get-stripe-event': function(evt) {
    evt.preventDefault();
    Session.set("showGetStripeEvent", true);
  },
  'click #show-fix-no-user': function(evt) {
    evt.preventDefault();
    Session.set("showFixNoUser", true);
  },
  'click #get-dt-funds': function(e) {
    // prevent the default reaction to submitting this form
    e.preventDefault();
    // Stop propagation prevents the form from being submitted more than once.
    e.stopPropagation();

    $("#get-dt-funds").button('loading');

    Meteor.call("get_dt_funds", function(error, result) {
      if (result) {
        $("#get-dt-funds").button('reset');
        Bert.alert( "Got all funds", 'success', 'growl-top-right' );
      } else {
        Bert.alert( error.message, 'danger', 'growl-top-right' );
      }
    });
  },
  'click #get-dt-sources': function(e) {
    // prevent the default reaction to submitting this form
    e.preventDefault();
    // Stop propagation prevents the form from being submitted more than once.
    e.stopPropagation();
    $("#get-dt-sources").button('loading');

    Meteor.call("get_dt_sources", function(error, result) {
      if (result) {
        $("#get-dt-sources").button('reset');
        Bert.alert( "Got all sources", 'success', 'growl-top-right' );
      } else {
        Bert.alert( error.message, 'danger', 'growl-top-right' );
      }
    });
  },
  'click #store-all-refunds': function(e) {
    // prevent the default reaction to submitting this form
    e.preventDefault();
    // Stop propagation prevents the form from being submitted more than once.
    e.stopPropagation();

    Meteor.call("store_all_refunds", function(error, result) {
      if (result) {
        Bert.alert("Got 'em.", 'success');
      }
    });
  },
  'click #merge-dt-persona': function(e) {
    // prevent the default reaction to submitting this form
    e.preventDefault();
    // Stop propagation prevents the form from being submitted more than once.
    e.stopPropagation();

    console.log("Started merge-dt-persona");
    $('#modal_for_admin_merge_persona').modal({
      show: true,
      backdrop: 'static'
    });
  }
});