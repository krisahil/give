Template.SubscriptionsOverview.rendered = function() {
    Session.setDefault('paymentMethod', 'default');
    Session.setDefault('subscription_cursor', 0);


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
        var subscription_page = Session.get('subscription_cursor');
        var subscriptions = Subscriptions.find();
        Session.set("number_of_subscriptions", subscriptions.count());
        return Subscriptions.find({}, {sort: {status: 1, start: -1}, limit: 4, skip: subscription_page});
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
    },
    frequency: function () {
        return this.plan.id;
    },
    number_of_subscriptions: function () {
        if(Session.get("number_of_subscriptions") > 4){
            return true;
        } else {
            return false;
        }
    },
    card_subscription: function () {
        // check to see if this subscription uses a bank account
        if(this.metadata && this.metadata.donateWith === 'Check'){
            return false;
        } else if(this.metadata && this.metadata.donateWith && this.metadata.donateWith.slice(0,2) == 'ba'){
            return false;
        } if(this.metadata && !this.metadata.donateWith){
            return false;
        } else {
            return true;
        }
    },
    show_donate_with: function () {
        if(this.metadata && this.metadata.donateWith === 'Check' || this.metadata && this.metadata.donateWith && this.metadata.donateWith.slice(0,2) == 'ba'){
            return 'Bank Account';
        } else if(this.metadata && this.metadata.donateWith === 'Card' || this.metadata && this.metadata.donateWith && this.metadata.donateWith.slice(0,2) == 'ca') {
            return 'Card';
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
        }, function(inputValue){

            if (inputValue === "") {
                inputValue = "Not specified";
            }

            if (inputValue === false){
                swal("Ok, we didn't do anything.", "Your recurring gift is still active :)",
                    "success");
            } else if (inputValue) {
                console.log(inputValue);
                console.log(subscription_id);
                console.log(customer_id);
                Meteor.call("stripeCancelSubscription", customer_id, subscription_id, inputValue, function(error, response){
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
            }
        });

    },
    'click .previous': function(evt, tmpl){
        evt.preventDefault();
        evt.stopPropagation();
        if(Number(Session.get('subscription_cursor')> 3)){
            Session.set('subscription_cursor', Number(Session.get('subscription_cursor')-4));
        }
    },
    'click .next': function(evt, tmpl){
        evt.preventDefault();
        evt.stopPropagation();
        Session.set('subscription_cursor', Number(Session.get('subscription_cursor')+4));
    }
});