// This file is for functions related to the processing of charge events
// This file should answer these questions
// 1. Does this charge event also require a new donation to be created in DonorTools?
// 2. Does this charge event require a change in status in DonorTools?
// 3. Has the customer been notified that we received their gift request (pending)?
// 4. Has the customer been receipted for their gift (successful)?
// 5. Has the customer been notified of a problem with their gift (failed)?
_.extend(Utils, {

  audit_charge: function ( charge_id, status ) {
    logger.info( "Started audit_charge" );
    logger.info( "Charge_id: " + charge_id );

    Audit_trail.upsert( { _id: charge_id }, {
      $set: {
        dt_donation_created: true, status: {
          dt_donation_status_updated_to: status,
          time: moment().format( "MMM DD, YYYY hh:mma" )
        }
      }
    } );

    Utils.update_dt_status( charge_id, status, 1 );
    //Utils.post_donation_operation( customer_id, charge_id );
  },
  charge_events: function(stripeEvent){
    logger.info("Started charge_events");

    var sync_request = Utils.store_stripe_event(stripeEvent);

    var frequency_and_subscription;
    if(stripeEvent.data.object.invoice) {
      // Now send these changes off to Stripe to update the record there.
      // Utils.update_charge_metadata(stripeEvent);

      // Get the frequency_and_subscription of this charge, since it is part of a subscription.
      frequency_and_subscription = Utils.get_frequency_and_subscription(stripeEvent.data.object.invoice);
      if(frequency_and_subscription){
        Utils.send_donation_email(true, stripeEvent.data.object.id, stripeEvent.data.object.amount, stripeEvent.type,
          stripeEvent, frequency_and_subscription.frequency, frequency_and_subscription.subscription);
        return;
      } else {
        // null frequency_and_subscription means that either the frequency or the subscription couldn't be found using the invoice id.
        throw new Meteor.error("This event needs to be sent again, since we couldn't find enough information to send an email.");
        return;
      }
    } else {
      Utils.send_donation_email(false, stripeEvent.data.object.id, stripeEvent.data.object.amount, stripeEvent.type,
        stripeEvent, "One Time", null);
      return;
    }
  }

});