_.extend(StripeFunctions, {
  'control_flow_of_stripe_event_processing': function ( request ) {

    // Get this event from Stripe so we know it wasn't malicious or tampered with
    var stripe_request = StripeFunctions.retrieve_stripe_event( request );
    console.log("Finished retrieve_stripe_event");

    // Check to see if there are any reasons you wouldn't store this event


    // If it passes the checks, store the event in the right collection
    StripeFunctions.store_stripe_event(stripe_request);


    if( stripe_request ){
      // Send the event to the proper event type
      var event = Stripe_Events[stripe_request.type]( stripe_request );
    } else {
      // Return since this event either had an error, or it didn't come from Stripe
      console.log("Exiting control flow, since the event errored, or didn't come from Stripe");
      return;
    }

  },
  'retrieve_stripe_event': function ( webhookEvent ) {
    console.log("Started retrieve_stripe_event");
    console.log("Event ID: ", webhookEvent.id);

    // For security purposes, let's verify the event by retrieving it from Stripe.
    var stripeEvent = new Promise(function (resolve, reject) {
        Stripe.events.retrieve(
          webhookEvent.id,
          function (err, res) {
            if (err) reject("There was a problem", err);
            else resolve(res);
          });
      });

    // Fulfill Promise
    return stripeEvent.await(
      function (res) {
        // Check to see if it violates an out of order rule
        console.log(res);
        return res;
      }, function(err) {
        // TODO: if there is a a problem we need to resolve this since the event won't be sent again
        console.log(err);
        throw new Meteor.Error("Error from Stripe event retrieval Promise", err);
    });

  },
  'does_this_charge_event_violate_an_out_of_order_rule': function(request_object) {
    console.log("Started does_this_event_violate_an_out_of_order_rule");

    // Use this function to check to see if this event violates an out of order rule
    console.log(request_object);

    // Find the stored event
    var charge_cursor = Charges.findOne({_id: request_object.id});
    console.log(charge_cursor.id);


    // Since we really only care if the event goes from succeeded to pending we
    // really only need to run this test if this event's status is pending
    var check_violation =
    charge_cursor &&
    charge_cursor.status &&
    charge_cursor.status === 'succeeded' ?
      true :
      false;
    console.log(check_violation);

    return check_violation;
  },
  store_stripe_event: function (event_body) {
    logger.info("Started store_stripe_event");

    logger.info(event_body.data.object.id);
    event_body.data.object._id = event_body.data.object.id;

    switch(event_body.data.object.object){
      case "customer":
        if(event_body.data.object.metadata['balanced.customer_id']){
          event_body.data.object.metadata['balanced_customer_id'] = event_body.data.object.metadata['balanced.customer_id'];
          delete event_body.data.object.metadata['balanced.customer_id'];
        }

        console.log(event_body.data.object);
        Customers.upsert({_id: event_body.data.object.id}, event_body.data.object);
        break;
      case "invoice":
        Invoices.upsert({_id: event_body.data.object.id}, event_body.data.object);
        break;
      case "charge":
        Charges.upsert({_id: event_body.data.object.id}, event_body.data.object);
        break;
      case "payment":
        Charges.upsert({_id: event_body.data.object.id}, event_body.data.object);
        break;
      case "card":
        Devices.upsert({_id: event_body.data.object.id}, event_body.data.object);
        var result_of_update = Customers.update({_id: event_body.data.object.customer, 'sources.data.id': event_body.data.object.id}, {$set: {'sources.data.$': event_body.data.object}});
        break;
      case "bank_account":
        Devices.upsert({_id: event_body.data.object._id}, event_body.data.object);
        break;
      case "subscription":
        Subscriptions.upsert({_id: event_body.data.object._id}, event_body.data.object);
        break;
      default:
        logger.error("This event didn't fit any of the configured cases, go into store_stripe_event and add the appropriate case.");

    }

  },
  'this_is_a_charge_event': function () {

  },
  'this_is_a_customer_event': function () {

  },
  'audit_this_charge_event': function () {

  },
  'audit_this_customer_event': function () {

  },
  'get_audit_status': function (){

  },
  'is_this_even_a_duplicate_of_one_we_have_already_processed': function () {
    // Use this function to check that the event hasn't already been processed

  }
});