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
              console.log(customerData);
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
                Utils.send_new_dt_account_added_email_to_support_email_contact(data.customer.email_address, user_id, dt_account_id);

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

              console.log(metadata);
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
    update_persona_info: function () {
        logger.info("Started update_persona_info");

      if(this.userId){
        var persona_ids;
        persona_ids = Meteor.users.findOne({_id: this.userId}).persona_id;
        logger.info(persona_ids);
        var email_address = Meteor.users.findOne({_id: this.userId}).emails[0].address;
        var persona_info = Utils.check_for_dt_user(email_address, persona_ids, true);
        Meteor.users.update({_id: this.userId}, {$set: {'persona_info': persona_info.persona_info}});
        Meteor.users.update({_id: this.userId}, {$set: {'persona_ids': persona_info.persona_ids}});
      } else {
        return "Nope";
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
    GetStripeEvent: function (id) {
        logger.info("Started GetStripeEvent");
        if (Roles.userIsInRole(this.userId, ['admin'])) {
            try {
                //Check the form to make sure nothing malicious is being submitted to the server
                check(id, String);
                var stripe_event = new Future();

                Stripe.events.retrieve(id,
                    function (error, events) {
                        if (error) {
                            stripe_event.return(error);
                        } else {
                            stripe_event.return(events);
                        }
                    }
                );

                stripe_event = stripe_event.wait();

                if (!stripe_event.object) {
                    throw new Meteor.Error(stripe_event.rawType, stripe_event.message);
                }

                var event = Stripe_Events[stripe_event.type](stripe_event);
                return stripe_event;

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
        63667, 63692, 63695, 64197, 64590, 67273, 67274, 67276, 67277, 67282
      ];
      fundsList.forEach( function ( fundId ) {
        Utils.getFundHistory(fundId, dateStart, dateEnd);
      });

      console.log("Got all funds history");
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
  }

});
