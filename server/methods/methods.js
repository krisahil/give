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
    update_customer: function (form, customer_id, dt_persona_id) {

        //Check the client side form fields with the Meteor 'check' method
        Utils.check_update_customer_form(form, customer_id, dt_persona_id);

        // Send the user's contact updates to balanced
        Utils.update_stripe_customer(form, customer_id);

        // Send the user's contact updates to Donor Tools
        Utils.update_dt_account(form, dt_persona_id);
    },
    stripeDonation: function(data, paymentDevice){
        logger.info("Started stripeDonation");
        try {
            //Check the form to make sure nothing malicious is being submitted to the server
            Utils.checkFormFields(data);
            if(data.paymentInformation.coverTheFees === false){
                data.paymentInformation.fees = '';
            }
            logger.info(data.paymentInformation.start_date);
            var customerData = {};
            var customerInfo, metadata;

            //Convert donation to more readable format
            var donateTo = Utils.getDonateTo(data.paymentInformation.donateTo);

            if(donateTo === 'Write In') {
                donateTo = data.paymentInformation.writeIn;
            }
            if(!data.customer.id){
                customerData = Utils.create_customer(data.paymentInformation.token_id, data.customer);
                if(!customerData.object){
                    return {error: customerData.rawType, message: customerData.message};
                }
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
                'dt_source':            data.paymentInformation.dt_source[0],
                'fees':                 data.paymentInformation.fees,
                'frequency':            data.paymentInformation.is_recurring,
                'sessionId':            data.sessionId,
                'status':               'pending',
                'send_scheduled_email': data.paymentInformation.send_scheduled_email,
                'total_amount':         data.paymentInformation.total_amount,
                'type':                 data.paymentInformation.type,
                'URL':                  data.URL
            };


            data._id = Donations.insert(metadata);
            logger.info("Donation ID: " + data._id);

            for (var attrname in customerInfo) { metadata[attrname] = customerInfo[attrname]; }
            delete metadata.created_at;
            delete metadata.sessionId;
            delete metadata.status;
            delete metadata.total_amount;
            delete metadata.type;
            delete metadata.URL;

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
        } catch (e) {
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
        }
    },
    update_persona_info: function () {
        logger.info("Started update_persona_info");

        var persona_ids;
        persona_ids = Meteor.users.findOne({_id: this.userId}).persona_id;
        logger.info(persona_ids);
        var email_address = Meteor.users.findOne({_id: this.userId}).emails.address;
        var persona_info = Utils.check_for_dt_user(email_address, persona_ids, true);
        Meteor.users.update({_id: this.userId}, {$set: {'persona_info': persona_info.persona_info}});
        Meteor.users.update({_id: this.userId}, {$set: {'persona_ids': persona_info.persona_ids}});
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
    }
});
