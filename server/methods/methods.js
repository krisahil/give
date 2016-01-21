/*
 * Data: Read Users
 * Methods for reading user data in the database.
 */

Meteor.methods({
    get_dt_funds: function () {
        try {
            //check to see that the user is the admin user
            if (Roles.userIsInRole(this.userId, ['admin'])) {
                logger.info("Started get_dt_funds");
                var fundResults;
                fundResults = HTTP.get(Meteor.settings.donor_tools_site + '/settings/funds.json?per_page=1000', {
                    auth: Meteor.settings.donor_tools_user + ':' + Meteor.settings.donor_tools_password
                });
                Utils.separate_funds(fundResults.data);
                return fundResults.data;
            } else{
                logger.info("You aren't an admin, you can't do that");
                return '';
            }

        } catch (e) {
            logger.info(e);
            //e._id = AllErrors.insert(e.response);
            var error = (e.response);
            throw new Meteor.Error(error, e._id);
        }
    },
    get_dt_sources: function () {
        try {
            //check to see that the user is the admin user
            if (Roles.userIsInRole(this.userId, ['admin'])) {
                logger.info("Started get_dt_sources");
                var sourceResults;
                sourceResults = HTTP.get(Meteor.settings.donor_tools_site + '/settings/sources.json?per_page=1000', {
                    auth: Meteor.settings.donor_tools_user + ':' + Meteor.settings.donor_tools_password
                });
                Utils.separate_sources(sourceResults.data);
                return sourceResults.data;
            } else{
                logger.info("You aren't an admin, you can't do that");
                return '';
            }

        } catch (e) {
            logger.info(e);
            //e._id = AllErrors.insert(e.response);
            var error = (e.response);
            throw new Meteor.Error(error, e._id);
        }
    },
    update_customer: function (form, customer_id, dt_persona_id) {

        //Check the client side form fields with the Meteor 'check' method
        Utils.check_update_customer_form(form, customer_id, dt_persona_id);

        // Send the user's contact updates to balanced
        Utils.update_stripe_customer(form, customer_id);

        // Send the user's contact updates to Donor Tools
        Utils.update_dt_account(form, dt_persona_id);
        return '1';
    },
    stripeDonation: function(data, paymentDevice){
        logger.info("Started stripeDonation");
        /*try {*/
            //Check the form to make sure nothing malicious is being submitted to the server
            Utils.checkFormFields(data);
            if(data.paymentInformation.coverTheFees === false){
                data.paymentInformation.fees = '';
            }
            logger.info(data.paymentInformation.start_date);
            let customerData = {};
            let donateTo, user_id, dt_account_id, letCustomerData, customerInfo, metadata;

            //Convert donation to more readable format
            donateTo = Utils.getDonateTo(data.paymentInformation.donateTo);

            if(donateTo === 'Write In') {
                donateTo = data.paymentInformation.writeIn;
            }
            if(!data.customer.id){
              customerData = Utils.create_customer(data.paymentInformation.token_id, data.customer);

              letCustomerData = customerData;

              // Skip this area for 2 seconds so the giver sees the next page without waiting
              // for this area to return
              Meteor.setTimeout(function () {

                // Find a local user account, create if it doesn't exist
                user_id =       StripeFunctions.find_user_account_or_make_a_new_one(letCustomerData);

                // Find a DonorTools account, create one if the account either
                // doesn't exist or if the existing match doesn't look like the
                // same person or business as what already exists.
                dt_account_id = Utils.find_dt_account_or_make_a_new_one(letCustomerData, user_id);
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
                if(Meteor.users.findOne( {_id: user_id } ) && Meteor.users.findOne( {_id: user_id } ).newUser ){
                  Meteor.users.update( {_id: user_id }, { $unset: { newUser: "" } } );
                  Utils.send_new_dt_account_added_email_to_support_email_contact(data.customer.email_address, user_id, dt_account_id);
                }

                // Update the Stripe customer metadata to include this DT persona (account) ID
                StripeFunctions.add_dt_account_id_to_stripe_customer_metadata(customerData.id, dt_account_id);
              }, 2000 /* wait 2 seconds before executing the functions above */);

              if(!customerData.object){
                console.error("Error: ", customerData);
                    return {error: customerData.rawType, message: customerData.message};
                }
              // Update the card metadata so we know if the user wanted this card saved or not
              Utils.update_card(customerData.id, data.paymentInformation.source_id, data.paymentInformation.saved);
            } else{
                //TODO: change these to match what you'll be using for a Stripe customer that already exists
                var customer_cursor = Customers.findOne({_id: data.customer.id});
                customerData.id = customer_cursor._id;
                Utils.update_card(customerData.id, data.paymentInformation.source_id, data.paymentInformation.saved);
            }
            customerInfo = {
                "city":             data.customer.city,
                "state":            data.customer.region,
                "address_line1":    data.customer.address_line1,
                "address_line2":    data.customer.address_line2,
                "country":          data.customer.country,
                "postal_code":      data.customer.postal_code,
                "phone":            data.customer.phone_number,
                "business_name":    data.customer.org,
                "email":            data.customer.email_address,
                "fname":            data.customer.fname,
                "lname":            data.customer.lname
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
                'total_amount':         data.paymentInformation.total_amount,
                'type':                 data.paymentInformation.type,
                'sessionId':            data.sessionId
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

            if (data.paymentInformation.is_recurring === "one_time") {


                //Charge the card (which also connects this card or bank_account to the customer)
                var charge = Utils.charge(data.paymentInformation.total_amount, data._id, customerData.id, data.paymentInformation.source_id, metadata);
                if(!charge.object){
                    return {error: charge.rawType, message: charge.message};
                }
                Donations.update({_id: data._id}, {$set: {charge_id: charge.id}});

                return {c: customerData.id, don: data._id, charge: charge.id};
            } else {
                // Print how often it it recurs?
                logger.info(data.paymentInformation.is_recurring);

                //Start a subscription (which also connects this card, or bank_account to the customer
                var charge_object = Utils.charge_plan(data.paymentInformation.total_amount,
                        data._id, customerData.id, data.paymentInformation.source_id,
                        data.paymentInformation.is_recurring, data.paymentInformation.start_date, metadata);
                 if (!charge_object.object) {
                     if(charge_object === 'scheduled') {
                         return {c: customerData.id, don: data._id, charge: 'scheduled'};
                     } else{
                         logger.error("The charge_id object didn't have .object attached.");
                         return {error: charge_object.rawType, message: charge_object.message};
                     }
                 }

                // check for payment rather than charge id here
                var return_charge_or_payment_id;
                if(charge_object.payment){
                    return_charge_or_payment_id = charge_object.payment;
                } else {
                    return_charge_or_payment_id = charge_object.charge;
                }
                return {c: customerData.id, don: data._id, charge: return_charge_or_payment_id};
            }
        /*} catch (e) {
            logger.error("Got to catch error area of processPayment function." + e + " " + e.reason);
            logger.error("e.category_code = " + e.category_code + " e.descriptoin = " + e.description);
            if(e.category_code) {
                logger.error("Got to catch error area of create_associate. ID: " + data._id + " Category Code: " + e.category_code + ' Description: ' + e.description);
                var debitSubmitted = '';
                if(e.category_code === 'invalid-routing-number'){
                    debitSubmitted = false;
                }
                Donations.update(data._id, {
                    $set: {
                    'failed.category_code': e.category_code,
                    'failed.description': e.description,
                    'failed.eventID': e.request_id,
                    'debit.status': 'failed',
                    'debit.submitted': debitSubmitted
                    }
                });
                throw new Meteor.Error(500, e.category_code, e.description);
            } else {
                throw new Meteor.Error(500, e.reason, e.details);
            }
        }*/
    },
    update_user_document_by_adding_persona_details_for_each_persona_id: function () {
        logger.info("Started update_user_document_by_adding_persona_details_for_each_persona_id");

      if(this.userId){
        let persona_ids, email_address;
        persona_ids = Meteor.users.findOne({_id: this.userId}).persona_ids;
        persona_id = Meteor.users.findOne({_id: this.userId}).persona_id;
        email_address = Meteor.users.findOne({_id: this.userId}).emails[0].address;

        if(!persona_ids && persona_id) {
          logger.info("No persona_ids, but did find persona_id");
          persona_ids = persona_id;
        }

        if(persona_ids && persona_ids.length) {
          // The persona_ids let is an array
          logger.info("Multiple persona_ids found: ", persona_ids);

          // Since the donor tools information can change way down in the record
          // we don't want to simply do an $addToSet, this will lead to many
          // duplicate records, instead, setup a temp array let and then inside
          // the forEach push the personas into it
          // After we'll use the array to set the persona_info inside the user document

          var set_this_array = [];

          // Loop through the persona_ids
          _.forEach(persona_ids, function(each_persona_id) {
            let personaResult = HTTP.get(Meteor.settings.donor_tools_site + "/people/" + each_persona_id + ".json", {
              auth: Meteor.settings.donor_tools_user + ':' + Meteor.settings.donor_tools_password
            });
            set_this_array.push(personaResult.data.persona);
          })
        } else if( persona_ids ){
          // TODO: the persona_ids let is not an array, need to check that a value exists
          logger.info("Single persona_id found: ", persona_ids);
          let personaResult = HTTP.get(Meteor.settings.donor_tools_site + "/people/" + persona_ids + ".json", {
            auth: Meteor.settings.donor_tools_user + ':' + Meteor.settings.donor_tools_password
          });
          set_this_array.push(personaResult.data.persona);
        }

        Meteor.users.update({_id: this.userId}, {$set: {'persona_info': set_this_array}});

        return "Finished update_user_document_by_adding_persona_details_for_each_persona_id method call";
      } else {
        return "Not logged in.";
      }
    },
    move_donation_to_other_person: function (donation_id, move_to_id) {
        check(donation_id, String);
        check(move_to_id, String);
        if (Roles.userIsInRole(this.userId, ['admin'])) {

            // Move a donation from one persona_id to another
            logger.info("Inside move_donation_to_other_person.");

            logger.info("Moving donation: " + donation_id);
            logger.info("Moving donation to: " + move_to_id);

            // Get the donation from DT
            var get_donation = HTTP.get(Meteor.settings.donor_tools_site + '/donations/' + donation_id + '.json', {
                auth: Meteor.settings.donor_tools_user + ':' + Meteor.settings.donor_tools_password
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
            movedDonation = HTTP.post(Meteor.settings.donor_tools_site + '/donations.json', {
                data: {
                    donation: get_donation.data.donation
                },
                auth: Meteor.settings.donor_tools_user + ':' + Meteor.settings.donor_tools_password
            });

            // Check that the response from the DT server is what of the expected format
            if(movedDonation && movedDonation.data && movedDonation.data.donation && movedDonation.data.donation.persona_id){
                // Send the id of this new DT donation to the function which will update the charge to add that meta text.
                Utils.update_charge_with_dt_donation_id(get_donation.data.donation.transaction_id, movedDonation.data.donation.id);

                // Delete the old DT donation, I've setup an async callback because I'm getting a 406 response from DT, but the delete is still going through
                var deleteDonation;
                deleteDonation = HTTP.del(Meteor.settings.donor_tools_site + '/donations/' + donation_id + '.json', {auth: Meteor.settings.donor_tools_user + ':' + Meteor.settings.donor_tools_password}, function(err, result){
                    if(err){
                        console.dir(err);
                        return err;
                    } else {
                        console.dir(result);
                        return result;
                    }
                });

                DT_donations.remove(Number(donation_id));
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

              if(process){
                let thisRequest = {id: id};
                StripeFunctions.control_flow_of_stripe_event_processing(thisRequest);
                return "Sent to control_flow_of_stripe_event_processing for processing";
              } else {
                var stripe_event = new Future();

                Stripe.events.retrieve( id,
                  function ( error, events ) {
                    if( error ) {
                      stripe_event.return( error );
                    } else {
                      stripe_event.return( events );
                    }
                  }
                );

                stripe_event = stripe_event.wait();

                if( !stripe_event.object ) {
                  throw new Meteor.Error( stripe_event.rawType, stripe_event.message );
                }

                var event = Stripe_Events[stripe_event.type]( stripe_event );
                return stripe_event;
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
      // This is the fund ids for community sponsorship
      var fundsList = [
        63667, 63692, 63695, 64197, 64590, 67273, 67274, 67276, 67277, 67282, 64197
      ];
      fundsList.forEach( function ( fundId ) {
        Utils.getFundHistory(fundId, dateStart, dateEnd);
      });

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
    if (Roles.userIsInRole(this.userId, ['admin', 'reports'])) {
      // Get the persona from DT
      let persona_result = HTTP.get(Meteor.settings.donor_tools_site + '/people/' + id + '.json', {
        auth: Meteor.settings.donor_tools_user + ':' + Meteor.settings.donor_tools_password
      });
      if( persona_result && persona_result.data && persona_result.data.persona ) {
        return persona_result.data.persona;
      } else {
        return null;
      }
    } else {
      return;
    }

  },
  get_next_or_previous_transfer: function (current_transfer_id, previous_or_next) {
    logger.info("Started get_next_or_previous_transfer method");

    check(current_transfer_id, String);
    check(previous_or_next, String);
    if (Roles.userIsInRole(this.userId, ['admin', 'reports'])) {
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
      dt_account_id = Utils.find_dt_account_or_make_a_new_one( customer, user_id );
      wait_for_user_update = Meteor.users.update( { _id: user_id }, { $addToSet: { persona_ids: dt_account_id } } );
      Utils.send_new_dt_account_added_email_to_support_email_contact( customer.email, user_id, dt_account_id );
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
    if (Roles.userIsInRole(this.userId, ['admin', 'reports'])) {
      let stripe_response = Utils.stripe_set_transfer_posted_metadata(transfer_id, checkbox_state);
      Transfers.update({_id: transfer_id}, {$set: { 'metadata.posted': checkbox_state } });
      return stripe_response;
    } else {
      return;
    }
  }
});
