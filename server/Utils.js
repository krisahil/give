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
                stripeCustomer.return(customer);
            }
        });
      } else if (paymentDevice.slice(0, 2) === 'bt') {
        /**/
        logger.info("Bank_account");
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

      let wait_for_customer_insert = Customers.insert(stripeCustomer);

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
        logger.info("Start date: " + start_date);

        var plan, subscription_frequency;
        subscription_frequency = frequency;

        switch (subscription_frequency) {
            case "monthly":
                plan = Meteor.settings.stripe.plan.monthly;
                break;
            case "weekly":
                plan = Meteor.settings.stripe.plan.weekly;
                break;
            case "yearly":
                plan = Meteor.settings.stripe.plan.yearly;
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
        logger.info("Stripe charge Plan information");
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
    audit_email: function (id, type, failure_message, failure_code){
        logger.info("Inside audit_email.");

      switch(type){
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
        default:
          logger.info("No case matched");
      };
    },
    get_frequency_and_subscription: function (invoice_id) {
        logger.info("Started get_frequency");

        var return_this = {};
        return_this.subscription = Invoices.findOne({_id: invoice_id}) && Invoices.findOne({_id: invoice_id}).subscription;
        return_this.frequency = return_this.subscription &&
            Subscriptions.findOne({_id: return_this.subscription}) &&
            Subscriptions.findOne({_id: return_this.subscription}).plan.interval;

        if (return_this.frequency == null || return_this.subscription == null) {
            var get_invoice = StripeFunctions.get_invoice(invoice_id);
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
      let stripeCustomerUpdate = new Future();

      Stripe.customers.update( customer_id, {
          "metadata": {
            "city":          form.address.city,
            "state":         form.address.state,
            "address_line1": form.address.address_line1,
            "address_line2": form.address.address_line2,
            "postal_code":   form.address.postal_code,
            "phone":         form.phone
          }
        }, function ( error, customer ) {
          if( error ) {
            //console.dir(error);
            stripeCustomerUpdate.return( error );
          } else {
            stripeCustomerUpdate.return( customer );
          }
        }
      );

      stripeCustomerUpdate = stripeCustomerUpdate.wait();

      if (!stripeCustomerUpdate.object) {
        throw new Meteor.Error(stripeCustomerUpdate.rawType, stripeCustomerUpdate.message);
      }
    });
  },
    update_stripe_customer_subscription: function(customer_id, subscription_id, token_id){
        logger.info("Inside update_stripe_customer_subscription.");
        var stripeSubscriptionUpdate = new Future();

        Stripe.customers.updateSubscription(customer_id, subscription_id, {
                source: token_id
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
    update_stripe_customer_bank: function(customer_id, bank){
      logger.info("Inside update_stripe_customer_bank.");
      console.log(customer_id, bank);

      let stripeBankUpdate = new Promise(function (resolve, reject) {
        Stripe.customers.createSource(customer_id, {source: bank},
          function (err, res) {
            if (err) {
              reject(err.raw);
            }
            else resolve(res);
          });
      });

      // Fulfill Promise
      return stripeBankUpdate.await(
        function (res) {
          logger.info(res);
          return res;
        }, function(err) {
          // TODO: if there is a a problem we need to resolve this since the event won't be sent again
          logger.info(err);
          throw new Meteor.Error(err.statusCode, err.type, err.message);
          //return err;
        });
    },
    update_stripe_bank_metadata: function(customer_id, bank_id, saved){
      logger.info("Inside update_stripe_bank_metadata.");
      logger.info(customer_id, bank_id, saved);
      if(saved){
        saved = 'true';
      } else {
        saved = 'false';
      }

      let stripeBankUpdate = new Promise(function (resolve, reject) {
        Stripe.customers.updateCard(customer_id, bank_id,
          { metadata: {saved: saved} },
          function (err, res) {
            if (err) reject("There was a problem", err);
            else resolve(res);
          });
      });

      // Fulfill Promise
      return stripeBankUpdate.await(
        function (res) {
          console.log(res);
          return res;
        }, function(err) {
          // TODO: if there is a a problem we need to resolve this since the event won't be sent again
          console.log(err);
          throw new Meteor.Error("Error from Stripe Promise", err);
        });
    },
  update_stripe_customer_default_source: function(customer_id, bank_id){
      logger.info("Inside update_stripe_customer_default_source.");
      logger.info(customer_id, bank_id);

      let sourceUpdate = new Promise(function (resolve, reject) {
        Stripe.customers.update(customer_id,
          { default_source: bank_id },
          function (err, res) {
            if (err) reject("There was a problem", err);
            else resolve(res);
          });
      });

      // Fulfill Promise
      return sourceUpdate.await(
        function (res) {
          console.log(res);
          return res;
        }, function(err) {
          // TODO: if there is a a problem we need to resolve this since the event won't be sent again
          console.log(err);
          throw new Meteor.Error("Error from Stripe Promise", err);
        });
    },
    check_charge_status: function(charge_id){
        logger.info("Inside check_charge_status");

        // Because the pending status is the only one that couldn't have been the second event thrown we need to check
        // if there is already a stored charge and if so then I don't want to override it with a pending status
        var check_status = Charges.findOne({_id: charge_id});

        if(check_status){
            return true;
        }
        else{
            return false;
        }
    },
    update_invoice_metadata: function(event_body){
        logger.info("Inside update_invoice_metadata");

        // Get the subscription cursor
        var subscription_cursor = Subscriptions.findOne({_id: event_body.data.object.subscription});

        // Use the metadata from the subscription to udpate the invoice with Stripe
        var stripeInvoice = new Future();

        if(subscription_cursor.metadata){
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
        } else {
            return;
        }

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
            var invoice = StripeFunctions.get_invoice(event_body.data.object.invoice);
            invoice._id = invoice.id;
            Invoices.upsert({_id: invoice._id}, invoice);
            invoice_cursor = Invoices.findOne({_id: invoice.id});
        }
        var subscription_cursor = Subscriptions.findOne({_id: invoice_cursor.subscription});

        // setup the future for the async Stripe call
        var stripeCharges = new Future();

        logger.info("Charge id: " + event_body.data.object.id);
        // Use the metadata from the subscription to update the charge with Stripe
        if(subscription_cursor.metadata){
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
        } else {
            return;
        }

        stripeCharges = stripeCharges.wait();

        if(subscription_cursor.metadata){
            Charges.update({_id: event_body.data.object.id}, {$set: {metadata: subscription_cursor.metadata}});
        }
        if (!stripeCharges.object) {
            throw new Meteor.Error(stripeCharges.rawType, stripeCharges.message);
        }

        console.dir(stripeCharges);

    },
    cancel_stripe_subscription: function(customer_id, subscription_id, reason){
      logger.info("Inside cancel_stripe_subscription");
      logger.info(customer_id + " " + " " + subscription_id + " " + reason);

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

      // Set this subscription to canceled. Stripe's webhooks should still update this later,
      // but this is so that the admin or customer who cancels the subscription gets
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
        logger.info("Stripe charge plan information");
        console.dir(stripeCreateSubscription);
        // Add charge response from Stripe to the collection
        Subscriptions.insert(stripeCreateSubscription);
        metadata.subscription_id = stripeCreateSubscription.id;
        Donations.insert(metadata);

        return stripeCreateSubscription;
    },
    stripe_set_transfer_posted_metadata: function (transfer_id, set_to){
      logger.info("Inside stripe_set_transfer_posted_metadata.");
      logger.info(transfer_id);
      logger.info(set_to);

      let stripeTransfer = new Promise(function (resolve, reject) {
        Stripe.transfers.update(
          transfer_id,{
            metadata: {
              posted: set_to
            }
          },
          function (err, res) {
            if (err) reject("There was a problem", err);
            else resolve(res);
          });
      });

      // Fulfill Promise
      return stripeTransfer.await(
        function (res) {
          console.log(res);
          return res;
        }, function(err) {
          // TODO: if there is a a problem we need to resolve this since the event won't be sent again
          console.log(err);
          throw new Meteor.Error("Error from Stripe event retrieval Promise", err);
        });
    },
  stripe_get_refund: function (refund_id) {
    logger.info("Started stripe_get_refund");
    logger.info("Refund id: " + refund_id);

    let stripeRefund = new Promise(function (resolve, reject) {
      Stripe.refunds.retrieve(refund_id, {
        expand: ["charge"]
      }, function (err, res) {
          if (err) reject("There was a problem", err);
          else resolve(res);
        });
    });

    // Fulfill Promise
    return stripeRefund.await(
      function (res) {
        console.log(res);
        return res;
      }, function(err) {
        // TODO: if there is a a problem we need to resolve this since the event won't be sent again
        console.log(err);
        throw new Meteor.Error("Error from Stripe event retrieval Promise", err);
      });
  },
  get_all_stripe_refunds: function(){
    logger.info("Inside get_all_stripe_refunds.");

    let allRefunds = new Promise(function (resolve, reject) {
      Stripe.refunds.list(
        { limit: 100 },
        function (err, res) {
          if (err) reject("There was a problem", err);
          else resolve(res);
      });
    });

    // Fulfill Promise
    return allRefunds.await(
      function (res) {
        console.log(res);
        return res;
      }, function(err) {
        // TODO: if there is a a problem we need to resolve this since the event won't be sent again
        console.log(err);
        throw new Meteor.Error("Error from Stripe Promise", err);
      });
  },
  update_stripe_customer_dt_persona_id: function(customer_id, new_persona_id){
    logger.info("Inside update_stripe_customer_dt_persona_id.");
    logger.info(new_persona_id);

    let stripeCustomerUpdate = new Promise(function (resolve, reject) {
      Stripe.customers.update( customer_id, {
        "metadata": {
          "dt_persona_id": new_persona_id
        }
      }, function ( err, res ) {
        if( err ) reject( "There was a problem", err );
        else resolve( res );
      });
    });
    // Fulfill Promise
    return stripeCustomerUpdate.await(
      function (res) {
        console.log(res);
        return res;
      }, function(err) {
        // TODO: if there is a a problem we need to resolve this since the event won't be sent again
        console.log(err);
        throw new Meteor.Error("Error from Stripe Promise", err);
      });
  },
  upadte_stripe_subscription_amount_or_designation_or_date:
    function (subscription_id, customer_id, fields){
    var stripeSubscriptionUpdate = new Future();

    // fields should looks something like this
    // { quantity: 500, trial_end: unix timestamp of new monthly date, metadata: {donateTo: 'new designation'}}

    Stripe.customers.updateSubscription(customer_id, subscription_id, fields,
      function (error, subscription) {
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
      "Details: <br>Email: " + email + "<br>ID: " + user_id + "<br>Link: <a href='" + Meteor.settings.public.donor_tools_site + "/people/" + personaID +"'>" + personaID + "</a></p>";

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
   * set a user's state object and update that object with a timestamp
   *
   * @method set_user_state
   * @param {String} userId - _id of user who's stae is being updated
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
  create_user: function (email, customer_id) {
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
  }
});
