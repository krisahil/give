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
            case 'TimmCollins':
                returnToCalled = 'Basecamp - Timm Collins';
                return returnToCalled;
                break;
            case 'JonDeMeo':
                returnToCalled = 'Basecamp - Jon DeMeo';
                return returnToCalled;
                break;
            case 'BrettDurbin':
                returnToCalled = 'Basecamp - Brett Durbin';
                return returnToCalled;
                break;
            case 'JohnKazaklis':
                returnToCalled = 'Basecamp - John Kazaklis';
                return returnToCalled;
                break;
            case 'LindseyKeller':
                returnToCalled = 'Basecamp - Lindsey Keller';
                return returnToCalled;
                break;
            case 'EthanPope':
                returnToCalled = 'Basecamp - Ethan Pope';
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
            case 'IsaacTarwater':
                returnToCalled = 'Basecamp - Isaac Tarwater';
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

        var stripeCustomer = new Future();
        var type;

        if (paymentDevice.slice(0, 2) === 'to') {
            type = "card";
            Stripe.customers.create({
                card: paymentDevice,
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
            }, function (error, customer) {
                if (error) {
                    //console.dir(error);
                    stripeCustomer.return(error);
                } else {
                    console.log("LOOK HERE ************_____________");
                    console.dir(customer);
                    stripeCustomer.return(customer);
                }
            });
        } else if (paymentDevice.slice(0, 2) === 'bt') {
            /**/
            console.log("Bank_account");
            type = "bank_account";
            Stripe.customers.create({
                bank_account: paymentDevice,
                email: customerInfo.email_address,
                metadata: {
                    "city": customerInfo.city,
                    "state": customerInfo.region,
                    "address_line1": customerInfo.address_line1,
                    "address_line2": customerInfo.address_line2,
                    "postal_code": customerInfo.postal_code,
                    "country": customerInfo.country,
                    "phone": customerInfo.phone_number,
                    "business_name": customerInfo.org,
                    "email": customerInfo.email_address,
                    "fname": customerInfo.fname,
                    "lname": customerInfo.lname
                }
            }, function (error, customer) {
                if (error) {
                    //console.dir(error);
                    stripeCustomer.return(error);
                } else {
                    stripeCustomer.return(customer);
                }
            });
        } else {
            throw new Meteor.Error('Token-match', "Sorry, that token doesn't match any know prefix.");
        }
        stripeCustomer = stripeCustomer.wait();
        if (!stripeCustomer.object) {
            throw new Meteor.Error(stripeCustomer.rawType, stripeCustomer.message);
        }
        stripeCustomer._id = stripeCustomer.id;

        Customers.insert(stripeCustomer);
        logger.info("Customer_id: " + stripeCustomer.id);
        return stripeCustomer;
    },
    charge: function (total, donation_id, customer_id, payment_id, metadata) {
        logger.info("Inside charge.");

        var stripeCharge = new Future();

        Stripe.charges.create({
            amount: total,
            currency: "usd",
            customer: customer_id,
            source: payment_id,
            metadata: metadata
        }, function (error, charge) {
            if (error) {
                //console.dir(error);
                stripeCharge.return(error);
            } else {
                stripeCharge.return(charge);
            }
        });
        stripeCharge = stripeCharge.wait();
        if (!stripeCharge.object) {
            throw new Meteor.Error(stripeCharge.rawType, stripeCharge.message);
        }
        stripeCharge._id = stripeCharge.id;

        console.dir(stripeCharge);
        // Add charge response from Stripe to the collection
        Charges.insert(stripeCharge);
        logger.info("Finished Stripe charge. Charges ID: " + stripeCharge._id);
        return stripeCharge;
    },
    charge_plan: function (total, donation_id, customer_id, payment_id, frequency, start_date, metadata) {
        logger.info("Inside charge_plan.");
        console.log("Start date: " + start_date);

        var plan, subscription_frequency;
        subscription_frequency = frequency;

        switch (subscription_frequency) {
            case "monthly":
                plan = Meteor.settings.stripe.plan.monthly;
                break;
            case "weekly":
                plan = Meteor.settings.stripe.plan.weekly;
                break;
            case "daily":
                plan = Meteor.settings.stripe.plan.daily;
                break;
        }

        var attributes = {
            plan: plan,
            quantity: total,
            metadata: metadata
        };
        if (start_date === 'today') {
        } else {
            attributes.trial_end = start_date;
        }
        var stripeChargePlan = new Future();
        Stripe.customers.createSubscription(
            customer_id,
            attributes,
            function (error, charge) {
                if (error) {
                    //console.dir(error);
                    stripeChargePlan.return(error);
                } else {
                    stripeChargePlan.return(charge);
                }
            });
        stripeChargePlan = stripeChargePlan.wait();
        if (!stripeChargePlan.object) {
            throw new Meteor.Error(stripeChargePlan.rawType, stripeChargePlan.message);
        }
        stripeChargePlan._id = stripeChargePlan.id;
        console.log("Stripe charge Plan information");
        console.dir(stripeChargePlan);
        // Add charge response from Stripe to the collection
        Subscriptions.insert(stripeChargePlan);
        Donations.update({_id: donation_id}, {$set: {subscription_id: stripeChargePlan.id}});
        if (start_date === 'today') {
            var stripeInvoiceList = new Future();
            // Query Stripe to get the first invoice from this new subscription
            Stripe.invoices.list(
                {customer: customer_id, limit: 1},
                function (error, invoice) {
                    if (error) {
                        stripeInvoiceList.return(error);
                    } else {
                        stripeInvoiceList.return(invoice);
                    }
                });

            stripeInvoiceList = stripeInvoiceList.wait();

            logger.info("Finished Stripe charge_plan. Subscription ID: " + stripeChargePlan.id);
            console.dir(stripeInvoiceList);
            return stripeInvoiceList.data[0];
        } else {
            Utils.send_scheduled_email(donation_id, stripeChargePlan.id, subscription_frequency, total);
            return 'scheduled';
        }
    },
    audit_email: function (id, type, failure_message, failure_code) {
        logger.info("Inside audit_email.");

        if (type === 'charge.pending') {
            Audit_trail.upsert({charge_id: id}, {
                    $set: {
                        'charge.pending.sent': true,
                        'charge.pending.time': new Date()
                    }
                }
            );
        } else if (type === 'charge.succeeded') {
            Audit_trail.upsert({charge_id: id}, {
                    $set: {
                        'charge.succeeded.sent': true,
                        'charge.succeeded.time': new Date()
                    }
                }
            );
        } else if (type === 'large_gift') {
            Audit_trail.upsert({charge_id: id}, {
                    $set: {
                        'charge.large_gift.sent': true,
                        'charge.large_gift.time': new Date()
                    }
                }
            );
        } else if (type === 'charge.failed') {
            Audit_trail.upsert({charge_id: id}, {
                $set: {
                    'charge.failed.sent':       true,
                    'charge.failed.time':       new Date(),
                    'charge.failure_message':   failure_message,
                    'charge.failure_code':      failure_code
                }
            });
        }
        else if (type === 'subscription.scheduled') {
            Audit_trail.upsert({subscription_id: id}, {
                $set: {
                    'subscription_scheduled.sent': true,
                    'subscription_scheduled.time': new Date()
                }
            });
        }
    },
    get_frequency_and_subscription: function (invoice_id) {
        logger.info("Started get_frequency");

        var return_this = {};
        return_this.subscription = Invoices.findOne({_id: invoice_id}) && Invoices.findOne({_id: invoice_id}).subscription;
        return_this.frequency = return_this.subscription &&
            Subscriptions.findOne({_id: return_this.subscription}) &&
            Subscriptions.findOne({_id: return_this.subscription}).plan.interval;

        if (return_this.frequency == null || return_this.subscription == null) {
            var get_invoice = Utils.get_invoice(invoice_id);
            if(get_invoice && get_invoice.subscription){
                return_this.subscription = get_invoice.subscription;
                return_this.frequency = get_invoice.lines.data[0].plan.interval;
                return return_this;
            } else{
                logger.error("Something went wrong, there doesn't seem to be an invoice with that id, exiting");
                return;
            }

        }
        return return_this;
    },
    store_stripe_event: function (event_body) {
        logger.info("Started store_stripe_event");
        
        console.dir(event_body);
        event_body.data.object._id = event_body.data.object.id;

        switch(event_body.data.object.object){
            case "customer":
                if(event_body.data.object.metadata['balanced.customer_id']){
                    event_body.data.object.metadata['balancedU+FF0Ecustomer_id'] = event_body.data.object.metadata['balanced.customer_id'];
                    delete event_body.data.object.metadata['balanced.customer_id'];
                }
                Customers.upsert({_id: event_body.data.object._id}, event_body.data.object);
                break;
            case "invoice":
                Invoices.upsert({_id: event_body.data.object._id}, event_body.data.object);
                break;
            case "charge":
                Charges.upsert({_id: event_body.data.object._id}, event_body.data.object);
                break;
            case "payment":
                Charges.upsert({_id: event_body.data.object._id}, event_body.data.object);
                break;
            case "card":
                Devices.upsert({_id: event_body.data.object._id}, event_body.data.object);
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
    charge_events: function(stripeEvent){
        logger.info("Started charge_events");

        var sync_request = Utils.store_stripe_event(stripeEvent);

        var frequency_and_subscription;
        if(stripeEvent.data.object.invoice) {
            // Now send these changes off to Stripe to update the record there.
            Utils.update_charge_metadata(stripeEvent);

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
    },
    link_card_to_customer: function(customer_id, token_id, type, customerInfo){
        logger.info("Started link_card_to_customer");

        var stripeCreateCard = new Future();
        var payment_device = {};

        if(type === 'card') {
            payment_device.card = token_id;
        } else{
            payment_device.bank_account = token_id;
        }

        Stripe.customers.createCard(
            customer_id,
            payment_device,
            function (error, card) {
                if (error) {
                    //console.dir(error);
                    stripeCreateCard.return(error);
                } else {
                    stripeCreateCard.return(card);
                }
            }
        );

        stripeCreateCard = stripeCreateCard.wait();

        if (!stripeCreateCard.object) {
            if(stripeCreateCard.message === "A bank account with that routing number and account number already exists for this customer."){
                logger.info("Woops, that is a duplicate account, running the create customer function to fix this.");
                var customer = Utils.create_customer(token_id, customerInfo);
                return customer;
            }
            throw new Meteor.Error(stripeCreateCard.rawType, stripeCreateCard.message);
        }

        stripeCreateCard._id = stripeCreateCard.id;
        console.dir(stripeCreateCard);

        return stripeCreateCard;
    },
    update_card: function(customer_id, card_id, saved){
        logger.info("Started update_card");
        logger.info("Customer: " + customer_id + " card_id: " + card_id + " saved: " + saved);

        var stripeUpdatedCard = new Future();

        Stripe.customers.updateCard(
            customer_id,
            card_id,{
                metadata: {
                    saved: saved
                }
            },
            function (error, card) {
                if (error) {
                    //console.dir(error);
                    stripeUpdatedCard.return(error);
                } else {
                    stripeUpdatedCard.return(card);
                }
            }
        );

        stripeUpdatedCard = stripeUpdatedCard.wait();

        if (!stripeUpdatedCard.object) {
            throw new Meteor.Error(stripeUpdatedCard.rawType, stripeUpdatedCard.message);
        }

        stripeUpdatedCard._id = stripeUpdatedCard.id;
        console.dir(stripeUpdatedCard);

        return stripeUpdatedCard;
    },
    add_meta_from_subscription_to_charge: function(stripeEvent) {
        logger.info("Started add_meta_from_subscription_to_charge");

        // setup a cursor for this subscription
        var subscription_cursor = Subscriptions.findOne({_id: stripeEvent.data.object.subscription});

        // update the charges document to add the metadata, this way the related gift information is attached to the charge
        Charges.update({_id: stripeEvent.data.object.charge}, {$set: {metadata: subscription_cursor.metadata}});

        // update the invoices document to add the metadata
        Invoices.update({_id: stripeEvent.data.object.id}, {$set: {metadata: subscription_cursor.metadata}});

        // Now send these changes off to Stripe to update the record there.
        Utils.update_invoice_metadata(stripeEvent);
    },
    stripe_get_subscription: function(invoice_id){
        logger.info("Started stripe_get_subscription");

    },
    update_stripe_customer: function(form, customer_id){
        logger.info("Inside update_stripe_customer.");
        console.log(form.address.city);

        var stripeCustomerUpdate = new Future();

        Stripe.customers.update(customer_id, {
                "metadata": {
                    "city":            form.address.city,
                    "state":           form.address.state,
                    "address_line1":   form.address.address_line1,
                    "address_line2":   form.address.address_line2,
                    "postal_code":     form.address.postal_code,
                    "phone":           form.phone
                }
            }, function (error, customer) {
                if (error) {
                    //console.dir(error);
                    stripeCustomerUpdate.return(error);
                } else {
                    stripeCustomerUpdate.return(customer);
                }
            }
        );

        stripeCustomerUpdate = stripeCustomerUpdate.wait();

        if (!stripeCustomerUpdate.object) {
            throw new Meteor.Error(stripeCustomerUpdate.rawType, stripeCustomerUpdate.message);
        }

        console.dir(stripeCustomerUpdate);

        return stripeCustomerUpdate;
    },
    update_stripe_customer_subscription: function(customer_id, subscription_id, token_id){
        logger.info("Inside update_stripe_customer_subscription.");

        var stripeSubscriptionUpdate = new Future();

        Stripe.customers.updateSubscription(customer_id, subscription_id, {
                source: token_id,
                metadata: {saved: false}
            }, function (error, subscription) {
                if (error) {
                    //console.dir(error);
                    stripeSubscriptionUpdate.return(error);
                } else {
                    stripeSubscriptionUpdate.return(subscription);
                }
            }
        );

        stripeSubscriptionUpdate = stripeSubscriptionUpdate.wait();

        if (!stripeSubscriptionUpdate.object) {
            throw new Meteor.Error(stripeSubscriptionUpdate.rawType, stripeSubscriptionUpdate.message);
        }

        console.dir(stripeSubscriptionUpdate);

        return stripeSubscriptionUpdate;
    },
    update_stripe_customer_card: function(data){
        //TODO: refactor this copied function to actually update the customer's card
        logger.info("Inside update_stripe_customer_card.");
        var stripeCardUpdate = new Future();

        Stripe.customers.updateCard(data.customer_id, data.card, {
                exp_month: data.exp_month,
                exp_year: data.exp_year
            }, function (error, card) {
                if (error) {
                    //console.dir(error);
                    stripeCardUpdate.return(error);
                } else {
                    stripeCardUpdate.return(card);
                }
            }
        );

        stripeCardUpdate = stripeCardUpdate.wait();

        if (!stripeCardUpdate.object) {
            throw new Meteor.Error(stripeCardUpdate.rawType, stripeCardUpdate.message);
        }

        console.dir(stripeCardUpdate);

        return stripeCardUpdate;
    },
    update_stripe_customer_user: function(customer_id, user, email_address){
        logger.info("Inside update_stripe_customer_user.");

        var user_cursor;

        if(!user){
            user_cursor = Meteor.users.findOne({'emails.address': email_address});
        } else{
            user_cursor = Meteor.users.findOne(user);
        }

        var stripeCustomerUserUpdate = new Future();

        Stripe.customers.update(customer_id, {
                "metadata": {
                    "user_id": user_cursor._id
                }
            }, function (error, customer) {
                if (error) {
                    //console.dir(error);
                    stripeCustomerUserUpdate.return(error);
                } else {
                    stripeCustomerUserUpdate.return(customer);
                }
            }
        );

        stripeCustomerUserUpdate = stripeCustomerUserUpdate.wait();

        if (!stripeCustomerUserUpdate.object) {
            throw new Meteor.Error(stripeCustomerUserUpdate.rawType, stripeCustomerUserUpdate.message);
        }

        console.dir(stripeCustomerUserUpdate);

        return stripeCustomerUserUpdate;
    },
    check_charge_status: function(charge_id){
        logger.info("Inside check_charge_status");

        // Because the pending status is the only one that couldn't have been the second event thrown we need to check
        // if there is already a stored charge and if so then I don't want to override it with a pending status
        var check_status = Charges.find({_id: charge_id});

        if(check_status){
            return true;
        }
        else{
            return false;
        }
    },
    get_invoice: function(invoice_id){
        logger.info("Inside get_invoice");

        var stripeInvoice = new Future();

        Stripe.invoices.retrieve(invoice_id,
            function (error, invoice) {
                if (error) {
                    //console.dir(error);
                    stripeInvoice.return(error);
                } else {
                    stripeInvoice.return(invoice);
                }
            }
        );

        stripeInvoice = stripeInvoice.wait();

        if (!stripeInvoice.object) {
            throw new Meteor.Error(stripeInvoice.rawType, stripeInvoice.message);
        }

        console.dir(stripeInvoice);

        return stripeInvoice;
    },
    update_invoice_metadata: function(event_body){
        logger.info("Inside update_invoice_metadata");

        // Get the subscription cursor
        var subscription_cursor = Subscriptions.findOne({_id: event_body.data.object.subscription});

        // Use the metadata from the subscription to udpate the invoice with Stripe
        var stripeInvoice = new Future();

        Stripe.invoices.update(event_body.data.object.id,{
                "metadata":  subscription_cursor.metadata
        }, function (error, invoice) {
                if (error) {
                    //console.dir(error);
                    stripeInvoice.return(error);
                } else {
                    stripeInvoice.return(invoice);
                }
            }
        );

        stripeInvoice = stripeInvoice.wait();

        if (!stripeInvoice.object) {
            throw new Meteor.Error(stripeInvoice.rawType, stripeInvoice.message);
        }

        console.dir(stripeInvoice);

    },
    update_charge_metadata: function(event_body){
        logger.info("Inside update_charge_metadata");

        // Get the subscription cursor
        var invoice_cursor = Invoices.findOne({_id: event_body.data.object.invoice});
        if(!invoice_cursor){
            //TODO: get the invoice from Stripe here, or wait for a set period of time
            var invoice = Utils.get_invoice(event_body.data.object.invoice);
            invoice._id = invoice.id;
            Invoices.upsert({_id: invoice._id}, invoice);
            invoice_cursor = Invoices.findOne({_id: invoice.id});
        }
        var subscription_cursor = Subscriptions.findOne({_id: invoice_cursor.subscription});

        // setup the future for the async Stripe call
        var stripeCharges = new Future();

        console.log("Charge id: " + event_body.data.object.id);
        // Use the metadata from the subscription to udpate the charge with Stripe
        Stripe.charges.update(event_body.data.object.id,{
                "metadata":  subscription_cursor.metadata
        }, function (error, charges) {
                if (error) {
                    //console.dir(error);
                    stripeCharges.return(error);
                } else {
                    stripeCharges.return(charges);
                }
            }
        );

        stripeCharges = stripeCharges.wait();

        Charges.update({_id: event_body.data.object.id}, {$set: {metadata: subscription_cursor.metadata}});
        if (!stripeCharges.object) {
            throw new Meteor.Error(stripeCharges.rawType, stripeCharges.message);
        }

        console.dir(stripeCharges);

    },
    cancel_stripe_subscription: function(customer_id, subscription_id, reason){
        logger.info("Inside cancel_stripe_subscription");
        console.log(customer_id + " " + " " + subscription_id + " " + reason);

        // setup the future for the async Stripe call
        var stripe_update= new Future();

        Stripe.customers.updateSubscription(customer_id, subscription_id,{
                metadata: {canceled_reason: reason}
        },
        function (error, subscription) {
                if (error) {
                    console.dir(error);
                    stripe_update.return(error);
                } else {
                    stripe_update.return(subscription);
                }
            }
        );

        stripe_update = stripe_update.wait();

        if (!stripe_update.object) {
            throw new Meteor.Error(stripe_update.rawType, stripe_update.message);
        }
        if (stripe_update.error) {
            throw new Meteor.Error(stripe_update.rawType, stripe_update.message);
        }

        console.dir(stripe_update);

        // setup the future for the async Stripe call
        var stripe_cancel = new Future();

        Stripe.customers.cancelSubscription(customer_id, subscription_id,
        function (error, subscription) {
                if (error) {
                    console.dir(error);
                    stripe_cancel.return(error);
                } else {
                    stripe_cancel.return(subscription);
                }
            }
        );

        stripe_cancel = stripe_cancel.wait();

        if (!stripe_cancel.object) {
            throw new Meteor.Error(stripe_cancel.rawType, stripe_cancel.message);
        }

        console.dir(stripe_cancel);
        return stripe_cancel;
    },
    stripe_create_subscription: function (customer_id, source_id, plan, quantity, metadata) {
        logger.info("Inside stripe_create_subscription.");
        console.log(customer_id);

        // don't want to copy the canceled reason to the new subscription
        delete metadata.reason;

        var stripeCreateSubscription = new Future();
        Stripe.customers.createSubscription(customer_id,
            {
                plan: plan,
                quantity: quantity,
                metadata: metadata
            },
            function (error, subscription) {
                if (error) {
                    console.dir(error);
                    stripeCreateSubscription.return(error);
                } else {
                    stripeCreateSubscription.return(subscription);
                }
            });
        stripeCreateSubscription = stripeCreateSubscription.wait();
        if (!stripeCreateSubscription.object) {
            throw new Meteor.Error(stripeCreateSubscription.rawType, stripeCreateSubscription.message);
        }
        stripeCreateSubscription._id = stripeCreateSubscription.id;
        console.log("Stripe charge plan information");
        console.dir(stripeCreateSubscription);
        // Add charge response from Stripe to the collection
        Subscriptions.insert(stripeCreateSubscription);
        metadata.subscription_id = stripeCreateSubscription.id;
        Donations.insert(metadata);

        return stripeCreateSubscription;
    }
});
