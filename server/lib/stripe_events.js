Stripe_Events = {
  'account.updated': function (stripeEvent) {
    console.log(stripeEvent.type + ': event processed');
    return;
  },
  'account.application.deauthorized': function (stripeEvent) {
    console.log(stripeEvent.type + ': event processed');
    return;
  },
  'application_fee.created': function (stripeEvent) {
    console.log(stripeEvent.type + ': event processed');
    return;
  },
  'application_fee.refunded': function (stripeEvent) {
    console.log(stripeEvent.type + ': event processed');
    return;
  },
  'balance.available': function (stripeEvent) {
    console.log(stripeEvent.type + ': event processed');
    return;
  },
  'charge.pending': function (stripeEvent) {
    StripeFunctions.audit_charge( stripeEvent.data.object.id, 'pending' );
    let subscription_cursor, invoice_cursor, subscription_id, interval, invoice_object;

    console.log(stripeEvent);
    if( stripeEvent.data.object.invoice ) {
      invoice_cursor = Invoices.findOne({_id: stripeEvent.data.object.invoice});
      // It is possible that the invoice event hasn't been received by our server
      if(invoice_cursor && invoice_cursor.id) {
        subscription_cursor = Subscriptions.findOne({_id: invoice_cursor.subscription});
        subscription_id = invoice_cursor.subscription;
      } else {
        invoice_object = StripeFunctions.get_invoice(stripeEvent.data.object.invoice);
        subscription_cursor = Subscriptions.findOne( { _id: invoice_object.subscription } );
        console.log(invoice_object);
        subscription_id = invoice_object.subscription;
      }
      interval = subscription_cursor.plan.interval;

      Utils.send_donation_email( true, stripeEvent.data.object.id, stripeEvent.data.object.amount, stripeEvent.type,
        stripeEvent, interval, subscription_id );

    } else {
      Utils.send_donation_email(false, stripeEvent.data.object.id, stripeEvent.data.object.amount, stripeEvent.type,
        stripeEvent, "One Time", null);
    }
    console.log( stripeEvent.type + ': event processed' );
    return;
  },
  'charge.succeeded': function (stripeEvent) {
    StripeFunctions.audit_charge(stripeEvent.data.object.id, 'succeeded');
    console.log(stripeEvent);
    let send_successful_email;

    if(stripeEvent.data.object.invoice) {
      let wait_for_metadata_update = Utils.update_charge_metadata(stripeEvent);

      let invoice_cursor = Invoices.findOne({_id: stripeEvent.data.object.invoice});
      let subscription_cursor = Subscriptions.findOne({_id: invoice_cursor.subscription});

      console.log(invoice_cursor._id);
      Utils.send_donation_email( true, stripeEvent.data.object.id, stripeEvent.data.object.amount, stripeEvent.type,
        stripeEvent, subscription_cursor.plan.interval, invoice_cursor.subscription );
      if(stripeEvent.data.object.amount >= 50000) {
        send_successful_email = Utils.send_donation_email( true, stripeEvent.data.object.id, stripeEvent.data.object.amount, 'large_gift',
          stripeEvent, subscription_cursor.plan.interval, invoice_cursor.subscription );
      }
    } else {
      send_successful_email = Utils.send_donation_email(false, stripeEvent.data.object.id, stripeEvent.data.object.amount, stripeEvent.type,
        stripeEvent, "One Time", null);
      if(stripeEvent.data.object.amount >= 50000) {
        Utils.send_donation_email( false, stripeEvent.data.object.id, stripeEvent.data.object.amount, 'large_gift',
          stripeEvent, "One Time", null );
      }
    }
    console.log(stripeEvent.type + ': event processed');
    return;
  },
  'charge.failed': function (stripeEvent) {
    StripeFunctions.audit_charge(stripeEvent.data.object.id, 'failed');

    if(stripeEvent.data.object.refunds && stripeEvent.data.object.refunds.data &&
      stripeEvent.data.object.refunds.data[0] && stripeEvent.data.object.refunds.data[0].id){
      let refund_object = Utils.stripe_get_refund(stripeEvent.data.object.refunds.data[0].id);
      console.log(refund_object);
      Refunds.upsert({_id: refund_object.id}, refund_object);
    }
    // TODO: send failed email
    if(stripeEvent.data.object.invoice) {
      let wait_for_metadata_update = Utils.update_charge_metadata( stripeEvent );

      let invoice_cursor = Invoices.findOne( { _id: stripeEvent.data.object.invoice } );
      let subscription_cursor = Subscriptions.findOne( { _id: invoice_cursor.subscription } );

      console.log( invoice_cursor._id );
      Utils.send_donation_email( true, stripeEvent.data.object.id, stripeEvent.data.object.amount, stripeEvent.type,
        stripeEvent, subscription_cursor.plan.interval, invoice_cursor.subscription );
    } else {
      Utils.send_donation_email( false, stripeEvent.data.object.id, stripeEvent.data.object.amount, stripeEvent.type,
        stripeEvent, "One Time", null );
    }
    console.log(stripeEvent.type + ': event processed');
    return;
  },
  'charge.refunded': function (stripeEvent) {
    StripeFunctions.audit_charge(stripeEvent.data.object.id, 'refunded');
    let refund_object = Utils.stripe_get_refund(stripeEvent.data.object.refunds.data[0].id);
    console.log(refund_object);
    Refunds.upsert({_id: refund_object.id}, refund_object);
    console.log(stripeEvent.type + ': event processed');
    return;
  },
  'charge.captured': function (stripeEvent) {
    console.log(stripeEvent.type + ': event processed');
    return;
  },
  'charge.updated': function (stripeEvent) {
    // TODO: Need to handle this
    console.log(stripeEvent.type + ': event processed');
    return;
  },
  'charge.dispute.created': function (stripeEvent) {
    //TODO: need to send me an email so I can check into this
    console.log(stripeEvent.type + ': event processed');
    return;
  },
  'charge.dispute.updated': function (stripeEvent) {
    console.log(stripeEvent.type + ': event processed');
    return;
  },
  'charge.dispute.closed': function (stripeEvent) {
    console.log(stripeEvent.type + ': event processed');
    return;
  },
  'customer.created': function (stripeEvent) {
    console.log(stripeEvent.type + ': event processed');
    return;
  },
  'customer.updated': function (stripeEvent) {
    console.log(stripeEvent.type + ': event processed');
    return;
  },
  'customer.deleted': function (stripeEvent) {
    var user_with_customer_email = Meteor.users.findOne({'emails.address': stripeEvent.data.object.email});

    Customers.remove({_id: stripeEvent.data.object.id});

    // Remove the devices associated with this customer
    stripeEvent.data.object.sources.data.forEach(function(element){
        console.log("Removing this device: " + element.id);
        Devices.remove({_id: element.id});
    });

    var other_customers = Customers.findOne({email: stripeEvent.data.object.email});

    // check to see if the customer that was deleted was also set as the primary customer for this user
    // if so, put the next customer record in its place, copying the data from the first into the second.
    if(other_customers && user_with_customer_email.primary_customer_id === stripeEvent.data.object.id){
        Meteor.users.update({'emails.address': stripeEvent.data.object.email}, {$set: {primary_customer_id: other_customers._id}});
    }

    console.log(stripeEvent.type + ': event processed');
    return;
  },
  'customer.card.created': function (stripeEvent) {
    console.log(stripeEvent.type + ': event processed');
    return;
  },
  'customer.card.updated': function (stripeEvent) {
    console.log(stripeEvent.type + ': event processed');
    return;
  },
  'customer.source.deleted': function (stripeEvent) {
    Devices.remove({_id: stripeEvent.data.object.id});
    console.log(stripeEvent.type + ': event processed');
    return;
  },
  'customer.bank_account.deleted': function (stripeEvent) {
    Devices.remove({_id: stripeEvent.data.object.id});
    console.log(stripeEvent.type + ': event processed');
    return;
  },
  'customer.card.deleted': function (stripeEvent) {
    Devices.remove({_id: stripeEvent.data.object.id});
    console.log(stripeEvent.type + ': event processed');
    return;
  },
  'customer.source.created': function (stripeEvent) {
    StripeFunctions.store_stripe_event(stripeEvent);
    console.log(stripeEvent.type + ': event processed');
    return;
  },
  'customer.source.updated': function (stripeEvent) {
    StripeFunctions.store_stripe_event(stripeEvent);
    console.log(stripeEvent.type + ': event processed');
    return;
  },
  'customer.subscription.created': function (stripeEvent) {
    StripeFunctions.store_stripe_event(stripeEvent);
    console.log(stripeEvent.type + ': event processed');
    return;
  },
  'customer.subscription.updated': function (stripeEvent) {
    StripeFunctions.store_stripe_event(stripeEvent);
    console.log(stripeEvent.type + ': event processed');
    return;
  },
  'customer.subscription.deleted': function (stripeEvent) {
    StripeFunctions.store_stripe_event(stripeEvent);

    Utils.send_cancelled_email_to_admin(stripeEvent.data.object.id, stripeEvent);

    // TODO: setup an email for sending to the user as well
    // TODO: include a link to resubscribe

    console.log(stripeEvent.type + ': event processed');
    return;
  },
  'customer.subscription.trial_will_end': function (stripeEvent) {
    console.log(stripeEvent.type + ': event processed');
    return;
  },
  'customer.discount.created': function (stripeEvent) {
    console.log(stripeEvent.type + ': event processed');
    return;
  },
  'customer.discount.updated': function (stripeEvent) {
    console.log(stripeEvent.type + ': event processed');
    return;
  },
  'customer.discount.deleted': function (stripeEvent) {
    StripeFunctions.store_stripe_event(stripeEvent);
    console.log(stripeEvent.type + ': event processed');
    return;
  },
  'invoice.created': function (stripeEvent) {
    Utils.add_meta_from_subscription_to_charge(stripeEvent);

    console.log(stripeEvent.type + ': event processed');
    return;
  },
  'invoice.updated': function (stripeEvent) {
    console.log(stripeEvent.type + ': event processed');
    return;
  },
  'invoice.payment_succeeded': function (stripeEvent) {
    console.log(stripeEvent.type + ': event processed');
    return;
  },
  'invoice.payment_failed': function (stripeEvent) {
    // TODO: Need to handle this
    console.log(stripeEvent.type + ': event processed');
    return;
  },
  'invoiceitem.created': function (stripeEvent) {
    console.log(stripeEvent.type + ': event processed');
    return;
  },
  'invoiceitem.updated': function (stripeEvent) {
    console.log(stripeEvent.type + ': event processed');
    return;
  },
  'invoiceitem.deleted': function (stripeEvent) {
    console.log(stripeEvent.type + ': event processed');
    return;
  },
  'plan.created': function (stripeEvent) {
    console.log(stripeEvent.type + ': event processed');
    return;
  },
  'plan.updated': function (stripeEvent) {
    console.log(stripeEvent.type + ': event processed');
    return;
  },
  'plan.deleted': function (stripeEvent) {
    console.log(stripeEvent.type + ': event processed');
    return;
  },
  'coupon.created': function (stripeEvent) {
    console.log(stripeEvent.type + ': event processed');
    return;
  },
  'coupon.deleted': function (stripeEvent) {
    console.log(stripeEvent.type + ': event processed');
    return;
  },
  'recipient.created': function (stripeEvent) {
    console.log(stripeEvent.type + ': event processed');
    return;
  },
  'recipient.updated': function (stripeEvent) {
    console.log(stripeEvent.type + ': event processed');
    return;
  },
  'recipient.deleted': function (stripeEvent) {
    console.log(stripeEvent.type + ': event processed');
    return;
  },
  'transfer.created': function (stripeEvent) {
    console.log(stripeEvent.type + ': event processed');
    return;
  },
  'transfer.updated': function (stripeEvent) {
    console.log(stripeEvent.type + ': event processed');
    return;
  },
  'transfer.paid': function (stripeEvent) {
    console.log(stripeEvent.type + ': event processed');
    return;
  },
  'transfer.failed': function (stripeEvent) {
    console.log(stripeEvent.type + ': event processed');
    return;
  },
  'bitcoin.receiver.created': function (stripeEvent) {
    console.log(stripeEvent.type + ': event processed');
    return;
  },
  'bitcoin.receiver.transaction.created': function (stripeEvent) {
    console.log(stripeEvent.type + ': event processed');
    return;
  },
  'bitcoin.receiver.filled': function (stripeEvent) {
    console.log(stripeEvent.type + ': event processed');
    return;
  },
  'ping': function (stripeEvent) {
    console.log(stripeEvent.type + ': event processed');
    return;
  }
};