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
            var created_subscription = Utils.stripe_create_subscription(customer_id, token_id, subscription_plan, subscription_amount, subscription_metadata);
            console.log(created_subscription)
            if(!created_subscription.object){
                return {error: created_subscription.rawType, message: created_subscription.message};
            }
            else {
                Subscriptions.update({_id: subscription_id}, {$set: {'metadata.replaced': true, 'metadata.replaced_with': created_subscription._id}});
                return 'success';
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
                        Subscriptions.update({_id: updated_data.subscription_id}, {$set: {'metadata.replaced': true, 'metadata.replaced_with': created_subscription._id}});
                        return 'new';
                    }
                }
            } else {
                var updated_card = Utils.update_stripe_customer_card(updated_data);
                // Store the updated information with both the device and the customer records that use that device.
                Devices.update({_id: updated_card.id}, updated_card);
                var result_of_update = Customers.update({_id: updated_card.customer, 'sources.data.id': updated_card.id}, {$set: {'sources.data.$': updated_card}});

                if (!updated_card.object) {
                    return {error: updated_card.rawType, message: updated_card.message};
                } else {
                    return 'success';
                }
            }
    },
    stripeUpdateBank: function (bank, subscription_id, save_payment) {
      logger.info("Started method stripeUpdateBank.");

      // Check our arguments against their expected patterns. This is especially
      // important here because we're dealing with sensitive customer information.
      check(bank, String);
      check(subscription_id, String);
      check(save_payment, Boolean);

      try {
        let subscription = Subscriptions.findOne({_id: subscription_id});
        let subscription_amount =     subscription.quantity;
        let subscription_status =     subscription.status;
        let subscription_metadata =   subscription.metadata;
        let subscription_plan =       subscription.plan.name;
        let customer_id =             subscription.customer;
        let bank_token =              bank;

        if (subscription_status === 'canceled') {
          var updated_bank = Utils.update_stripe_customer_bank(customer_id, bank, save_payment);
          if (!updated_bank.object) {
            return {error: updated_bank.rawType, message: updated_bank.message};
          } else {
            // TODO: metadata: {saved: saved} add this to the newly created bank_account

            var created_subscription = Utils.stripe_create_subscription(customer_id, bank, subscription_plan, subscription_amount, subscription_metadata);
            if (!created_subscription.object) {
              return {error: created_subscription.rawType, message: created_subscription.message};
            }
            else {
              Subscriptions.update({_id: subscription_id}, {$set: {'metadata.replaced': true, 'metadata.replaced_with': created_subscription._id}});
              return 'new';
            }
          }
        } else {
          // update_stripe_customer_subscription
          //var updated_bank = Utils.update_stripe_customer_bank(customer_id, bank, save_payment);
          let updated_bank = Utils.update_stripe_customer_bank(customer_id, bank_token);
          Utils.update_stripe_bank_metadata(customer_id, updated_bank.id, save_payment);
          Utils.update_stripe_customer_default_source(customer_id, updated_bank.id);


          if (!updated_bank.object) {
            return {error: updated_bank.rawType, message: updated_bank.message};
          } else {
            return 'success';
          }
        }
      } catch(e) {
        console.log(e);
        throw new Meteor.Error(e.statusCode, e.message, e.type);
      }

    },
    stripeRestartBankSubscription: function (restart_data) {
        logger.info("Started method stripeUpdateCard.");

        // Check our arguments against their expected patterns. This is especially
        // important here because we're dealing with sensitive customer information.
        check(restart_data, {
            customer_id: String,
            subscription_id: String,
            status: String,
            bank: String
        });
        console.log(restart_data.status);

        if(restart_data.status === 'canceled') {
            var subscription_amount = Subscriptions.findOne({_id: restart_data.subscription_id}).quantity;
            var subscription_metadata = Subscriptions.findOne({_id: restart_data.subscription_id}).metadata;
            var subscription_plan = Subscriptions.findOne({_id: restart_data.subscription_id}).plan.name;

            var created_subscription = Utils.stripe_create_subscription(restart_data.customer_id, restart_data.bank, subscription_plan, subscription_amount, subscription_metadata);
            if (!created_subscription.object) {
                return {error: created_subscription.rawType, message: created_subscription.message};
            }
            else {
                Subscriptions.update({_id: restart_data.subscription_id}, {$set: {'metadata.replaced': true, 'metadata.replaced_with': created_subscription._id}});
                return 'new';
            }
        } else {
            throw new Meteor.Error(500, "This gift is already not in the canceled state");
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

    },
    get_all_donations_for_this_donor: function() {
      logger.info("Started method get_all_donations_for_this_donor.");
      if(this.userId){
        this.unblock();

        let persona_ids = Meteor.user() && Meteor.user().persona_ids;
        console.log(persona_ids);

        if(persona_ids.length && persona_ids.length > 1){
          Utils.get_all_dt_donations(persona_ids);
          return "got em";
        } else {
          return "no persona_ids found";
        }
      } else {
        return;
      }
    }

});