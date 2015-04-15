Meteor.methods({
    stripeUpdateSubscription: function (customer_id, subscription_id, token_id) {
        // Check our arguments against their expected patterns. This is especially
        // important here because we're dealing with sensitive customer information.
        check(subscription_id, String);
        check(token_id, String);
        check(customer_id, String);

        var updated_subscription = Utils.update_stripe_customer_subscription(customer_id, subscription_id, token_id);
        if(!updated_subscription.object){
            return {error: updated_subscription.rawType, message: updated_subscription.message};
        }
        else {
            return 'success';
        }

    },
    stripeUpdateCard: function (updated_data) {
        // Check our arguments against their expected patterns. This is especially
        // important here because we're dealing with sensitive customer information.
        check(updated_data, {
            customer: String,
            card: String,
            exp_month: String,
            exp_year: String
        });

        var updated_card = Utils.update_stripe_customer_card(updated_data);
        if (!updated_card.object) {
            return {error: updated_card.rawType, message: updated_card.message};
        } else{
            return 'success';
        }
    },
    //TODO: update this method to work with the subscriptions page
    stripeCancelSubscription: function () {
        // Because Stripe's API is asynchronous (meaning it doesn't block our function
        // from running once it's started), we need to make use of the Fibers/Future
        // library. This allows us to create a return object that "waits" for us to
        // return a value to it.
        var stripeCancelSubscription = new Future();

        // Before we jump into everything, we need to get our customer's ID. Recall
        // that we can't send this over from the client because we're *not* publishing
        // it to the client. Instead, here, we take the current userId from Meteor
        // and lookup our customerId.
        var user = Meteor.userId();
        var getUser = Meteor.users.findOne({"_id": user}, {fields: {"customerId": 1}});

        // Once we have our customerId, call to Stripe to cancel the active subscription.
        Stripe.customers.cancelSubscription(getUser.customerId, {
            at_period_end: true
        }, function (error, response) {
            if (error) {
                stripeCancelSubscription.return(error);
            } else {
                // Because we're running Meteor code inside of another function's callback, we need to wrap
                // it in a Fiber. Note: this is a verbose way of doing this. You could refactor this
                // and the call to Stripe to use a Meteor.wrapAsync method instead. The difference is
                // that while wrapAsync is cleaner syntax-wise, it can be a bit confusing. To keep
                // things simple, we'll stick with a Fiber here.
                Fiber(function () {
                    var update = {
                        auth: SERVER_AUTH_TOKEN,
                        user: user,
                        subscription: {
                            status: response.cancel_at_period_end ? "canceled" : response.status,
                            ends: response.current_period_end
                        }
                    }
                    Meteor.call('updateUserSubscription', update, function (error, response) {
                        if (error) {
                            stripeCancelSubscription.return(error);
                        } else {
                            stripeCancelSubscription.return(response);
                        }
                    });
                }).run();
            }
        });

        return stripeCancelSubscription.wait();
    }
});