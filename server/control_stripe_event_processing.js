_.extend(StripeFunctions, {
  'control_flow_of_stripe_event_processing': function ( request ) {

    // Setup locally scoped vars for this function
    let stripe_request, check_for_violation, event, wait_for_DT_update, wait_for_storage ;

    // Get this event from Stripe so we know it wasn't malicious or tampered with
    stripe_request = StripeFunctions.retrieve_stripe_event( request );
    console.log("Finished retrieve_stripe_event");

    // Did this event come from Stripe?
    if( stripe_request ){

      console.log(stripe_request.type);
      // Did it come as a pending charge event?
      if(stripe_request.type === 'charge.pending') {

        // Does it violate an out of order rule?
        check_for_violation = StripeFunctions.does_this_charge_event_violate_an_out_of_order_rule(stripe_request);

        // If yes
        if(check_for_violation) {
          return;
        }
      }

      // Store and wait
      wait_for_storage = StripeFunctions.store_stripe_event(stripe_request);

      // Send the event to the proper event type
      event = Stripe_Events[stripe_request.type]( stripe_request );

      if(stripe_request.data.object.object === 'charge'){
        console.log("Sending to DT");
        // Send the donation change to Donor Tools. This function has a retry built
        // in, so also pass 1 for the interval
        if(DT_donations.findOne({transaction_id: stripe_request.data.object.id})){
          wait_for_DT_update = Utils.update_dt_donation_status( stripe_request, 1 );
        } else {
          StripeFunctions.check_for_necessary_objects_before_inserting_into_dt(stripe_request.data.object.id, stripe_request.data.object.customer, 1);
        }
      } else {
        // TODO: not a charge, need to send to a different area, perhaps customer creation?
        // Customer creation doesn't have a corresponding event normally
        // since it is being created with Stripe.js
        return;

      }
    } else {
      // Return since this event either had an error, or it didn't come from Stripe
      console.log("Exiting control flow, since the event had an error, or didn't come from Stripe");
      return;
    }

  },
  audit_charge: function ( charge_id, status ) {
    logger.info( "Started audit_charge" );
    logger.info( "Charge_id: " + charge_id );

    let wait_for_audit_store =  Audit_trail.upsert( { _id: charge_id }, {
      $set: {
        dt_donation_created: true, status: {
          dt_donation_status_updated_to: status,
          time: moment().format( "MMM DD, YYYY hh:mma" )
        }
      }
    } );

    console.log(wait_for_audit_store);
    return wait_for_audit_store;
    //Utils.post_donation_operation( customer_id, charge_id );
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
        console.log(res);
        return res;
      }, function(err) {
        // TODO: if there is a a problem we need to resolve this since the event won't be sent again
        console.log(err);
        throw new Meteor.Error("Error from Stripe event retrieval Promise", err);
    });

  },
  'get_invoice': function ( invoice_id ) {
    console.log("Started get_invoice");
    console.log("Invoice ID: ", invoice_id );

    // Get the invoice from Stripe
    var invoice = new Promise(function (resolve, reject) {
        Stripe.invoices.retrieve(
          invoice_id,
          function (err, res) {
            if (err) reject("There was a problem", err);
            else resolve(res);
          });
      });

    // Fulfill Promise
    return invoice.await(
      function (res) {
        console.log(res);
        return res;
      }, function(err) {
        console.log(err);
        throw new Meteor.Error("Error from Stripe event retrieval Promise", err);
    });

  },
  'get_previous_invoice': function ( customer_id, invoice_id ) {
    console.log("Started get_previous_invoice");
    console.log("Customer ID: ", customer_id );
    console.log("Invoice ID: ", invoice_id );

    // Get the invoice from Stripe
    let invoice = new Promise(function (resolve, reject) {
        Stripe.invoices.list(
          { customer: customer_id, limit: 1, starting_after: invoice_id },
          function (err, res) {
            if (err) reject("There was a problem", err);
            else resolve(res);
          });
      });

    // Fulfill Promise
    return invoice.await(
      function (res) {
        console.log(res);
        return res;
      }, function(err) {
        console.log(err);
        throw new Meteor.Error("Error from Stripe invoice retrieval Promise", err);
    });

  },
  'update_customer_metadata': function ( customer_id, dt_persona_id ) {
    console.log("Started update_customer_metadata");
    console.log("Customer ID: ", customer_id );
    console.log("DT_persona_id ID: ", dt_persona_id );

    // Update the metadata, dt_persona_id of the customer in Stripe
    let customer = new Promise(function (resolve, reject) {
        Stripe.customers.update(customer_id, { "metadata": { "dt_persona_id": dt_persona_id } },
          function (err, res) {
            if (err) reject("There was a problem", err);
            else resolve(res);
          });
      });

    // Fulfill Promise
    return customer.await(
      function (res) {
        console.log(res);
        return res;
      }, function(err) {
        console.log(err);
        throw new Meteor.Error("Error from Stripe customer update Promise", err);
    });

  },
  'does_this_charge_event_violate_an_out_of_order_rule': function(request_object) {
    console.log("Started does_this_event_violate_an_out_of_order_rule");

    // Use this function to check to see if this event violates an out of order rule
    console.log(request_object.data.object.id);

    // Find the stored event
    let charge_cursor = Charges.findOne({_id: request_object.data.object.id});


    // Since we really only care if the event goes from succeeded to pending we
    // really only need to run this test if this event's status is pending
    let check_violation =
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
      case 'balance':
        console.log("Didn't do anything with this balance event.");
        break;
      case "bank_account":
        Devices.upsert({_id: event_body.data.object._id}, event_body.data.object);
        break;
      case "card":
        Devices.upsert({_id: event_body.data.object.id}, event_body.data.object);
        var result_of_update = Customers.update({_id: event_body.data.object.customer, 'sources.data.id': event_body.data.object.id}, {$set: {'sources.data.$': event_body.data.object}});
        break;
      case "charge":
        Charges.upsert({_id: event_body.data.object.id}, event_body.data.object);
        break;
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
      case "payment":
        Charges.upsert({_id: event_body.data.object.id}, event_body.data.object);
        break;
      case 'plan':
        console.log("Didn't do anything with this plan event.");
        break;
      case "refunds":
        Refunds.upsert({_id: event_body.data.object.id}, event_body.data.object);
        break;
      case "subscription":
        Subscriptions.upsert({_id: event_body.data.object._id}, event_body.data.object);
        break;
      case 'transfer':
        console.dir(event_body);
        Transfers.upsert({_id: event_body.data.object._id}, event_body.data.object);
        let transactions = StripeFunctions.get_transactions_from_transfer(event_body.data.object.id);
        console.dir(transactions);
        StripeFunctions.upsert_stripe_transactions(transactions, event_body.data.object.id);
        break;
      default:
        logger.error("This event didn't fit any of the configured cases, go into store_stripe_event and add the appropriate case.");

    }

  },
  'find_user_account_or_make_a_new_one': function (customer){
    // TODO: looks like there is no API event on new gifts because the customer
    // is being created with Stripe.js. This is actually a good thing because it
    // means you won't have out of order event processing, the customer created
    // functions should always run first
    console.log("Started find_dt_account_or_make_a_new_one");
    console.log(customer);

    let email_address, user, user_id, add_user_id_to_customer_metadata;

    // create an email_address variable to be reused below
    email_address = customer.email;

    user = Meteor.users.findOne({'emails.address': email_address});

    // If the user already exists assign the _id to the user_id local var
    // if not then create a user and then assign the same as above
    if( user ){
      user_id = user._id;
    } else{
      user_id = Utils.create_user(email_address, customer.id);
      // Set the new user flag
      Meteor.users.update({_id: user_id}, {$set: {newUser: true}});
    }
    // Add the user_id to the Stripe customer metadata
    add_user_id_to_customer_metadata = StripeFunctions.add_user_id_to_customer_metadata(user_id, customer.id);

    // Send the user_id back to the calling function
    return user_id;

  },
  'add_user_id_to_customer_metadata': function (user_id, customer_id) {
    logger.info("Stared add_user_id_to_customer_metadata");

    let stripeCustomerUpdate;

    // For security purposes, let's verify the event by retrieving it from Stripe.
      stripeCustomerUpdate = new Promise(function (resolve, reject) {
        Stripe.customers.update(customer_id, {
            "metadata": {
              "user_id": user_id
            }
          },
          function (err, res) {
            if (err) reject("There was a problem", err);
            else resolve(res);
          });
      });

    // Fulfill Promise
    return stripeCustomerUpdate.await(
      function (res) {
        // Log and return the value
        console.log(res);
        return res;
      }, function(err) {
        // TODO: if there is a a problem we need to resolve this
        console.log(err);
        throw new Meteor.Error("Error from Stripe customer metadata update Promise", err);
      });
  },
  'check_for_necessary_objects_before_inserting_into_dt': function (charge_id, customer_id, interval) {
    logger.info("Started check_for_necessary_objects_before_inserting_into_dt with interval of: " + interval);

    let chargeCursor, customerCursor, stripeCustomerRecord;

    chargeCursor =    Charges.findOne({_id: charge_id});

    customerCursor =  Customers.findOne({_id: customer_id});
    console.log("Metadata: ", customerCursor.metadata);

    if(chargeCursor && customerCursor.metadata && customerCursor.metadata.dt_persona_id) {
      Utils.insert_gift_into_donor_tools( charge_id, customer_id );

    } else if( interval === 2 ) {
      // Pull the customer record straight from Stripe
      stripeCustomerRecord =  Utils.get_stripe_customer( customerCursor.id );
      console.log("stripeCustomerRecord");
      console.log(stripeCustomerRecord);

      // Store this version in the collection
      stripeCustomerRecord._id = stripeCustomerRecord.id;
      Customers.upsert({_id: stripeCustomerRecord.id}, stripeCustomerRecord);

      // Wait 15 seconds since we can't find a charge cursor, or we can't find one
      // the customer's Donor Tools id
      Meteor.setTimeout(function () {

        // Increment the interval and send to parent function
        StripeFunctions.check_for_necessary_objects_before_inserting_into_dt( charge_id, customer_id, interval += 1);
      }, 15000)

    } else if ( interval < 5 ){
      // Wait 15 seconds since we can't find a charge cursor, or we can't find one
      // the customer's Donor Tools id
      Meteor.setTimeout(function () {

        // Increment the interval and send to parent function
        StripeFunctions.check_for_necessary_objects_before_inserting_into_dt( charge_id, customer_id, interval += 1);
      }, 15000)
    } else {
      if(interval % 1 === 0.5) {
        throw new Meteor.Error("There was a problem that prevented the function from getting " +
          "a result from either Donor Tools, or the MongoDB cursors");
      } else {

        // TODO: need to check to see if there is an invoice id on the charge cursor.
        // if there isn't one then this charge likely came from a saved device gift from the user portal
        // In this case we'll need to look for another way to get the persona_id.
        let invoice = StripeFunctions.get_previous_invoice( customer_id, chargeCursor.invoice );

        console.log("Invoice Object: ");
        console.dir(invoice.data);
        let previous_charge_id = invoice.data[0].charge;
        console.log("Charge_id: ", previous_charge_id);
        let dt_donation_cursor = DT_donations.findOne({transaction_id: previous_charge_id});
        console.log("dt_donatino_cursor.persona_id : ", dt_donation_cursor.persona_id );
        let dt_persona_id = dt_donation_cursor.persona_id;
        // TODO: Q: what happens if I change the persona_id that this subscription is associated with?
        // Always update the customer metadata to contain this dt_persona_id and this won't be a problem...?

        let update_stripe_customer = Customers.update({_id: customer_id}, { $set: { 'metadata.dt_persona_id': dt_persona_id } });
        StripeFunctions.update_customer_metadata(customer_id, dt_persona_id);
        StripeFunctions.check_for_necessary_objects_before_inserting_into_dt( charge_id, customer_id, interval += .5);
      }
    }

  },
  'add_dt_account_id_to_stripe_customer_metadata': function ( customer_id, dt_persona_id ) {
    logger.info("Started add_dt_account_id_to_stripe_customer_metadata");
    logger.info("DT Persona ID: ", dt_persona_id);

    let stripeCustomerUpdate;

    // For security purposes, let's verify the event by retrieving it from Stripe.
    stripeCustomerUpdate = new Promise(function (resolve, reject) {
      Stripe.customers.update(customer_id, {
          "metadata": {
            "dt_persona_id": dt_persona_id
          }
        },
        function (err, res) {
          if (err) reject("There was a problem", err);
          else resolve(res);
        });
    });

    // Fulfill Promise
    return stripeCustomerUpdate.await(
      function (res) {
        // Log and return the value
        console.log(res);
        return res;
      }, function(err) {
        // TODO: if there is a a problem we need to resolve this
        console.log(err);
        throw new Meteor.Error("Error from Stripe customer metadata update Promise", err);
      });

  },
  get_transactions_from_transfer: function ( id ) {
    logger.info("Started get_transactions_from_transfer");
    logger.info("Transfer id: ", id);

    let getStripeTransfer;

    // For security purposes, let's verify the event by retrieving it from Stripe.
    getStripeTransfer = new Promise(function (resolve, reject) {
      Stripe.balance.listTransactions({ limit: 100, transfer: id
        },
        function (err, res) {
          if (err) reject("There was a problem", err);
          else resolve(res);
        });
    });

    // Fulfill Promise
    return getStripeTransfer.await(
      function (res) {
        // Log and return the value
        return res;
      }, function(err) {
        // TODO: if there is a a problem we need to resolve this
        console.log(err);
        throw new Meteor.Error("Error from Stripe getStripeTransfer Promise", err);
      });

  },
  upsert_stripe_transactions: function ( transactions, transfer_id ) {
    logger.info("Started upsert_stripe_transactions");

    transactions.data.forEach(function (each_transaction) {
      each_transaction.transfer_id = transfer_id;
      Transactions.upsert({_id: each_transaction.id}, each_transaction);
    })
  },
  get_next_or_previous_transfer: function (transfer_id, previous_or_next) {
    logger.info("Started get_next_or_previous_transfer");

    let getStripeTransfer;

    // For security purposes, let's verify the event by retrieving it from Stripe.
    getStripeTransfer = new Promise(function (resolve, reject) {
      Stripe.transfers.list({ limit: 1, [previous_or_next]: transfer_id
        },
        function (err, res) {
          if (err) reject("There was a problem", err);
          else resolve(res);
        });
    });

    // Fulfill Promise
    getStripeTransfer = getStripeTransfer.await(
      function (res) {
        return res;
      }, function(err) {
        // TODO: if there is a a problem we need to resolve this
        console.log(err);
        throw new Meteor.Error("Error from Stripe getStripeTransfer Promise", err);
      });


    Transfers.upsert({_id: getStripeTransfer.data[0].id}, getStripeTransfer.data[0]);
    let transactions = StripeFunctions.get_transactions_from_transfer(getStripeTransfer.data[0].id);
    StripeFunctions.upsert_stripe_transactions(transactions, getStripeTransfer.data[0].id);

    return getStripeTransfer;
  }
});