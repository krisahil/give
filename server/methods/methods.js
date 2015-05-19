/*
 * Data: Read Users
 * Methods for reading user data in the database.
 */

Meteor.methods({
    admin_search: function(search_string) {
        if(this.userId !== Meteor.settings.admin_user) {
            throw new Meteor.Error(500, "This user can't run this method");
        }else{
            if (search_string.substring(0, 2) == "TX") {
                logger.info("Looking up a transaction from inside the admin panel");
                var record = Donate.find({'transactions.guid': search_string}).fetch();
                return record;
            } else{
                var records = Donate.find({$or: [ {_id: search_string}, {'customer.lname': search_string}, {'customer.fname': search_string}]}).fetch();
                return records;
            }
        }
    },
    cancel_recurring: function(id, guid) {
        logger.info("Started the cancel_recurring method call");
        var resultSet;
        var getSubscription;

        getSubscription = HTTP.get("https://billy.balancedpayments.com/v1/subscriptions/" + guid ,{ auth: Meteor.settings.billy_key + ':'});

        if(getSubscription && getSubscription.data.canceled !== true){
            logger.info("getSubscription.data.canceled = " + getSubscription.data.canceled);
            resultSet = HTTP.post("https://billy.balancedpayments.com/v1/subscriptions/" + guid + "/cancel/" , { auth: Meteor.settings.billy_key + ':'});
            Donate.update({'subscriptions.guid': guid}, {
                $set:{
                    'subscriptions.$.canceled': true,
                    'subscriptions.$.canceled_at': resultSet.data.canceled_at,
                    'subscriptions.$.invoice_count': resultSet.data.invoice_count,
                    'subscriptions.$.updated_at': resultSet.data.updated_at
                }
            });
            return resultSet;
        } else if (getSubscription && getSubscription.data.canceled === true) {
            logger.info("getSubscription.data.canceled = " + getSubscription.data.canceled);
            logger.info("This subscription is already canceled in the billy system. The record has been updated to reflect this.");
            Donate.update({'subscriptions.guid': guid}, {
                $set:{
                    'subscriptions.$.canceled': true,
                    'subscriptions.$.canceled_at': getSubscription.data.canceled_at,
                    'subscriptions.$.invoice_count': getSubscription.data.invoice_count,
                    'subscriptions.$.updated_at': getSubscription.data.updated_at
                }
            });
            return getSubscription;
        } else{
            throw new Meteor.Error(500, "Something went wronge here");
        }

    },
    get_dt_funds: function () {
        try {
            //check to see that the user is the admin user
            if(this.userId === Meteor.settings.admin_user){
                logger.info("Started get_dt_funds");
                var fundResults;
                fundResults = HTTP.get(Meteor.settings.donor_tools_site + '/settings/funds.json?per_page=1000', {
                    auth: Meteor.settings.donor_tools_user + ':' + Meteor.settings.donor_tools_password
                });
                Utils.separate_funds(fundResults.data);
                return fundResults.data;
            }else{
                console.log("You aren't an admin, you can't do that");
                return '';
            }

        } catch (e) {
            console.log(e);
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
        /*try {*/
        //Check the form to make sure nothing malicious is being submitted to the server
        Utils.checkFormFields(data);
        if(data.paymentInformation.coverTheFees === false){
            data.paymentInformation.fees = '';
        }
        console.log(data.paymentInformation.start_date);
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
            created_at:         data.paymentInformation.created_at,
            sessionId:          data.sessionId,
            URL:                data.URL,
            'donateTo':         donateTo,
            'donateWith':       data.paymentInformation.donateWith,
            'type':             data.paymentInformation.type,
            'total_amount':     data.paymentInformation.total_amount,
            'amount':           data.paymentInformation.amount,
            'fees':             data.paymentInformation.fees,
            'coveredTheFees':   data.paymentInformation.coverTheFees,
            'customer_id':      customerData.id,
            'status':           'pending',
            'frequency':        data.paymentInformation.is_recurring,
            'dt_donation_id':   null
        };


        data._id = Donations.insert(metadata);
        logger.info("Donation ID: " + data._id);

        for (var attrname in customerInfo) { metadata[attrname] = customerInfo[attrname]; }
        delete metadata.URL;
        delete metadata.created_at;
        delete metadata.sessionId;
        delete metadata.status;
        delete metadata.type;
        delete metadata.total_amount;

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
            console.log(data.paymentInformation.is_recurring);

            //Start a subscription (which also connects this card, or bank_account to the customer
            var charge_object = Utils.charge_plan(data.paymentInformation.total_amount,
                    data._id, customerData.id, data.paymentInformation.source_id,
                    data.paymentInformation.is_recurring, data.paymentInformation.start_date, metadata);
             if (!charge_object.object) {
                 if(charge_object === 'scheduled') {
                     return {c: customerData.id, don: data._id, charge: 'scheduled'};
                 } else{
                     logger.error("The charge_id object didn't have .object attached.");
                     return {error: charge.rawType, message: charge.message};
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
    get_balanced_customer_data: function (id) {
        /*try {*/
            //check to see that the user is the admin user
            check(id, String);

            // Check that there is an authorized, logged-in user
            var loggedInUser = Meteor.user();
            if (!loggedInUser || !Roles.userIsInRole(loggedInUser, ['admin'])) {
                throw new Meteor.Error(403, "Access denied")
            }

            logger.info("Started get_balanced_customer_data");
            if (id === 'all') {
                var all_ids = Customers.find();
                var customers_updated = [];
                var stripe_customer;
                var get_customer;
                all_ids.forEach(function (value) {
                    customers_updated.push(value._id);
                    stripe_customer = Utils.get_stripe_customer(value._id);
                    if(!stripe_customer.metadata.balanced_customer_id){
                        var temp_id = Customers.findOne({_id: value.id});
                        console.log("TEMP_ID: " + temp_id.metadata.balanced_customer_id);
                        stripe_customer.metadata.balanced_customer_id = temp_id.metadata.balanced_customer_id;
                    }
                    if(stripe_customer && stripe_customer.metadata && stripe_customer.metadata.balanced_customer_id){
                        get_customer = Utils.get_balanced_customer(stripe_customer.metadata.balanced_customer_id);
                        if(!get_customer){
                            logger.error("Couldn't find any record matching in get_balanced_customer function: " + value._id);
                            return;
                        }

                        //send this metadata to Stripe to update the customer
                        logger.info("Updating stripe customer with Balanced data.");
                        var updated_customer = Utils.update_stripe_customer_with_balanced_data(get_customer, value._id, stripe_customer);
                    } else if(stripe_customer && stripe_customer.metadata && stripe_customer.metadata['balanced.customer_id']){
                        get_customer = Utils.get_balanced_customer(stripe_customer.metadata['balanced.customer_id']);
                        if(!get_customer){
                            logger.error("Couldn't find any record matching in get_balanced_customer function: " + value._id);
                            return;
                        }

                        //send this metadata to Stripe to update the customer
                        logger.info("Updating stripe customer with Balanced data.");
                        var updated_customer = Utils.update_stripe_customer_with_balanced_data(get_customer, value._id, stripe_customer);
                    }

                });
                return "Updated these " + customers_updated.length + " customers: " + customers_updated;
            } else {
                stripe_customer = Utils.get_stripe_customer(id);
                if(!stripe_customer.metadata.balanced_customer_id){
                    var temp_id = Customers.findOne({_id: id});
                    console.log("TEMP_ID: " + temp_id.metadata.balanced_customer_id);
                    stripe_customer.metadata.balanced_customer_id = temp_id.metadata.balanced_customer_id;
                }
                if(stripe_customer && stripe_customer.metadata && stripe_customer.metadata.balanced_customer_id){
                    get_customer = Utils.get_balanced_customer(stripe_customer.metadata.balanced_customer_id);
                    if(!get_customer){
                        logger.error("Couldn't find any record matching in get_balanced_customer function: " + id);
                        return;
                    }

                    //send this metadata to Stripe to update the customer
                    logger.info("Updating stripe customer with Balanced data.");
                    var updated_customer = Utils.update_stripe_customer_with_balanced_data(get_customer, id, stripe_customer);
                } else if(stripe_customer && stripe_customer.metadata && stripe_customer.metadata['balanced.customer_id']){
                    get_customer = Utils.get_balanced_customer(stripe_customer.metadata['balanced.customer_id']);
                    if(!get_customer){
                        logger.error("Couldn't find any record matching in get_balanced_customer function: " + id);
                        return;
                    }

                    //send this metadata to Stripe to update the customer
                    logger.info("Updating stripe customer with Balanced data.");
                    var updated_customer = Utils.update_stripe_customer_with_balanced_data(get_customer, id, stripe_customer);
                }
                return get_customer;
            }

        /*} catch (e) {
            console.log(e);
            //e._id = AllErrors.insert(e.response);
            var error = (e.response);
            throw new Meteor.Error(error, e._id);
        }*/
    },
    get_all_stripe_customers: function (starting_after, limit){
        check(starting_after, Match.Optional(String));
        check(limit, String);
        // Check that there is an authorized, logged-in user
        var loggedInUser = Meteor.user();
        if (!loggedInUser || !Roles.userIsInRole(loggedInUser, ['admin'])) {
            throw new Meteor.Error(403, "Access denied")
        }
        logger.info("Started get_all_stripe_customers");

        var all_stripe_events = [];
        var stripe_events = {};

        do{
            stripe_events = Utils.stripe_get_many_events(starting_after, limit);
            all_stripe_events = all_stripe_events.concat(stripe_events.data);
            if(stripe_events.has_more){
                starting_after = stripe_events.data[99].id;
            }
        } while(stripe_events.has_more);

        all_stripe_events.forEach(function (value){
            if(value.created < '1431987650'){
                var request = value;
                var event = Stripe_Events[request.type](request);
            }
        });

        return {"Stripe events number": all_stripe_events.length, "array": all_stripe_events};
    }

});
