Template.FixSubscription.rendered = function(){

    Session.setDefault('isRepair', true);


    $("#resubscribe").validate({
        rules: {
            cardNumber: {
                creditcard: true,
                required: true
            },
            expMo: {
                required: true
            },
            expYr: {
                required: true
            },
            cvc: {
                required: true
            }
        },
        messages: {
            cardNumber: {
                creditcard: "Please enter a valid credit card.",
                required: "Required."
            },
            expMo: {
                required: "Required."
            },
            expYr: {
                required: "Required."
            },
            cvc: {
                required: "Required."
            }
        },
        submitHandler: function(){
            // In order to account for the possibility of our customer resubscribing
            // with a new credit card, we need to check whether or not they're doing that.
                var update_this = {customer: Customers.findOne()._id, card: Session.get('update_this_card'), exp_month: $('[name="expMo"]').val(), exp_year: $('[name="expYr"]').val()};
                var addingNewCreditCard = Session.get('addingNewCreditCard');
                var resubscribeButton   = $(".resubscribe").button('loading');


            if (addingNewCreditCard){
                // If we're adding a new card, grab our card data from the template.
                var card = {
                    number: $('[name="cardNumber"]').val(),
                    exp_month: $('[name="expMo"]').val(),
                    exp_year: $('[name="expYr"]').val(),
                    cvc: $('[name="cvc"]').val()
                };

                Stripe.card.createToken(card,  function(status, response){
                    if (response.error) {
                        //error logic here
                        App.handleErrors(response.error);
                    } else {
                        // Call your backend
                        console.dir(response);
                        var subscription_id = Subscriptions.findOne()._id;
                        var customer_id = Customers.findOne()._id;

                        // Call our stripeSwipeCard method to replace our customer's existing
                        // card with the new card they've specified.
                        Meteor.call("stripeUpdateSubscription", customer_id, subscription_id, response.id, function(error, response){
                            if (error){
                                console.dir(error);
                                resubscribeButton.button("reset");
                                Bert.alert(error.message, "danger");
                            } else {
                                // If we're resubscribed, go ahead and confirm by returning to the
                                // billing overview page and showing an alert message.
                                resubscribeButton.button("reset");
                                Bert.alert("Successfully fixed your gift. Thank you!", "success");
                                Router.go('subscriptions');
                            }
                        });
                    }
                });

            } else {
                Meteor.call("stripeUpdateCard", update_this, function(error, response){
                    if (error){
                        resubscribeButton.button("reset");
                        Bert.alert(error.message, "danger");
                    } else {
                        // If we're resubscribed, go ahead and confirm by returning to the
                        // subscriptions page and show the alert
                        resubscribeButton.button("reset");
                        Bert.alert("Successfully updated your card. Thank you!", "success");
                        Router.go('subscriptions');
                    }
                });
            }
        }
    });
}

Template.FixSubscription.events({
    'submit form': function(e){
        e.preventDefault();

    },
    'click .add-new-card': function(){
        Session.set('addingNewCreditCard', true);
    },

    'click .cancel-new-card': function(){
        Session.set('addingNewCreditCard', false);
    }
});

Template.FixSubscription.helpers({
    subscription: function () {
        return Subscriptions.find();
    },
    customer: function () {
        return Customers.findOne();
    },
    customer_device: function () {
        var return_these = {};
        if(Customers.findOne().sources.data[0].brand){
            return_these.brand = Customers.findOne().sources.data[0].brand;
            return_these.exp_month = Customers.findOne().sources.data[0].exp_month;
            return_these.exp_year = Customers.findOne().sources.data[0].exp_year;
        } else{
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
    }
});