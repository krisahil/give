_.extend(Utils, {
    getDonateTo: function (donateTo) {
        var returnToCalled;
        switch(donateTo) {
            case 'WhereMostNeeded':
                returnToCalled = 'Where Most Needed';
                return returnToCalled;
                break;
            case 'WriteIn':
                return 'Write In';
                break;
            case 'Operations':
                returnToCalled = 'Basecamp - Operations Expenses';
                return returnToCalled;
                break;
            case 'JoshuaBechard':
                returnToCalled = 'Basecamp - Joshua Bechard';
                return returnToCalled;
                break;
            case 'DaveHenry':
                returnToCalled = 'Basecamp - Dave Henry';
                return returnToCalled;
                break;
            case 'TimmCollins':
                returnToCalled = 'Basecamp - Timm Collins';
                return returnToCalled;
                break;
            case 'BrettDurbin':
                returnToCalled = 'Basecamp - Brett Durbin';
                return returnToCalled;
                break;
            case 'RussellWest':
                returnToCalled = 'Basecamp - Russell West';
                return returnToCalled;
                break;
            case 'JohnKazaklis':
                returnToCalled = 'Basecamp - John Kazaklis';
                return returnToCalled;
                break;
            case 'ChrisMammoliti':
                returnToCalled = 'Basecamp - Chris Mammoliti';
                return returnToCalled;
                break;
            case 'ShelleySetchell':
                returnToCalled = 'Basecamp - Shelley Setchell';
                return returnToCalled;
                break;
            case 'WillieBrooks':
                returnToCalled = 'Basecamp - Willie Brooks';
                return returnToCalled;
                break;
            case 'JamesHishmeh':
                returnToCalled = 'Basecamp - James Hishmeh';
                return returnToCalled;
                break;
            case 'FieldProjectsWhereverNeededMost':
                returnToCalled = 'International Field Projects - Where Most Needed';
                return returnToCalled;
                break;
            case 'Bolivia':
                returnToCalled = 'International Field Projects - Bolivia';
                return returnToCalled;
                break;
            case 'DominicanRepublic':
                returnToCalled = 'International Field Projects - Dominican Republic';
                return returnToCalled;
                break;
            case 'Honduras':
                returnToCalled = 'International Field Projects - Honduras';
                return returnToCalled;
                break;
            case 'Kenya':
                returnToCalled = 'International Field Projects - Kenya';
                return returnToCalled;
                break;
            case 'Philippines':
                returnToCalled = 'International Field Projects - Philippines';
                return returnToCalled;
                break;
            case 'CommunitySponsorshipWhereverNeededMost':
                returnToCalled = 'Community Sponsorship - Where Most Needed';
                return returnToCalled;
                break;
            case 'CommunitySponsorshipBoliviaCochabamba':
                returnToCalled = 'Community Sponsorship - Bolivia - Cochabamba';
                return returnToCalled;
                break;
            case 'CommunitySponsorshipDominicanRepublicSantiago':
                returnToCalled = 'Community Sponsorship - Dominican Republic - Santiago';
                return returnToCalled;
                break;
            case 'CommunitySponsorshipHondurasTegucigalpa':
                returnToCalled = 'Community Sponsorship - Honduras - Tegucigalpa';
                return returnToCalled;
                break;
            case 'CommunitySponsorshipKenyaDandora':
                returnToCalled = 'Community Sponsorship - Kenya - Dandora';
                return returnToCalled;
                break;
            case 'CommunitySponsorshipPhilippinesPayatas':
                returnToCalled = 'Community Sponsorship - Philippines - Payatas';
                return returnToCalled;
                break;
            case 'CommunitySponsorshipPhilippinesSanMateo':
                returnToCalled = 'Community Sponsorship - Philippines - San Mateo';
                return returnToCalled;
                break;
            case 'CommunitySponsorshipPhilippinesSantiago':
                returnToCalled = 'Community Sponsorship - Philippines - Santiago City/Isabella';
                return returnToCalled;
                break;
            case 'CommunitySponsorshipPhilippinesSmokeyMtn':
                returnToCalled = 'Community Sponsorship - Philippines - Smokey Mountain';
                return returnToCalled;
                break;
            case 'CommunitySponsorshipPhilippinesTanza':
                returnToCalled = 'Community Sponsorship - Philippines - Tanza';
                return returnToCalled;
                break;
            default:
                returnToCalled ='Where Most Needed';
                return returnToCalled;
        }
    },
    create_customer: function (paymentDevice, customerInfo) {
      logger.info("Inside create_customer.");

      let stripeCustomerObject = {
        email: customerInfo.email_address,
        metadata: {
          "city": customerInfo.city,
          "state": customerInfo.region,
          "address_line1": customerInfo.address_line1,
          "address_line2": customerInfo.address_line2,
          "country": customerInfo.country,
          "postal_code": customerInfo.postal_code,
          "phone": customerInfo.phone_number,
          "business_name": customerInfo.org,
          "email": customerInfo.email_address,
          "fname": customerInfo.fname,
          "lname": customerInfo.lname
        }
      };

      if (paymentDevice.slice(0, 2) === 'to') {
        logger.info( "card" );
        stripeCustomerObject.card = paymentDevice;
      } else if (paymentDevice.slice(0, 2) === 'bt') {
        logger.info( "Bank_account" );
        stripeCustomerObject.bank_account = paymentDevice;
      }

      let stripeCustomer = StripeFunctions.stripe_create('customers', stripeCustomerObject);

      stripeCustomer._id = stripeCustomer.id;

      let customer_id = Customers.insert(stripeCustomer);

      logger.info("Customer_id: " + customer_id);
      return stripeCustomer;
    },
    charge: function (total, donation_id, customer_id, payment_id, metadata) {
      logger.info("Inside charge.");

      let stripeCharge = StripeFunctions.stripe_create('charges',
        { amount: total,
          currency: "usd",
          customer: customer_id,
          source: payment_id,
          metadata: metadata
        });
        stripeCharge._id = stripeCharge.id;

        // Add charge response from Stripe to the collection
        Charges.insert(stripeCharge);
        logger.info("Finished Stripe charge. Charges ID: " + stripeCharge._id);
        return stripeCharge;
    },
    charge_plan: function (total, donation_id, customer_id, payment_id, frequency, start_date, metadata) {
        logger.info("Inside charge_plan.");
        logger.info("Start date: " + start_date);

        var plan, subscription_frequency;
        subscription_frequency = frequency;

        switch (subscription_frequency) {
            case "monthly":
                plan = "giveMonthly";
                break;
            case "weekly":
                plan = "giveWeekly";
                break;
            case "yearly":
                plan = "giveYearly";
                break;
            case "daily":
                plan = "giveDaily";
                break;
        }

        var attributes = {
            plan: plan,
            quantity: total,
            metadata: metadata
        };
        if (start_date !== 'today') {
          attributes.trial_end = start_date;
        }

        let stripeChargePlan = StripeFunctions.stripe_update('customers', 'createSubscription', customer_id, '', attributes);
      
        stripeChargePlan._id = stripeChargePlan.id;
        logger.info("Stripe charge Plan information");
        console.dir(stripeChargePlan);
        // Add charge response from Stripe to the collection
        Subscriptions.insert(stripeChargePlan);
        Donations.update({_id: donation_id}, {$set: {subscription_id: stripeChargePlan.id}});
        if (start_date === 'today') {
          // Query Stripe to get the first invoice from this new subscription
          let stripeInvoiceList = StripeFunctions.stripe_retrieve('invoices', 'list', {customer: customer_id, limit: 1}, '');
          console.dir(stripeInvoiceList);
          return stripeInvoiceList.data[0];
        } else {
            Utils.send_scheduled_email(donation_id, stripeChargePlan.id, subscription_frequency, total);
            return 'scheduled';
        }
    },
    audit_email: function (id, type, failure_message, failure_code){
        logger.info("Inside audit_email.");

      switch(type){
        case 'config.change':
          Audit_trail.upsert({_id: id}, {
            $set: {
              'config.change.sent': true,
              'config.change.time': new Date()
            }
          });
          break;
        case 'charge.pending':
          Audit_trail.upsert({charge_id: id}, {
            $set: {
              'charge.pending.sent': true,
              'charge.pending.time': new Date()
            }
          });
          break;
        case 'charge.succeeded':
          Audit_trail.upsert({charge_id: id}, {
            $set: {
              'charge.succeeded.sent': true,
              'charge.succeeded.time': new Date()
            }
          });
          break;
        case 'payment.created':
          Audit_trail.upsert({charge_id: id}, {
            $set: {
              'payment.created.sent': true,
              'payment.created.time': new Date()
            }
          });
          break;
        case 'payment.paid':
          Audit_trail.upsert({charge_id: id}, {
            $set: {
              'payment.paid.sent': true,
              'payment.paid.time': new Date()
            }
          });
          break;
        case 'large_gift':
          Audit_trail.upsert({charge_id: id}, {
              $set: {
                'charge.large_gift.sent': true,
                'charge.large_gift.time': new Date()
              }
          });
          break;
        case 'charge.failed':
          Audit_trail.upsert({charge_id: id}, {
            $set: {
              'charge.failed.sent':       true,
              'charge.failed.time':       new Date(),
              'charge.failure_message':   failure_message,
              'charge.failure_code':      failure_code
            }
          });
          break;
        case 'subscription.scheduled':
          Audit_trail.upsert({subscription_id: id}, {
            $set: {
              'subscription_scheduled.sent': true,
              'subscription_scheduled.time': new Date()
            }
          });
          break;
        case 'dt.account.created':
          Audit_trail.upsert({persona_id: id}, {
            $set: {
              'dt_account_created.sent': true,
              'dt_account_created.time': new Date()
            }
          });
          break;
        case 'give.account.created':
          Audit_trail.upsert({user_id: id}, {
            $set: {
              'give_account_created.sent': true,
              'give_account_created.time': new Date()
            }
          });
          break;
        default:
          logger.info("No case matched");
      };
    },
    update_card: function(customer_id, card_id, saved){
      logger.info("Started update_card");
      logger.info("Customer: " + customer_id + " card_id: " + card_id + " saved: " + saved);

      let stripeUpdatedCard = StripeFunctions.stripe_update('customers', 'updateCard', customer_id, card_id,{
        metadata: {
          saved: saved
        }
      });

      stripeUpdatedCard._id = stripeUpdatedCard.id;
      return stripeUpdatedCard;
    },
    add_meta_from_subscription_to_charge: function(stripeEvent) {
        logger.info("Started add_meta_from_subscription_to_charge");

        // setup a cursor for this subscription
        var subscription_cursor = Subscriptions.findOne({_id: stripeEvent.data.object.subscription});

        // update the charges document to add the metadata, this way the related gift information is attached to the charge
        if(subscription_cursor.metadata){
            Charges.update({_id: stripeEvent.data.object.charge}, {$set: {metadata: subscription_cursor.metadata}});
        }

        // update the invoices document to add the metadata
        if(subscription_cursor.metadata){
            Invoices.update({_id: stripeEvent.data.object.id}, {$set: {metadata: subscription_cursor.metadata}});
        }

        // Now send these changes off to Stripe to update the record there.
        Utils.update_invoice_metadata(stripeEvent);
    },
    stripe_get_subscription: function(invoice_id){
        logger.info("Started stripe_get_subscription");

    },
  update_stripe_customer: function(form, dt_persona_id){
    logger.info("Inside update_stripe_customer.");

    let customers = Customers.find({
      'metadata.dt_persona_id': dt_persona_id.toString()
    }).map(function(customer){
      return customer.id;
    });
    if(customers.length > -1){
      console.log("Got at least one customer");
    } else{
      throw new Meteor.Error(500, "Not customers with that DT ID were found");
    }

    customers.forEach(function(customer_id){
      console.log(customer_id);

      let stripeCustomerUpdate = StripeFunctions.stripe_update('customers', 'update',
        customer_id, '', {
          "metadata": {
            "city":          form.address.city,
            "state":         form.address.state,
            "address_line1": form.address.address_line1,
            "address_line2": form.address.address_line2,
            "postal_code":   form.address.postal_code,
            "phone":         form.phone
          }
        }
      );
    });
  },
  update_stripe_customer_subscription: function(customer_id, subscription_id, token_id, donateWith){
    logger.info("Inside update_stripe_customer_subscription.");

    let stripeSubscriptionUpdate = StripeFunctions.stripe_update('customers', 'updateSubscription', customer_id, subscription_id, {
      source: token_id,
      metadata: {donateWith: donateWith}
    });

    return stripeSubscriptionUpdate;
  },
    update_stripe_customer_card: function(data){
      logger.info("Inside update_stripe_customer_card.");
      let stripeCardUpdate = StripeFunctions.stripe_update('customers', 'updateCard', data.customer_id, data.card, {
          exp_month: data.exp_month,
          exp_year: data.exp_year
      });
      return stripeCardUpdate;
    },
    update_stripe_customer_bank: function(customer_id, bank){
      logger.info("Inside update_stripe_customer_bank.");
      console.log(customer_id, bank);

      let stripeBankUpdate = StripeFunctions.stripe_update('customers', 'createSource', customer_id, '', {source: bank});
      return stripeBankUpdate;
    },
    update_stripe_bank_metadata: function(customer_id, bank_id, saved){
      logger.info("Inside update_stripe_bank_metadata.");
      logger.info(customer_id, bank_id, saved);
      if(saved){
        saved = 'true';
      } else {
        saved = 'false';
      }

      let stripeBankUpdate = StripeFunctions.stripe_update('customers', 'updateCard', customer_id, bank_id, { metadata: {saved: saved} })

    },
  update_stripe_customer_default_source: function(customer_id, device_id){
    logger.info("Inside update_stripe_customer_default_source.");
    logger.info(customer_id, device_id);

    let sourceUpdate = StripeFunctions.stripe_update('customers', 'update', customer_id, '', { default_source: device_id });
    return sourceUpdate;
    },
    update_invoice_metadata: function(event_body){
      logger.info("Inside update_invoice_metadata");

      // Get the subscription cursor
      var subscription_cursor = Subscriptions.findOne({_id: event_body.data.object.subscription});

      if (subscription_cursor.metadata) {
        // Use the metadata from the subscription to update the invoice with Stripe
        StripeFunctions.stripe_update('invoices', 'update', event_body.data.object.id, '', {
          "metadata":  subscription_cursor.metadata
        });
      } else {
        return;
      }
    },
    update_charge_metadata: function(event_body){
      logger.info("Inside update_charge_metadata");

      // Get the subscription cursor
      var invoice_cursor = Invoices.findOne({_id: event_body.data.object.invoice});
      if(!invoice_cursor){
        var invoice = StripeFunctions.get_invoice(event_body.data.object.invoice);
        invoice._id = invoice.id;
        Invoices.upsert({_id: invoice._id}, invoice);
        invoice_cursor = Invoices.findOne({_id: invoice.id});
      }
      var subscription_cursor = Subscriptions.findOne({_id: invoice_cursor.subscription});
      
      logger.info("Charge id: " + event_body.data.object.id);
      // Use the metadata from the subscription to update the charge with Stripe
      if(subscription_cursor.metadata){
        StripeFunctions.stripe_update('charges', 'update', event_body.data.object.id, '', {
          "metadata":  subscription_cursor.metadata
        });
      } else {
        return;
      }
      
      if(subscription_cursor.metadata){
        Charges.update({_id: event_body.data.object.id}, {$set: {metadata: subscription_cursor.metadata}});
      }
    },
    cancel_stripe_subscription: function(customer_id, subscription_id, reason){
      logger.info("Inside cancel_stripe_subscription");
      logger.info(customer_id + " " + " " + subscription_id + " " + reason);


      let stripe_subscription = StripeFunctions.stripe_update('customers',
        'updateSubscription',
        customer_id,
        subscription_id,
        { metadata: {canceled_reason: reason} }
      );

      let stripe_cancel = StripeFunctions.stripe_delete('customers',
        'cancelSubscription',
        customer_id,
        subscription_id
      );

      // Set this subscription to canceled. Stripe's webhooks will still update this later,
      // but this is here so that the admin or customer who cancels the subscription gets
      // immediate feedback on their action
      Subscriptions.update({_id: subscription_id}, { $set: { status: 'canceled' } });
      console.dir(stripe_cancel);
      return stripe_cancel;
    },
    stripe_create_subscription: function (customer_id, source_id, plan, quantity, metadata) {
      logger.info("Inside stripe_create_subscription.");
      logger.info(customer_id);

      // don't want to copy the canceled reason to the new subscription
      delete metadata.reason;

      let stripeCreateSubscription = StripeFunctions.stripe_update('customers', 'createSubscription', customer_id, '', {
        plan: plan,
        quantity: quantity,
        metadata: metadata
      });

      stripeCreateSubscription._id = stripeCreateSubscription.id;
      // Add charge response from Stripe to the collection
      Subscriptions.insert(stripeCreateSubscription);
      metadata.subscription_id = stripeCreateSubscription.id;
      Donations.insert(metadata);

      return stripeCreateSubscription;
    },
    stripe_set_transfer_posted_metadata: function (transfer_id, set_to){
      logger.info("Inside stripe_set_transfer_posted_metadata with transfer id: " +
        transfer_id + "and set_to: " + set_to);

      let stripeTransfer = StripeFunctions.stripe_update('transfers', 'update', transfer_id, '', {
          metadata: {
            posted: set_to
          }
      });
      return stripeTransfer;
    },
  stripe_get_refund: function (refund_id) {
    logger.info("Started stripe_get_refund. Refund id: " + refund_id);

    let stripeRefund = StripeFunctions.stripe_retrieve('refunds', 'retrieve', refund_id, {
      expand: ["charge"]
    });
    
    return stripeRefund;
  },
  get_all_stripe_refunds: function(){
    logger.info("Inside get_all_stripe_refunds.");

    let allRefunds = StripeFunctions.stripe_retrieve('refunds', 'list', { limit: 100 }, '');
    return allRefunds;
  },
  update_stripe_customer_dt_persona_id: function(customer_id, new_persona_id){
    logger.info("Inside update_stripe_customer_dt_persona_id.");
    logger.info(new_persona_id);

    let stripeCustomerUpdate = StripeFunctions.stripe_update('customers', 'update', customer_id, '', {
      "metadata": {
        "dt_persona_id": new_persona_id
      }
    });
    return stripeCustomerUpdate;
  },
  update_stripe_subscription_amount_or_designation_or_date:
    function (subscription_id, customer_id, fields){

    let stripeSubscriptionUpdate = StripeFunctions.stripe_update('customers', 
      'updateSubscription',
      customer_id,
      subscription_id, 
      fields);
      
    return stripeSubscriptionUpdate;
  },
  send_new_dt_account_added_email_to_support_email_contact: function (email, user_id, personaID){

    logger.info("Started send_new_dt_account_added_email_to_support_email_contact");
    if(Audit_trail.findOne({persona_id: personaID}) &&
      Audit_trail.findOne({persona_id: personaID}).dt_account_created)  {
      logger.info("Already sent a send_new_dt_account_added_email_to_support_email_contact email");
      return;
    }
    let wait_for_audit = Utils.audit_email(personaID, 'dt.account.created');

    //Create the HTML content for the email.
    //Create the link to go to the new person that was just created.
    var html = "<h1>DT account created</h1><p>" +
      "Details: <br>Email: " + email + "<br>ID: " +
      user_id + "<br>Link: <a href='" + 
      Meteor.settings.public.donor_tools_site + 
      "/people/" + personaID +"'>" + personaID + 
      "</a></p>";

    let toAddresses = [];
    toAddresses.push(Meteor.settings.public.support_address);
    toAddresses = toAddresses.concat(Meteor.settings.public.other_support_addresses);
    //Send email

    Email.send({
      from: Meteor.settings.public.support_address,
      to: toAddresses,
      subject: "DT Account inserted.",
      html: html
    });
  },
  /**
   * Send an email to the support email contact alerting.
   * Tell them a new user was created in Give
   *
   * @method send_new_give_account_added_email_to_support_email_contact
   * @param {String} email - email of the user who has just been created
   * @param {String} user_id - _id of the user who has just been created
   * @param {String} personaID - id from Donor Tools identifying this user
   */
  send_new_give_account_added_email_to_support_email_contact: function (email, user_id, personaID){

    logger.info("Started send_new_give_account_added_email_to_support_email_contact");
    if(Audit_trail.findOne({user_id: personaID}) &&
      Audit_trail.findOne({user_id: personaID}).give_account_created)  {
      logger.info("Already sent a send_new_give_account_added_email_to_support_email_contact email");
      return;
    }
    let wait_for_audit = Utils.audit_email(personaID, 'give.account.created');

    //Create the HTML content for the email.
    //Create the link to go to the new person that was just created.
    var html = "<h1>Give account created</h1><p>" +
      "Details: <br>Email: " + email + "<br>ID: " + user_id +
      "<br>Link: <a href='" + Meteor.settings.public.donor_tools_site +
      "/people/" + personaID +"'>" + personaID + "</a></p>";

    let toAddresses = [];
    toAddresses.push(Meteor.settings.public.support_address);
    toAddresses = toAddresses.concat(Meteor.settings.public.other_support_addresses);
    //Send email

    Email.send({
      from: Meteor.settings.public.support_address,
      to: toAddresses,
      subject: "Give Account inserted.",
      html: html
    });
  },
  /**
   * Send an email to the admins.
   * Tell them a change was made to the DonorTools or Stripe Configuration
   *
   * @method send_change_email_notice_to_admins
   */
  send_change_email_notice_to_admins: function (changeMadeBy, changeIn){
    logger.info("Started send_change_email_notice_to_admins");
    let config = Config.findOne();

    if (!(config && config.OrgInfo && config.OrgInfo.emails && config.OrgInfo.emails.support &&
      config.OrgInfo.emails.support[0])) {
      return;
    }
    //Utils.audit_email(config._id, 'config.change');
    let admins = Roles.getUsersInRole('admin');
    let adminEmails = admins.map(function ( item ) {
      return item.emails[0].address;
    });

    //Create the HTML content for the email.
    //Create the link to go to the new person that was just created.
    var html = "<h2>We thought you might want to know.</h2><p> A changed was made to your Give " +
      "configuration. <br> Changed By: " +
      Meteor.users.findOne({_id: changeMadeBy}).emails[0].address + "</p><p>" +
      "To see the changes go to your <a href='https://" +
      config.OrgInfo.web.subdomain + "." +
      config.OrgInfo.web.domain_name + "/dashboard/" + changeIn +
      "'>Dashboard</a></p>";

    Email.send({
      from: Meteor.settings.public.org_name + "<" + config.OrgInfo.emails.support[0] + ">",
      to: adminEmails,
      subject: Meteor.settings.dev + "A configuration change was made",
      html: html
    });
  },
  /**
   * set a user's state object and update that object with a timestamp
   *
   * @method set_user_state
   * @param {String} userId - _id of user who's state is being updated
   * @param {String} state - OneOf the values, 'disabled', 'enabled', or 'invited'
   */
  set_user_state: function ( userId, state ) {
    logger.info("Started set_user_state method");

    check(userId, String);
    check(state, Match.OneOf(
      'disabled',
      'enabled',
      'invited'
    ));

    try {
      // Set the state of the user with userId
      Meteor.users.update( { _id: userId }, { $set: {
        state: {
          status: state,
          updatedOn: new Date()
        }
      } } );

      // Logout user
      Meteor.users.update( { _id: userId }, { $set: { "services.resume.loginTokens": [] } } );

    } catch(e) {
      throw new Meteor.Error(500, "Can't do that");
    }
  },
  /**
   * 1. Construct the user's profile object from the customer metadata
   * 2. Create a user
   * 3. Update the new user with some details; profile, roles, state and
   * primary_customer_id
   * 4. Send the enrollment email
   * 5. return the newly created users's _id
   * @method create_user
   * @param {String} email - the email address used to give on the donation_form
   * @param {String} customer_id - the customer id generated by Stripe when the customer gave
   */
  create_user: function(email, customer_id) {
    try {
      logger.info("Started create_user.");

      let user_id, customer_cursor, fname, lname, profile;

      customer_cursor = Customers.findOne(customer_id);
      if (!customer_cursor.metadata.country) {
        logger.error("No Country");
      }

      // Construct the user's profile object from the customer metadata
      fname = customer_cursor && customer_cursor.metadata.fname;
      lname = customer_cursor && customer_cursor.metadata.lname;
      profile = {
        fname: fname,
        lname: lname,
        address: {
          address_line1: customer_cursor.metadata.address_line1,
          address_line2: customer_cursor.metadata && customer_cursor.metadata.address_line2,
          city: customer_cursor.metadata.city,
          state: customer_cursor.metadata.state,
          postal_code: customer_cursor.metadata.postal_code,
          country: customer_cursor.metadata.country
        },
        phone: customer_cursor.metadata.phone,
        business_name: customer_cursor.metadata.business_name
      };

      // Create a user
      user_id = Accounts.createUser({email: email});

      // Add some details to the new user account
      Meteor.users.update(user_id, {
        $set: {
          'profile': profile,
          'primary_customer_id': customer_id,
          roles: [],
          state: {
            status: 'invited',
            updatedOn: new Date()
          }
        }
      });

      // Send an enrollment Email to the new user
      Accounts.sendEnrollmentEmail(user_id);
      return user_id;
    } catch(e) {
      logger.info(e);
      //e._id = AllErrors.insert(e.response);
      var error = (e.response);
      throw new Meteor.Error(error, e._id);
    }
  },
  /**
   * This function creates the Stripe plans that are needed for Give to work
   * @method create_stripe_plans
   */
  create_stripe_plans: function() {
    try {
      logger.info("Started create_stripe_plans.");
      let stripe_plans = [
        {name: 'giveDaily', interval: 'day'},
        {name: 'giveWeekly', interval: 'week'},
        {name: 'giveMonthly', interval: 'month'},
        {name: 'giveYearly', interval: 'year'}
      ];

      stripe_plans.forEach(function ( plan ) {
        // for each of the plans run the Stripe get function (to see if the plan exists)
        // then run the create function if it does not exist
        let stripePlan = Utils.retrieve_stripe_plan(plan.name);
        console.log(stripePlan);
        if (!stripePlan) {
          let newStripePlan = Utils.create_stripe_plan(plan);
        }
      });
    } catch(e) {
      logger.error(e);
      //e._id = AllErrors.insert(e.response);
      var error = (e.response);
      throw new Meteor.Error(error, e._id);
    }
  },
  /**
   * This function will attempt to retrieve a Stripe plan
   * @method retrieve_stripe_plan
   * @param {String} name - The name of the plan to retrieve from Stripe
   */
  retrieve_stripe_plan: function(name) {
    logger.info("Started retrieve_stripe_plan with name: " + name);

    try {
      let stripePlan = StripeFunctions.stripe_retrieve('plans', 'retrieve', name, '');

      return stripePlan;
    } catch(e) {
      logger.error(e);
      //e._id = AllErrors.insert(e.response);
      var error = (e.response);
      return;
    }
  },
  /**
   * This function creates a Stripe plan
   * @method create_stripe_plan
   * @param {Object} plan - The plan to be created
   * @param {String} plan.name - The name of the plan
   * @param {String} plan.interval - The interval of the plan
   */
  create_stripe_plan: function(plan) {
    logger.info("Started create_stripe_plan with name: " + plan.name);
    let createdPlan = StripeFunctions.stripe_create('plans', {
      amount: 1,
      interval: plan.interval,
      name: plan.name,
      currency: "usd",
      id: plan.name
    });
    return createdPlan;
  }
});
