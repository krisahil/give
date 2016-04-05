import FS from 'fs';

Meteor.methods({
  get_dt_funds: function() {
    logger.info( "Started method get_dt_funds." );

    try {
      this.unblock();
        //check to see that the user is the admin user
        if (Roles.userIsInRole(this.userId, ['admin', 'manager'])) {
            logger.info("Started get_dt_funds");
            var fundResults;
            fundResults = HTTP.get(Meteor.settings.public.donor_tools_site + '/settings/funds.json?per_page=1000', {
                auth: Meteor.settings.donor_tools_user + ':' + Meteor.settings.donor_tools_password
            });
            Utils.separate_funds(fundResults.data);
            return fundResults.data;
        } else {
            logger.info("You aren't an admin, you can't do that");
            return;
        }
      } catch (e) {
        logger.info(e);
        //e._id = AllErrors.insert(e.response);
        var error = (e.response);
        throw new Meteor.Error(error, e._id);
      }
  },
  get_dt_sources: function() {
    logger.info( "Started method get_dt_funds." );

    try {
        //check to see that the user is the admin user
        if (Roles.userIsInRole(this.userId, ['admin', 'manager'])) {
          logger.info("Started get_dt_sources");
          var sourceResults;
          sourceResults = HTTP.get(Meteor.settings.public.donor_tools_site + '/settings/sources.json?per_page=1000', {
            auth: Meteor.settings.donor_tools_user + ':' + Meteor.settings.donor_tools_password
          });
          Utils.separate_sources(sourceResults.data);
          return sourceResults.data;
        } else {
          logger.info("You aren't an admin, you can't do that");
          return;
        }
      } catch (e) {
        logger.info(e);
        //e._id = AllErrors.insert(e.response);
        var error = (e.response);
        throw new Meteor.Error(error, e._id);
      }
  },
  update_customer: function(form, dt_persona_id) {
    logger.info( "Started method update_customer." );

    if (Meteor.userId()) {
      // Check the client side form fields with the Meteor 'check' method
      Utils.check_update_customer_form(form, dt_persona_id);

      // Setup a function for updating the accounts
      const update_accounts = function(form, dt_persona_id){
        // Send the user's contact updates to stripe
        Utils.update_stripe_customer( form, dt_persona_id );
        // Send the user's contact updates to Donor Tools
        Utils.update_dt_account( form, dt_persona_id );
      };

      // if admin proceed without checking dt_persona association
      if (Roles.userIsInRole(Meteor.userId(), ['admin'])) {
        update_accounts(form, dt_persona_id);
        return 'Updating now';
      } else {
        // Check that this user should be able to modify this dt_persona
        let this_user = Meteor.users.findOne({_id: Meteor.userId()});
        console.log(this_user.persona_info);
        if(_.findWhere(this_user.persona_info, {id: dt_persona_id})){
          console.log( 'yes' );
          update_accounts(form, dt_persona_id);
        } else {
          logger.error("This user doesn't have the dt_persona_id that was passed inside their persona_info array");
          return;
        }
      }
    }
    return;
  },
  stripeDonation: function(data) {
    logger.info("Started stripeDonation");
    try {
      //Check the form to make sure nothing malicious is being submitted to the server
      Utils.checkFormFields(data);
      if(data.paymentInformation.coverTheFees === false){
          data.paymentInformation.fees = '';
      }
      logger.info(data.paymentInformation.start_date);
      let customerData = {};
      let donateTo, user_id, dt_account_id, customerInfo, metadata;

      //Convert donation to more readable format
      donateTo = Utils.getDonateTo(data.paymentInformation.donateTo);

      if(donateTo === 'Write In') {
          donateTo = data.paymentInformation.writeIn;
      }
      if(!data.customer.id){
        customerData = Utils.create_customer(data.paymentInformation.token_id ? 
          data.paymentInformation.token_id : '',
          data.customer);
        
        // Skip this area for 2 seconds so the giver sees the next page without waiting
        // for this area to return
        Meteor.setTimeout(function() {

          // Find a local user account, create if it doesn't exist
          user_id = StripeFunctions.find_user_account_or_make_a_new_one(customerData);

          // Find a DonorTools account, create one if the account either
          // doesn't exist or if the existing match doesn't look like the
          // same person or business as what already exists.
          dt_account_id = Utils.find_dt_account_or_make_a_new_one(customerData, user_id, false);
          if(!dt_account_id) {
            // the find_dt_account_or_make_a_new_one function returns null
            // if the Audit log shows that this process has already been completed
            // This can happen when two events come in within a very short time period
            // (we are talking milli-seconds). I have never seen this
            // happen in production, only dev.
            return;
          }

          // add the dt_account_id to the user array using $addToSet so that only
          // unique array values exist.
          Meteor.users.update( {_id: user_id}, { $addToSet: { persona_ids: dt_account_id } } );

          // Send the Give support contact an email letting them know a new
          // account has been created in DT.
          if (Meteor.users.findOne( {_id: user_id } ) && Meteor.users.findOne( {_id: user_id } ).newUser ) {
            Meteor.users.update( {_id: user_id }, { $unset: { newUser: "" } } );
            Utils.send_new_give_account_added_email_to_support_email_contact(data.customer.email_address, user_id, dt_account_id);
          }

          // Update the Stripe customer metadata to include this DT persona (account) ID
          StripeFunctions.add_dt_account_id_to_stripe_customer_metadata(customerData.id, dt_account_id);
        }, 2000 /* wait 2 seconds before executing the functions above */);

        if(!customerData.object){
          console.error("Error: ", customerData);
            return {error: customerData.rawType, message: customerData.message};
          }
      } else {
        //TODO: change these to match what you'll be using for a Stripe customer that already exists
        var customer_cursor = Customers.findOne({_id: data.customer.id});
        customerData.id = customer_cursor._id;
      }
      // Update the card/bank metadata so we know if the user wanted this card saved or not
      if (data.paymentInformation.token_id) {
        Utils.update_card( customerData.id, data.paymentInformation.source_id, data.paymentInformation.saved );
      }

      customerInfo = {
        "city":                 data.customer.city,
        "state":                data.customer.region,
        "address_line1":        data.customer.address_line1,
        "address_line2":        data.customer.address_line2,
        "country":              data.customer.country,
        "postal_code":          data.customer.postal_code,
        "phone":                data.customer.phone_number,
        "business_name":        data.customer.org,
        "email":                data.customer.email_address,
        "fname":                data.customer.fname,
        "lname":                data.customer.lname
      };

      metadata = {
        'amount':               data.paymentInformation.amount,
        'coveredTheFees':       data.paymentInformation.coverTheFees,
        'created_at':           data.paymentInformation.created_at,
        'customer_id':          customerData.id,
        'donateTo':             donateTo,
        'donateWith':           data.paymentInformation.donateWith,
        'dt_donation_id':       null,
        'dt_source':            data.paymentInformation.dt_source,
        'fees':                 data.paymentInformation.fees,
        'frequency':            data.paymentInformation.is_recurring,
        'note':                 data.paymentInformation.note,
        'status':               'pending',
        'send_scheduled_email': data.paymentInformation.send_scheduled_email,
        'start_date':           data.paymentInformation.start_date,
        'total_amount':         data.paymentInformation.total_amount,
        'type':                 data.paymentInformation.type,
        'sessionId':            data.paymentInformation.sessionId,
        'source_id':            data.paymentInformation.source_id,
        'method':               data.paymentInformation.method
      };

      data._id = Donations.insert(metadata);
      logger.info("Donation ID: " + data._id);

      for (var attrname in customerInfo) { metadata[attrname] = customerInfo[attrname]; }
      delete metadata.created_at;
      delete metadata.customer_id;
      delete metadata.sessionId;
      delete metadata.status;
      delete metadata.total_amount;
      delete metadata.type;
      delete metadata.source_id;
      delete metadata.method;
      delete metadata.start_date;

      if (data.paymentInformation.token_id) {

        if( data.paymentInformation.is_recurring === "one_time" ) {
          // Charge the card (which also connects this card or bank_account to the customer)
          var charge = Utils.charge( data.paymentInformation.total_amount,
            data._id, customerData.id, data.paymentInformation.source_id, metadata );
          if( !charge.object ) {
            return { error: charge.rawType, message: charge.message };
          }
          Donations.update( { _id: data._id }, { $set: { charge_id: charge.id } } );

          return { c: customerData.id, don: data._id, charge: charge.id };
        } else {
          // Print how often it it recurs?
          logger.info( data.paymentInformation.is_recurring );

          //Start a subscription (which also connects this card, or bank_account to the customer
          var charge_object = Utils.charge_plan( data.paymentInformation.total_amount,
            data._id, customerData.id, data.paymentInformation.source_id,
            data.paymentInformation.is_recurring, data.paymentInformation.start_date, metadata );
          if( !charge_object.object ) {
            if( charge_object === 'scheduled' ) {
              return { c: customerData.id, don: data._id, charge: 'scheduled' };
            } else {
              logger.error( "The charge_id object didn't have .object attached." );
              return {
                error:   charge_object.rawType,
                message: charge_object.message
              };
            }
          }

          // check for payment rather than charge id here
          var return_charge_or_payment_id;
          if( charge_object.payment ) {
            return_charge_or_payment_id = charge_object.payment;
          } else {
            return_charge_or_payment_id = charge_object.charge;
          }
          return {
            c:      customerData.id,
            don:    data._id,
            charge: return_charge_or_payment_id
          };
        }
      } else {
        BankAccounts.update({_id: data.paymentInformation.source_id}, {
          $set: {
            customer_id: customerData.id
          }
        });
        return { c: customerData.id, don: data._id, charge: 'scheduled' };
      }
    } catch (e) {
      logger.error("Got to catch error area of processPayment function." + e + " " + e.reason);
      logger.error("e.category_code = " + e.category_code + " e.descriptoin = " + e.description);
      if(e.category_code) {
        logger.error("Got to catch error area of create_associate. ID: " + data._id + " Category Code: " + e.category_code + ' Description: ' + e.description);
        var chargeSubmitted;
        if(e.category_code === 'invalid-routing-number'){
          chargeSubmitted = false;
        }
        Donations.update(data._id, {
          $set: {
          'failed.category_code': e.category_code,
          'failed.description': e.description,
          'failed.eventID': e.request_id,
          'status': 'failed',
          'charge.submitted': chargeSubmitted
          }
        });
        throw new Meteor.Error(500, e.category_code, e.description);
      } else {
        throw new Meteor.Error(500, e.reason, e.details);
      }
    }
  },
  update_user_document_by_adding_persona_details_for_each_persona_id: function(id) {
    logger.info("Started update_user_document_by_adding_persona_details_for_each_persona_id");

    check(id, Match.Optional(String));

    var userID;
    if(this.userId) {
      this.unblock();
     if(id){
       if (Roles.userIsInRole(this.userId, ['admin'])) {
         userID = id;
       } else {
         logger.warn("ID detected when not logged in as an admin");
         return;
       }
     } else {
       userID = this.userId;
     }
    } else {
        return "Not logged in.";
    }
      let this_user_document, persona_ids;
      this_user_document = Meteor.users.findOne({_id: userID});
      persona_ids = this_user_document && this_user_document.persona_ids;
      persona_id = this_user_document && this_user_document.persona_id;
      var set_this_array = [];
    try {
      if(!persona_ids && persona_id) {
        logger.info("No persona_ids, but did find persona_id");
        persona_ids = persona_id;
      }

      if( persona_ids && persona_ids.length ) {
        // The persona_ids let is an array
        logger.info( "Multiple persona_ids found: ", persona_ids );


        // Since the donor tools information can change way down in the record
        // we don't want to simply do an $addToSet, this will lead to many
        // duplicate records, instead, setup a temp array let and then inside
        // the forEach push the personas into it
        // After we'll use the array to set the persona_info inside the user document


        // Loop through the persona_ids
        _.forEach(persona_ids, function(each_persona_id) {
            let personaResult = HTTP.get( Meteor.settings.public.donor_tools_site + "/people/" + each_persona_id + ".json", {
              auth: Meteor.settings.donor_tools_user + ':' + Meteor.settings.donor_tools_password
            } );
            set_this_array.push( personaResult.data.persona );
          console.log(personaResult.data.persona);

        });
      } else if( persona_ids ){
        logger.info("Single persona_id found: ", persona_ids);
        let personaResult = HTTP.get(Meteor.settings.public.donor_tools_site + "/people/" + persona_ids + ".json", {
          auth: Meteor.settings.donor_tools_user + ':' + Meteor.settings.donor_tools_password
        });
        console.log(personaResult.data.persona);
        set_this_array.push(personaResult.data.persona);
      } else if(!Meteor.users.findOne({_id: userID}).persona_info &&
        Customers.findOne({'metadata.user_id': userID})) {

        let dt_account_id = Utils.find_dt_account_or_make_a_new_one(
          Customers.findOne({'metadata.user_id': userID}), userID, true);
        if(!dt_account_id) {
          // the find_dt_account_or_make_a_new_one function returns null
          // if the Audit log shows that this process has already been completed
          // This can happen when two events come in within a very short time period
          // (we are talking milli-seconds). I have never seen this
          // happen in production, only dev.
          return;
        }

        // add the dt_account_id to the user array using $addToSet so that only
        // unique array values exist.
        Meteor.users.update( {_id: userID}, { $addToSet: { persona_ids: dt_account_id } } );
      } else {
        console.log("Not a DT user");
        return 'Not a DT user';
      }
      console.log(set_this_array);

      Meteor.users.update({_id: userID}, {$set: {'persona_info': set_this_array}});

      return "Finished update_user_document_by_adding_persona_details_for_each_persona_id method call";
     } catch(e) {
       logger.error("error in querying DT for persona_info");
       logger.error(e);
     }

  },
  move_donation_to_other_person: function(donation_id, move_to_id) {
    logger.info( "Started method move_donation_to_other_person." );

    check(donation_id, String);
    check(move_to_id, String);
    if (Roles.userIsInRole(this.userId, ['admin', 'manager'])) {

      // Move a donation from one persona_id to another
      logger.info("Inside move_donation_to_other_person.");

      logger.info("Moving donation: " + donation_id);
      logger.info("Moving donation to: " + move_to_id);

      // Get the donation from DT
      var get_donation = HTTP.get(Meteor.settings.public.donor_tools_site +
        '/donations/' + donation_id + '.json', {
          auth: Meteor.settings.donor_tools_user + ':' +
            Meteor.settings.donor_tools_password
      });

      console.dir(get_donation.data.donation);
      var moved_from_id = get_donation.data.donation.persona_id;

      // Prep the donation for insertion into the new persona
      get_donation.data.donation.persona_id = move_to_id;
      delete get_donation.data.donation.id;
      delete get_donation.data.donation.splits[0].donation_id;
      delete get_donation.data.donation.splits[0].id;

      // Insert the donation into the move_to_id persona
      var movedDonation;
      movedDonation = HTTP.post(Meteor.settings.public.donor_tools_site + '/donations.json', {
        data: {
            donation: get_donation.data.donation
        },
        auth: Meteor.settings.donor_tools_user + ':' + Meteor.settings.donor_tools_password
      });

      // Check that the response from the DT server is what of the expected format
      if (movedDonation && movedDonation.data && movedDonation.data.donation && movedDonation.data.donation.persona_id) {
        // Send the id of this new DT donation to the function which will update the charge to add that meta text.
        Utils.update_charge_with_dt_donation_id(get_donation.data.donation.transaction_id, movedDonation.data.donation.id);

        // Delete the old DT donation, I've setup an async callback because I'm getting a 406 response from DT, but the delete is still going through
        var deleteDonation;
        deleteDonation = HTTP.del(Meteor.settings.public.donor_tools_site +
          '/donations/' + donation_id +
          '.json', {auth: Meteor.settings.donor_tools_user + ':' +
          Meteor.settings.donor_tools_password}, function(err, result){
            if(err){
                console.dir(err);
                return err;
            } else {
                console.dir(result);
                return result;
            }
        });

        // Remove the old DonorTools donation document from the collection
        let removeDonation = DT_donations.remove({_id: Number(donation_id)});
        console.log("If this is a 1 then it was successful ", removeDonation);
        var persona_ids = [moved_from_id, move_to_id];

        // Get all the donations from these two personas and put them back into the collection
        Utils.get_all_dt_donations(persona_ids);

        return movedDonation.data.donation;
      } else {
        logger.error("The persona ID wasn't returned from DT, or something else happened with the connection to DT.");
        throw new Meteor.Error("Couldn't get the persona_id for some reason");
      }
    } else {
      logger.info("You aren't an admin, you can't do that");
      return;
    }
  },
  GetStripeEvent: function (id, process) {
    logger.info("Started GetStripeEvent");

    if (Roles.userIsInRole(this.userId, ['admin'])) {
      try {
        //Check the form to make sure nothing malicious is being submitted to the server
        check(id, String);
        check(process, Boolean);

        if (process) {
          let thisRequest = {id: id};
          StripeFunctions.control_flow_of_stripe_event_processing(thisRequest);
          return "Sent to control_flow_of_stripe_event_processing for processing";
        } else {
          let stripeEvent = StripeFunctions.stripe_retrieve('events', 'retrieve', id, '');

          var event = Stripe_Events[stripeEvent.type]( stripeEvent );
          return stripeEvent;
        }

      } catch (e) {
        logger.info(e);
        //e._id = AllErrors.insert(e.response);
        var error = (e.response);
        throw new Meteor.Error(error, e._id);
      }
    } else {
      logger.info("You aren't an admin, you can't do that");
      return;
    }
  },
  GetDTData: function (dateStart, dateEnd) {
    logger.info("Started GetDTData method");

    check(dateStart, String);
    check(dateEnd, String);

    if (Roles.userIsInRole(this.userId, ['admin'])) {
      this.unblock();
      try{
        // This is the fund ids for community sponsorship
        var fundsList = [
          63667, 63692, 63695, 64590, 67273, 67274, 67276, 67277, 67282, 64197
        ];
        fundsList.forEach( function ( fundId ) {
          Utils.getFundHistory(fundId, dateStart, dateEnd);
        });
      } catch( e ) {
        // Got a network error, time-out or HTTP error in the 400 or 500 range.
        return false;
      }
      return "Got all funds history";
    }
  },
  ShowDTSplits: function () {
    logger.info("Started ShowDTSplits method");

    var results = {};
    results.annual = DT_splits.aggregate(
      [
        { $match: { $and: [
          { $text: { $search: "annual one-time One_time" } },
          { received_on: { $gt: moment().subtract(365, 'days').format('YYYY-MM-DD') } },
        ] } },
        {
          $group:
          {
            _id: null,
            totalMonthlyAmount: { $sum: { $divide: [ { $add: [ "$amount_in_cents" ] }, 1500 ] } },
            count: { $sum: 1 }
          }
        }
      ]
    );

    results.other = DT_splits.find(
      { $and:
        [
          { "memo": { $nin: ["annual", "Annual", "one-time", "One-time", "One_time", "monthly", "Monthly", "quarterly", "Quarterly"] } },
          { received_on: { $gt: moment().subtract(365, 'days').format('YYYY-MM-DD') } }
        ]
      }
    ).fetch();

    results.quarterly = DT_splits.aggregate(
      [
        { $match: {
          $and: [
            { $text: { $search: "Quarterly quarterly" } },
            { received_on: { $gt: moment().subtract(90, 'days').format('YYYY-MM-DD') } }
        ]
        } },

        {
          $group:
          {
            _id: null,
            totalMonthlyAmount: { $sum: { $divide: [ { $add: [ "$amount_in_cents" ] }, 300 ] } },
            count: { $sum: 1 }
          }
        }
      ]
    );

    results.monthly = DT_splits.aggregate(
      [
        { $match: {
          $and: [
            { $text: { $search: "Monthly monthly" } },
            { received_on: { $gt: moment().subtract(30, 'days').format('YYYY-MM-DD') } }
          ]
        } },
        { $project: { "received_on": 1, "amount_in_cents": 1 } },
        {
          $group:
          {
            _id: null,
            totalMonthlyAmount: { $sum: { $divide: [ { $add: [ "$amount_in_cents" ] }, 100 ] } },
            count: { $sum: 1 }
          }
        }
      ]
    );

    var no_memo_or_other   = 0;

    var total_kids = results.monthly[0].totalMonthlyAmount/29;
    total_kids += results.annual[0].totalMonthlyAmount/29;
    results.other.forEach(function(value) {if(value.amount_in_cents > 0){no_memo_or_other += (value.amount_in_cents/1500)}});
    total_kids += (no_memo_or_other-266)/29;

    return total_kids;
  },
  get_dt_name: function (id) {
    logger.info("Started get_dt_name method");

    check(id, Number);
    console.log(id);
    if (Roles.userIsInRole(this.userId, ['admin', 'manager', 'reports'])) {
      this.unblock();
      try {
        // Get the persona from DT
        let persona_result = HTTP.call("GET", Meteor.settings.public.donor_tools_site + '/people/' + id + '.json', {
          auth: Meteor.settings.donor_tools_user + ':' + Meteor.settings.donor_tools_password
        });
        if( persona_result && persona_result.data && persona_result.data.persona ) {
          return persona_result.data.persona;
        } else {
          return null;
        }
      } catch( e ) {
        // Got a network error, time-out or HTTP error in the 400 or 500 range.
        return false;
      }
    } else {
      return;
    }
  },
  get_next_or_previous_transfer: function (current_transfer_id, previous_or_next) {
    logger.info("Started get_next_or_previous_transfer method");

    check(current_transfer_id, String);
    check(previous_or_next, String);
    if (Roles.userIsInRole(this.userId, ['admin', 'manager', 'reports'])) {
      let previous_or_next_transfer = StripeFunctions.get_next_or_previous_transfer(current_transfer_id, previous_or_next);

      return previous_or_next_transfer.data[0].id;
    } else {
      return;
    }
  },
  run_if_no_user_was_created_but_donation_was_processed_with_stripe: function ( id, email  ) {
    logger.info("Started run_if_no_user_was_created_but_donation_was_processed_with_stripe method");

    check(id, String);
    check(email, String);
    if (Roles.userIsInRole(this.userId, 'admin')) {

      customer = { id: id, email: email };


      let user_id, dt_account_id, wait_for_user_update;

      user_id = StripeFunctions.find_user_account_or_make_a_new_one( customer );
      dt_account_id = Utils.find_dt_account_or_make_a_new_one( customer, user_id, false );
      wait_for_user_update = Meteor.users.update( { _id: user_id }, { $addToSet: { persona_ids: dt_account_id } } );
      // commented, because I believe this is in the wrong place
      // Utils.send_new_dt_account_added_email_to_support_email_contact( customer.email, user_id, dt_account_id );
      Meteor.users.update( {_id: user_id }, { $unset: { newUser: "" } } );
      StripeFunctions.add_dt_account_id_to_stripe_customer_metadata( customer.id, dt_account_id );
    } else {
      return;
    }
  },
  toggle_post_transfer_metadata_state: function (transfer_id, checkbox_state){
    logger.info("Started toggle_post_transfer_metadata_state");

    check(transfer_id, String);
    check(checkbox_state, Match.OneOf("true", "false"));
    if (Roles.userIsInRole(this.userId, ['admin', 'manager', 'reports'])) {
      let stripe_response = Utils.stripe_set_transfer_posted_metadata(transfer_id, checkbox_state);
      Transfers.update({_id: transfer_id}, {$set: { 'metadata.posted': checkbox_state } });
      return stripe_response;
    } else {
      return;
    }
  },
  store_all_refunds: function () {
    logger.info( "Started method store_all_refunds." );

    if (Roles.userIsInRole(this.userId, ['admin'])) {
      let refunds = Utils.get_all_stripe_refunds();
      console.log(refunds);
      refunds.data.forEach(function (refund) {
        let expandedRefund = Utils.stripe_get_refund(refund.id);
        Refunds.upsert({_id: expandedRefund.id}, expandedRefund);
      });
      return "Stored all refunds";
    } else {
      return;
    }
  },
  merge_dt_persona: function (old_persona_id, new_persona_id) {
    logger.info("Started merge_dt_persona method");

    check(old_persona_id, Number);
    check(new_persona_id, Number);

    if (Roles.userIsInRole(this.userId, ['admin', 'manager'])) {

      // find each customer where the old_persona_id is stored
      let customers = Customers.find({'metadata.dt_persona_id': String(old_persona_id)});

      // Go through all of these customers and update their dt_persona_id through Stripe
      customers.forEach(function(customer){
        Utils.update_stripe_customer_dt_persona_id(customer.id, String(new_persona_id));
      });

      let user_with_old_persona_id =
        Meteor.users.find({
          $or: [{
            'persona_ids': old_persona_id
          }, {
            'persona_id': old_persona_id
          }]
        });
      // Delete the persona_info and persona_id for the user that was found,
      // persona_info will be retrieved automatically if the user logs into their account
      // and persona_id isn't needed
        let wait_for_unset = Meteor.users.update({
          $or: [{
            'persona_ids': old_persona_id
          }, {
            'persona_id': old_persona_id
          }]
        }, {
          $unset: {
            'persona_id': '',
            'persona_info': ''
          }
        });

      if(Meteor.users.find({ 'persona_ids': old_persona_id })){
          Meteor.users.update({
            'persona_ids': old_persona_id
          }, {
            $set: {
              'persona_ids.$': new_persona_id
            }
          });
      } else {
        Meteor.users.update({
          _id: user_with_old_persona_id._id
        }, {
          addToSet: {
            persona_ids: new_persona_id
          }
        });
      }

      // Remove all the old donations that were under the old persona id
      DT_donations.remove({
        'persona_id': old_persona_id
      });

      // Get all the donations under the new persona id
      Utils.get_all_dt_donations([new_persona_id]);

      return "Merge succeeded";
    } else {
      return;
    }
  },
  edit_subscription: function (customer_id, subscription_id, quantity, trial_end, donateTo) {
    logger.info("Started edit_subscription method");

    console.log(customer_id, subscription_id, quantity, trial_end, donateTo);
    check(subscription_id, String);
    check(customer_id, String);
    check(quantity, Match.Optional(Number));
    check(trial_end, Match.Optional(String));
    check(donateTo, Match.Optional(String));

    let fields = {};
    quantity && quantity !== 0 ? fields.quantity = quantity : null;
    quantity && quantity !== 0 ? fields.metadata = {amount: quantity} : null;
    quantity && quantity !== 0 ? fields.prorate = false : trial_end ? fields.prorate = false : null;
    trial_end ? fields.trial_end = trial_end : null;
    donateTo ? fields.metadata ? fields.metadata.donateTo = donateTo: fields.metadata = {donateTo: donateTo} : null;
    console.log(fields);
    this.unblock();

    if (Roles.userIsInRole(this.userId, ['admin', 'manager'])) {
      let newSubscription =
        Utils.update_stripe_subscription_amount_or_designation_or_date(subscription_id,
        customer_id, fields);
      Subscriptions.upsert({_id: subscription_id}, newSubscription);
      console.log(newSubscription);
      return "Edited that subscription";
    } else if(this.userId){
      let user_email = Meteor.users.findOne({_id: this.userId}).emails[0].address;
      let subscription_email = Subscriptions.findOne({_id: subscription_id}).metadata.email;
      if(user_email === subscription_email){
        let newSubscription =
          Utils.update_stripe_subscription_amount_or_designation_or_date(subscription_id,
            customer_id, fields);
        Subscriptions.upsert({_id: subscription_id}, newSubscription);
        console.log(newSubscription);
        return "Edited that subscription";
      } else {
        return;
      }
    }
  },
  post_dt_note: function (to_persona, note) {
    logger.info("Started post_dt_note method");

    check(to_persona, String);
    check(note, String);

    try {
      //check to see that the user is the admin user
      if (Roles.userIsInRole(this.userId, ['admin', 'manager'])) {
        logger.info("Started post_dt_note");
        let noteResult = HTTP.post(Meteor.settings.public.donor_tools_site + '/people/' +
          to_persona + '/notes.json', {
          "data": {
            "note": {
              "note": note
            }
          },
          auth: Meteor.settings.donor_tools_user + ':' + Meteor.settings.donor_tools_password
        });
        return noteResult.data;
      } else{
        logger.info("You aren't an admin, you can't do that");
        return;
      }

    } catch (e) {
      logger.info(e);
      //e._id = AllErrors.insert(e.response);
      var error = (e.response);
      throw new Meteor.Error(error, e._id);
    }
  },
  addRole: function (role, add_to) {
    logger.info("Started addRole.");

    check(role, String);
    check(add_to, Match.Optional(String));

    if (Roles.userIsInRole(this.userId, ['admin'])) {

      console.log( "[addRole]", role );

      if(add_to){
        Meteor.users.update({_id: add_to}, {$addToSet: {roles: role}});
      } else {
        let searchRole = Meteor.roles.findOne({'name': role});
        if(searchRole && searchRole._id){
          return role + " already exists";
        }
        Roles.createRole( role );
      }
      return 'Added "' + role + '" role.' ;
    } else {
      return;
    }
  },
  createUserMethod: function (form) {
    logger.info("Started createUserMethod method");

    check( form, Schema.CreateUserFormSchema );

    try {
      if (Roles.userIsInRole(this.userId, ['admin'])) {
        SimpleSchema.debug = true;
        let user_id;

        // Create a new user
        user_id = Accounts.createUser( {
          email:   form.email,
          profile: form.profile
        } );
        console.log( user_id );

        // Add some details to the new user account
        Meteor.users.update( user_id, {
          $set: {
            'roles':  form.roles,
            'status': form.status
          }
        } );

        // Send an enrollment Email to the new user
        Accounts.sendEnrollmentEmail(user_id);
        return user_id;
      } else {
        return;
      }
    } catch(e) {
      throw new Meteor.Error(e);
    }
  },
  updateUser: function (form, _id) {
    logger.info("Started updateUser method");

    check( form, Schema.UpdateUserFormSchema );
    check( _id, String );

    try {
      if (Roles.userIsInRole(this.userId, ['admin'])) {
        console.log(form.$set.emails[0].address);

        let user;

        // Create a new user
        user = Meteor.users.findOne( { _id: _id } );

        if(user.state && user.state.status && form.$set &&
          form.$set['state.status'] &&
          form.$set['state.status'] !== user.state.status) {
          Meteor.users.update({_id: _id}, { $set: {
              'state.updatedOn': new Date()
            }
          });
        }

        if(form.$set['state.status'] === 'disabled'){
          Utils.set_user_state(_id, 'disabled');
          return "Didn't change any account properties, only disabled the account";
        }

        if( user && user.emails[0].address === form.$set.emails[0].address ) {
          console.log( "Same email" );
          Meteor.users.update( { _id: _id }, form );
          return "Updated";
        } else {
          console.log( "Different email" );
          form.$set.emails[0].verified = false;
          let user_update = Meteor.users.update( { _id: user._id }, form );
          Accounts.sendVerificationEmail( user._id );
          return "Updated and sent enrollment email for new email address";
        }
      } else {
        return;
      }
    } catch(e) {
      console.log(e);
      throw new Meteor.Error(e);
    }
  },
  update_donation_options: function (arrayNames, selectedIds) {
    logger.info("Started update_donation_options method");

    check(arrayNames, Array);
    check(selectedIds, Array);

    try {
      if (Roles.userIsInRole(this.userId, ['admin'])) {
        console.log("Updating");

        Config.update( { "OrgInfo.web.domain_name": Meteor.settings.public.org_domain }, {
          $set: {
            "DonationOptions": arrayNames,
            "SelectedIDs": selectedIds
          }
        } );
      } else {
        return;
      }
    } catch(e){
      console.log(e);
      throw new Meteor.Error(e);
    }
  },
  search_collections: function(collectionName, searchValue, searchIn) {
    logger.info("Started search_collections method");

    check(collectionName, String);
    check(searchValue, String);
    check(searchIn, Array);

    try {
      if (Roles.userIsInRole(this.userId, ['admin'])) {
        console.log("Searching");
        let searchConstructor = {
          $or:
            _.map(searchIn, function(searchInValue) {
              return {
                [searchInValue]: {$regex: searchValue, $options: 'i' }
              }
            })

        };
        let root = Meteor.isClient ? window : global;
        // find the instance in the global context - e.g. window['Subscriptions']
        let collection = root[collectionName];

        console.dir(searchConstructor.$or);
        let search_result = collection.find( searchConstructor );
        console.log(search_result);

        return search_result;
      } else {
        return;
      }
    } catch(e){
      console.log(e);
      throw new Meteor.Error(e);
    }
  },
  update_user_roles: function(roles, user_id) {
    logger.info("Started update_user_roles method");

    check(roles, Array);
    check(user_id, String);

    try {
      if (Roles.userIsInRole(this.userId, ['admin'])) {
        console.log("Updating");

        Roles.setUserRoles(user_id, roles);
        return "Updated";
      } else {
        return;
      }
    } catch(e) {
      console.log(e);
      throw new Meteor.Error(e);
    }
  },
  deleteImageFile: function(name) {
    logger.info("Started deleteImageFile method");

    check(name, String);

    try {
      if (Roles.userIsInRole(this.userId, ['admin'])) {
        console.log("Deleting");
        FS.unlink(process.env.PWD + '/.uploads/' + name);
        FS.unlink(process.env.PWD + '/.uploads/thumbnailBig/' + name);
        FS.unlink(process.env.PWD + '/.uploads/thumbnailSmall/' + name);
        return "Done";
      } else {
        return;
      }
    } catch(e) {
      console.log(e);
      throw new Meteor.Error(e);
    }
  },
  afterUpdateInfoSection: function() {
    logger.info("Started afterUpdateInfoSection method");

    try {
      this.unblock();
      if( Roles.userIsInRole( this.userId, ['admin', 'manager'] ) ) {

        // We store our DonorTools username and password in our Meteor.settings
        // We store out Stripe keys in the Meteor.settings as well
        // Here we store the status of these settings in our Config document
        // This way we can show certain states from within the app, both to admins and
        // guests

        let config = Config.findOne({
          'OrgInfo.web.domain_name': Meteor.settings.public.org_domain
        });
        if (config) {
          if (!config.Settings.DonorTools) {
            config.Settings.DonorTools = {};
          }

          if (!config.Settings.Stripe) {
            config.Settings.Stripe = {};
          }

          if (Meteor.settings.donor_tools_user) {
            config.Settings.DonorTools.usernameExists = true;
          } else {
            config.Settings.DonorTools.usernameExists = false;
          }
          if (Meteor.settings.donor_tools_password) {
            config.Settings.DonorTools.passwordExists = true;
          } else {
            config.Settings.DonorTools.passwordExists = false;
          }
          if (Meteor.settings.stripe.secret) {
            config.Settings.Stripe.keysPublishableExists = true;
          } else {
            config.Settings.Stripe.keysPublishableExists = false;
          }
          if (Meteor.settings.public.stripe_publishable) {
            config.Settings.Stripe.keysSecretExists = true;
          } else {
            config.Settings.Stripe.keysSecretExists = false;
          }
          Config.update({_id: config._id}, {$set: config});
        }

        if (config.Settings.Stripe.keysSecretExists && config.Settings.Stripe.keysPublishableExists) {
          // If the necessary Stripe keys exist then create the Stripe plans needed for Give
          Utils.create_stripe_plans();
        }

        if (config.Settings.DonorTools.usernameExists && config.Settings.DonorTools.passwordExists) {
          // TODO: write the function that will go out to DT and setup the necessary funds, types,
          // and sources

        }
      }
    } catch(e) {
      console.log(e);
      throw new Meteor.Error(e);
    }
  },
  manual_gift_processed: function(donation_id) {
    logger.info("Started manual_gift_processed method");

    check(donation_id, String);
    try {
      this.unblock();
      if (Roles.userIsInRole(this.userId, ['admin', 'manager'])) {
        console.log("Sending");
        let customer_id = Donations.findOne({_id: donation_id}).customer_id;
        let email = Customers.findOne({_id: customer_id}).email;
        let dt_persona_match_id = Utils.find_dt_persona_flow( email, customer_id );
        console.log(dt_persona_match_id);

        Utils.update_stripe_customer_dt_persona_id(customer_id, dt_persona_match_id);

        // Send this manually processed gift to DT
        Utils.insert_manual_gift_into_donor_tools(donation_id, customer_id, dt_persona_match_id);

        // if this is frequency !== one_time then insert a copy of this
        // donation with the date set for created_at + 1 month also set the iterationCount to +1,
        // if it doesn't exist then set it to 2 (non-zero based count, so this would be the 2nd donation)
        if (Donations.findOne({_id: donation_id}).frequency !== 'one_time') {
          let newDonation = Donations.find({_id: donation_id}).fetch()[0];
          delete newDonation._id;
          delete newDonation.pendingSetup;
          delete newDonation.sessionId;
          delete newDonation.send_scheduled_email;
          newDonation.status = 'pending';
          // Add 1 month to the created date of this recurring gift and replace
          // the current created_at date
          let newDate = moment(newDonation.created_at * 1000)
            .add(1, 'months').unix();
          newDonation.created_at = newDate;
          if (newDonation.iterationCount) {
            newDonation.iterationCount++;
          } else {
            newDonation.iterationCount = '2';
          }
          Donations.insert(newDonation);
        }
        Donations.update({_id: donation_id}, {$set: {
          status: 'succeeded'
        }});
        return "Done";
      }
      return;
    } catch(e) {
      console.log(e);
      throw new Meteor.Error(e);
    }
  }
});
