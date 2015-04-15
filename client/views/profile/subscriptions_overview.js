Template.SubscriptionsOverview.rendered = function() {
    Session.setDefault('paymentMethod', 'default');

    //setup modal for entering give toward information
    if (Session.equals('params.give', 'Yes')) {
        $('#modal_for_user_give_form').modal({
            show: true,
            backdrop: 'static'
        });
    }

};


Template.SubscriptionsOverview.helpers({
    subscriptions: function(){
        return Subscriptions.find();
    },
    plan_name: function() {
        return Subscriptions.findOne().plan.name;
    },
    show_give_form: function () {
        return Session.equals("params.give", "Yes");
    },
    lastFour: function () {
        var device = Devices.findOne({customer: this.customer});
        if(device){
            return " - " + device.last4;
        } else{
            return;
        }
    },
    type: function () {
        var device = Devices.findOne({customer: this.customer});
        if(device){
            if(device.brand){
                return ": " + device.brand;
            } else {
                return ": Bank Acct"
            }
        } else {
            return;
        }
    }
});

Template.SubscriptionsOverview.events({
    'click #cancel_subscription': function () {
        var subscription_id = this.id;
        var customer_id = Subscriptions.findOne({_id: subscription_id}).customer;

        console.log(subscription_id);
        console.log(customer_id);

        swal({
            title: "Are you sure?",
            text: "Please let us know why you are stopping your gift. (optional)",
            type: "input",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, stop it!",
            cancelButtonText: "No",
            closeOnConfirm: false,
            closeOnCancel: false
        }, function(isConfirm) {
            if (isConfirm) {
                console.log(subscription_id);
                console.log(customer_id);
                var reason = $('input').val();
                Meteor.call("stripeCancelSubscription", customer_id, subscription_id, reason, function(error, response){
                    if (error){
                        confirm.button("reset");
                        Bert.alert(error.message, "danger");
                    } else {
                        // If we're resubscribed, go ahead and confirm by returning to the
                        // subscriptions page and show the alert
                        console.log(response);
                        swal("Cancelled", "Your recurring gift has been stopped.", "error");
                    }
                });
            } else {
                swal("Stopped!", "Your recurring gift is still active :)",
                    "success");
            }
        });

    }
});