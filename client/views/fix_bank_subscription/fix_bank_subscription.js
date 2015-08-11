Template.FixBankSubscription.onRendered(function(){


    Session.setDefault('isRepair', true);
    Session.set('update_this_card', Customers.findOne().sources.data[0].id);

    if(Subscriptions.findOne().status === 'past_due' || Subscriptions.findOne().status === 'canceled'){
        Session.set('addingNewCreditCard', true);
    } else{
        Session.set('addingNewCreditCard', false);
    }

    $('#resubscribe').parsley();
    $('select').select2({dropdownCssClass: 'dropdown-inverse'});

    $("[name='square-switch']").bootstrapSwitch();
});

Template.FixBankSubscription.events({
    'submit form': function(e){
        e.preventDefault();
        // In order to account for the possibility of our customer resubscribing
        // with a new credit card, we need to check whether or not they're doing that.
        var opts = {color: '#FFF', length: 60, width: 10, lines: 8};
        var target = document.getElementById('spinContainer');
        spinnerObject = new Spinner(opts).spin(target);

        var update_this = {
            customer_id: Customers.findOne()._id,
            subscription_id: Subscriptions.findOne()._id,
            status: Subscriptions.findOne().status,
            bank: Customers.findOne().default_source
        };
        var resubscribeButton   = $(".resubscribe").button('loading');

        Meteor.call("stripeRestartBankSubscription", update_this, function(error, response){
            if (error){
                console.dir(error);
                resubscribeButton.button("reset");
                Bert.alert(error.message, "danger");
            } else {
                // If we're resubscribed, go ahead and confirm by returning to the
                // subscriptions page and show the alert
                resubscribeButton.button("reset");
                if(response === 'new'){
                    Bert.alert("Successfully activated your recurring gift. Thank you!", "success");
                } else{
                    Bert.alert("Successfully updated your card. Thank you!", "success");
                }
                Router.go('subscriptions');
            }
        });

    },
    'click .add-new-card': function(){
        Session.set('addingNewCreditCard', true);
    },

    'click .cancel-new-card': function(e){
        e.preventDefault();
        $('form#resubscribe').unbind('submit');
        Session.set('addingNewCreditCard', false);

    }
});

Template.FixBankSubscription.helpers({
    subscription: function () {
        return Subscriptions.findOne();
    },
    customer: function () {
        return Customers.findOne();
    },
    customer_device: function () {
        var return_these = {};
        if(Customers.findOne().sources.data[0].bank_name){
            return_these.brand = Customers.findOne().sources.data[0].bank_name;
        }
        return_these.last4 = Customers.findOne().sources.data[0].last4;
        return return_these;
    },
    isRepair: function () {
        return Session.get('isRepair');
    },
    addNewCard: function () {
        return Session.get('addingNewCreditCard');
    },
    expired_class: function () {
        if(Stripe.card.validateExpiry(Customers.findOne().sources.data[0].exp_month), Customers.findOne().sources.data[0].exp_year){
            return;
        } else {
            return 'redText';
        }
    },
    addNew: function () {
        if(Session.equals('addingNewCreditCard', true)){
            return true;
        } else {
            return false;
        }
    }
});