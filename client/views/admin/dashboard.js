Template.Dashboard.helpers({
  showGetStripeEvent: function(){
    return Session.get("showGetStripeEvent");
  },
  showFixNoUser: function(){
      return Session.get("showFixNoUser");
  }
});

Template.Dashboard.events({
    'click #get_id': function(e) {
        //prevent the default reaction to submitting this form
        e.preventDefault();
        // Stop propagation prevents the form from being submitted more than once.
        e.stopPropagation();

        Meteor.call("get_balanced_customer_data", $('#stripe_id').val(), function (error, result) {
            if (result) {
                console.dir(result);
                alert("Got it: " + result);
            } else {
                console.log(error);
            }
        });
    },
    'click #new-gift': function(evt){
        evt.preventDefault();
        $('#modal_for_admin_give_form').modal({
            show: true,
            backdrop: 'static'
        });
    },
    'click #move-gift': function(evt){
        evt.preventDefault();
        $('#modal_for_admin_move_gift').modal({
            show: true,
            backdrop: 'static'
        });
    },
    'click #show-get-stripe-event': function(evt){
        evt.preventDefault();
        Session.set("showGetStripeEvent", true);
    },
    'click #show-fix-no-user': function(evt){
        evt.preventDefault();
        Session.set("showFixNoUser", true);
    },
    'click #get-dt-funds': function(e) {
        //prevent the default reaction to submitting this form
        e.preventDefault();
        // Stop propagation prevents the form from being submitted more than once.
        //e.stopPropagation();

        console.log("Got Here");

        Meteor.call("get_dt_funds", function (error, result) {
            if (result) {
                console.dir(result);
                alert("Got 'em.")
            } else {
                console.log(error);
            }
        });
    },
    'click #get-dt-sources': function(e) {
        //prevent the default reaction to submitting this form
        e.preventDefault();
        // Stop propagation prevents the form from being submitted more than once.
        e.stopPropagation();

        console.log("Got Here");

        Meteor.call("get_dt_sources", function (error, result) {
            if (result) {
                console.dir(result);
                alert("Got 'em.")
            } else {
                console.log(error);
            }
        });
    },
    'click #fix-customers': function(e) {
        //prevent the default reaction to submitting this form
        e.preventDefault();
        // Stop propagation prevents the form from being submitted more than once.
        e.stopPropagation();

        console.log("Got Here");

        Meteor.call("fix_saved_device_customers", function (error, result) {
            if (result) {
                console.dir(result);
                alert("Got 'em.")
            } else {
                console.log(error);
            }
        });
    }
});