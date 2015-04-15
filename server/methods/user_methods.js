Meteor.methods({
    stripeUpdateSubscription: function (customer_id, subscription_id, token_id, status) {
        logger.info("Started method stripeUpdateSubscription.");

        // Check our arguments against their expected patterns. This is especially
        // important here because we're dealing with sensitive customer information.
        check(customer_id, String);
        check(subscription_id, String);
        check(token_id, String);
        check(status, String);

        if(status === 'canceled'){
            var subscription_amount = Subscriptions.findOne({_id: subscription_id}).quantity;
            var subscription_metadata = Subscriptions.findOne({_id: subscription_id}).metadata;
            var subscription_plan = Subscriptions.findOne({_id: subscription_id}).plan.name;
            var created_subscription = Utils.create_stripe_subscription(customer_id, token_id, subscription_plan, subscription_amount, subscription_metadata);
            if(!created_subscription.object){
                return {error: created_subscription.rawType, message: created_subscription.message};
            }
            else {
                var updated_subscription = Utils.update_stripe_canceled_customer_subscription(customer_id, subscription_id);
                if(!updated_subscription.object){
                    return {error: updated_subscription.rawType, message: updated_subscription.message};
                }
                else {
                    return 'success';
                }
            }
        } else{
            var updated_subscription = Utils.update_stripe_customer_subscription(customer_id, subscription_id, token_id);
            if(!updated_subscription.object){
                return {error: updated_subscription.rawType, message: updated_subscription.message};
            }
            else {
                return 'success';
            }
        }

    },
    stripeUpdateCard: function (updated_data) {
        logger.info("Started method stripeUpdateCard.");

        // Check our arguments against their expected patterns. This is especially
        // important here because we're dealing with sensitive customer information.
        check(updated_data, {
            customer_id: String,
            subscription_id: String,
            status: String,
            card: String,
            exp_month: String,
            exp_year: String
        });
        console.log(updated_data.status);

        if(updated_data.status === 'canceled') {
            var subscription_amount = Subscriptions.findOne({_id: updated_data.subscription_id}).quantity;
            var subscription_metadata = Subscriptions.findOne({_id: updated_data.subscription_id}).metadata;
            var subscription_plan = Subscriptions.findOne({_id: updated_data.subscription_id}).plan.name;
            if (updated_data.status === 'canceled') {
                var updated_card = Utils.update_stripe_customer_card(updated_data);
                if (!updated_card.object) {
                    return {error: updated_card.rawType, message: updated_card.message};
                } else {
                    var created_subscription = Utils.stripe_create_subscription(updated_data.customer_id, updated_data.card, subscription_plan, subscription_amount, subscription_metadata);
                    if (!created_subscription.object) {
                        return {error: created_subscription.rawType, message: created_subscription.message};
                    }
                    else {
                        Subscriptions.update({_id: updated_data.subscription_id}, {$set: {'metadata.replaced': true}});
                        return 'new';
                    }
                }
            } else {
                var updated_card = Utils.update_stripe_customer_card(updated_data);
                if (!updated_card.object) {
                    return {error: updated_card.rawType, message: updated_card.message};
                } else {
                    return 'success';
                }
            }
        }
    },
    //TODO: update this method to work with the subscriptions page
    stripeCancelSubscription: function (customer_id, subscription_id, reason) {
        logger.info("Started method stripeCancelSubscription.");

        // Check our arguments against their expected patterns. This is especially
        // important here because we're dealing with sensitive customer information.
        check(customer_id, String);
        check(subscription_id, String);
        check(reason, String);

        var cancel_subscription = Utils.cancel_stripe_subscription(customer_id, subscription_id, reason);
        if (!cancel_subscription.object) {
            return {error: cancel_subscription.rawType, message: cancel_subscription.message};
        } else{
            return 'success';
        }

    }
});