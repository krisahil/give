_.extend(Utils,{

	send_donation_email: function (recurring, id, amount, type, body, frequency, subscription) {
		try {
			logger.info("Started send_donation_email with ID: " + id);
            if (type === "charge.updated") {
                logger.info("Don't need to send an email when a charge is updated, exiting the send_donation_email method.");
                return;
            }
            data_slug = {};

            console.log(frequency);
            if(frequency !== "One Time"){
                data_slug.frequency = frequency + "ly";
            } else{
                data_slug.frequency = frequency;
            }
        
			var charge_cursor = Charges.findOne({id: id});
            if(!charge_cursor){
                logger.error("No charge found here, exiting.");
                return;
            }
			var customer_cursor = Customers.findOne({_id: charge_cursor.customer});
            if(!customer_cursor){
                logger.error("No customer found here, exiting.");
                return;
            }

            //Get the donation with description for either the card or the bank account
            if(charge_cursor.source.brand){
                data_slug.donateWith = charge_cursor.source.brand;
            } else{
                data_slug.donateWith = charge_cursor.source.bank_name;
            }

            if(customer_cursor.business_name){
                data_slug.fullName = customer_cursor.metadata.business_name + "<br>" +
                customer_cursor.metadata.fname + " " + customer_cursor.metadata.lname;
            }else{
                data_slug.fullName = customer_cursor.metadata.fname + " " + customer_cursor.metadata.lname;
            }

            data_slug.created_at = moment(new Date(Number(charge_cursor.created*1000))).format('MM/DD/YYYY h:mma');//'03/18/2015 7:09pm';

            data_slug.amount        = amount;
            data_slug.name          = customer_cursor.name;
            data_slug.metadata      = customer_cursor.metadata;
            data_slug.customer_id   = customer_cursor._id;
            data_slug.charge_id     = charge_cursor._id;

            var donation_cursor, audit_trail_cursor;
			if(subscription){
                donation_cursor = Donations.findOne({subscription_id: subscription});
                if(!donation_cursor){
                    if(!type === 'charge.failed') {
                        logger.error("No donation found here, exiting.");
                        return;
                    } else{
                        data_slug.failure_message   = charge_cursor.failure_message;
                        data_slug.failure_message   = charge_cursor.failure_code;
                        data_slug.total_amount      = charge_cursor.amount;
                        audit_trail_cursor          = Audit_trail.findOne({charge_id: id});
                        data_slug.bcc_address       = 'support@trashmountain.com';
                        data_slug.email_address     = customer_cursor.email;
                        data_slug.type              = type;

                        if(audit_trail_cursor && audit_trail_cursor.charge.failed && audit_trail_cursor.charge.failed.sent) {
                            logger.info("A 'failed' email has already been sent for this charge, exiting email send function.");
                            return;
                        }
                        Utils.audit_email(id, type, body.failure_message, body.failure_code);
                        data_slug.slug = 'fall-2014-donation-failed-recurring';
                        data_slug.URL = 'https://trashmountain.com/give/user/subscriptions?fix_it=' + subscription;
                        logger.info("Sending with template name: " + data_slug.slug);
                        Utils.send_mandrill_email(data_slug);
                        return;
                        logger.error("No donation found here, exiting.");
                        return;
                    }
                } else{

                }
            } else {
                donation_cursor = Donations.findOne({charge_id: id});
                if(!donation_cursor){
                    if(!type === 'charge.failed'){
                        logger.error("No donation found here, exiting.");
                        return;
                    } else{
                        //TODO: put all the necessary vars here and call the mandrill_send_email(data_slug) func
                        data_slug.failure_message   = charge_cursor.failure_message;
                        data_slug.failure_message   = charge_cursor.failure_code;
                        data_slug.total_amount      = charge_cursor.amount;
                        audit_trail_cursor          = Audit_trail.findOne({charge_id: id});
                        data_slug.bcc_address       = 'support@trashmountain.com';
                        data_slug.email_address     = customer_cursor.email;
                        data_slug.type              = type;

                        if(audit_trail_cursor && audit_trail_cursor.charge.failed && audit_trail_cursor.charge.failed.sent) {
                            logger.info("A 'failed' email has already been sent for this charge, exiting email send function.");
                            return;
                        }
                        Utils.audit_email(id, type, body.failure_message, body.failure_code);
                        data_slug.slug = 'fall-2014-donation-failed';
                        data_slug.URL = 'https://trashmountain.com/donate';
                        logger.info("Sending with template name: " + data_slug.slug);
                        Utils.send_mandrill_email(data_slug);
                        return;
                    }
                }
            }

            data_slug.fees = donation_cursor.fees ? (donation_cursor.fees / 100).toFixed(2) : null;

			audit_trail_cursor = Audit_trail.findOne({charge_id: id});
            data_slug.bcc_address = 'support@trashmountain.com';
            data_slug.email_address = customer_cursor.email;
            data_slug.type = type;
			if (type === "charge.failed") {
                if(audit_trail_cursor && audit_trail_cursor.charge.failed && audit_trail_cursor.charge.failed.sent) {
                    logger.info("A 'failed' email has already been sent for this charge, exiting email send function.");
                    return;
                }
                Utils.audit_email(id, type, body.failure_message, body.failure_code);
                data_slug.slug = 'fall-2014-donation-failed';
			} else if(type === 'charge.pending'){
				if(audit_trail_cursor && audit_trail_cursor.charge.pending && audit_trail_cursor.charge.pending.sent) {
					logger.info("A 'created' email has already been sent for this charge, exiting email send function.");
					return;
				}
				Utils.audit_email(id, type);
				data_slug.slug = "donation-initial-email";
				bcc_address = null;
			} else if (type === 'charge.succeeded'){
				if(audit_trail_cursor && audit_trail_cursor.charge.succeeded && audit_trail_cursor.charge.succeeded.sent) {
					logger.info("A 'succeeded' email has already been sent for this charge, exiting email send function.");
					return;
				}
				Utils.audit_email(id, type);
				data_slug.slug = "fall-2014-donation-receipt-multi-collection";
			} else if (type === 'large_gift') {
				if(audit_trail_cursor && audit_trail_cursor.charge.large_gift && audit_trail_cursor.charge.large_gift.sent) {
					logger.info("A 'large_gift' email has already been sent for this charge, exiting email send function.");
					return;
				}
				Utils.audit_email(id, type);
                data_slug.bcc_address = null;
                data_slug.email_address = 'large_gift@trashmountain.com';
				data_slug.slug = "large-gift-notice-multi-collection";
			}

	      logger.info("Sending with template name: " + data_slug.slug);
            data_slug.donateTo      = donation_cursor.donateTo;
            data_slug.total_amount  = donation_cursor.total_amount;
            data_slug.donation_id   = donation_cursor._id;
            data_slug.URL           = donation_cursor.URL;

            //TODO: call the send email here
            Utils.send_mandrill_email(data_slug);

	    } //End try
	    catch (e) {
	      logger.error('Mandril sendEmailOutAPI Method error message: ' + e.message);
	      logger.error('Mandril sendEmailOutAPI Method error: ' + e);
	      throw new Meteor.error(e);
	    }
	},
    send_scheduled_email: function (id, subscription_id, frequency, amount) {
        try {
        logger.info("Started send_donation_email with ID: " + id + " subscription_id: " + subscription_id + " frequency: " + frequency + "amount: " + amount);

        // Check to see if this email has already been sent before continuing, log it if it hasn't
        var subscription_cursor = Subscriptions.findOne({_id: subscription_id});
        if(Audit_trail.findOne({"subscription_id": subscription_id}) &&
            Audit_trail.findOne({"subscription_id": subscription_id}).subscription_scheduled &&
            Audit_trail.findOne({"subscription_id": subscription_id}).subscription_scheduled.sent){
            return;
        } else{
            Utils.audit_email(subscription_id, 'scheduled');
        }

        // Setup the rest of the cursors that we'll need
        var donation_cursor = Donations.findOne({_id: id});
        var customer_cursor = Customers.findOne(donation_cursor.customer_id);

        var start_at = subscription_cursor.trial_end;
        start_at = moment(start_at * 1000).format("MMM DD, YYYY");

        var bcc_address = "support@trashmountain.com";
        var email_address = customer_cursor.email;

        // convert the amount from an integer to a two decimal place number
        amount = (amount/100).toFixed(2);
        data_slug.slug = "scheduled-donation-with-amount-and-frequency";

        logger.info("Sending with template name: " + data_slug.slug);
        Meteor.Mandrill.sendTemplate({
            "key": Meteor.settings.mandrillKey,
            "template_name": data_slug.slug,
            "template_content": [
                {}
            ],
            "message": {
                "to": [
                    {"email": email_address}
                ],
                "bcc_address": "support@trashmountain.com",
                "merge_vars": [
                    {
                        "rcpt": email_address,
                        "vars": [
                            {
                                "name": "StartDate",
                                "content": start_at
                            }, {
                                "name": "DEV",
                                "content": Meteor.settings.dev
                            }, {
                                "name": "SUB_GUID",
                                "content": subscription_id
                            }, {
                                "name": "Frequency",
                                "content": frequency
                            }, {
                                "name": "Amount",
                                "content": amount
                            }
                        ]
                    }
                ]
            }
        });
        } //End try
         catch (e) {
         logger.error('Mandril sendEmailOutAPI Method error message: ' + e.message);
         logger.error('Mandril sendEmailOutAPI Method error: ' + e);
         throw new Meteor.error(e);
         }
    },
    send_mandrill_email: function(data_slug){
        try{
            logger.info("Started send_mandrill_email type: " + data_slug.type);

            console.dir(data_slug);
            Meteor.Mandrill.sendTemplate({
                "template_name": data_slug.slug,
                "template_content": [
                    {}
                ],
                "message": {
                    "to": [
                        {"email": data_slug.email_address}
                    ],
                    "bcc_address": data_slug.bcc_address,
                    "merge_vars": [
                        {
                            "rcpt": data_slug.email_address,
                            "vars": [
                                {
                                    "name": "CreatedAt",
                                    "content": data_slug.created_at
                                },
                                {
                                    "name": "DEV",
                                    "content": Meteor.settings.dev
                                },
                                {
                                    "name": "DonatedTo",
                                    "content": data_slug.donateTo
                                }, {
                                    "name": "DonateWith",
                                    "content": data_slug.donateWith
                                }, {
                                    "name": "GiftAmount",
                                    "content": (data_slug.amount / 100).toFixed(2)
                                }, {
                                    "name": "GiftAmountFees",
                                    "content": data_slug.fees
                                }, {
                                    "name": "TotalGiftAmount",
                                    "content": (data_slug.total_amount / 100).toFixed(2)
                                }, {
                                    "name": "FailureReason",
                                    "content": data_slug.failure_message
                                },{
                                    "name": "FailureReasonCode",
                                    "content": data_slug.failure_code
                                },{
                                    "name": "NAME",
                                    "content": data_slug.name
                                },{
                                    "name": "FULLNAME",
                                    "content": data_slug.fullName
                                }, {
                                    "name": "ORG",
                                    "content": data_slug.metadata.business_name
                                }, {
                                    "name": "ADDRESS_LINE1",
                                    "content": data_slug.metadata.address_line1
                                }, {
                                    "name": "ADDRESS_LINE2",
                                    "content": data_slug.metadata.address_line2
                                }, {
                                    "name": "LOCALITY",
                                    "content": data_slug.metadata.city
                                }, {
                                    "name": "REGION",
                                    "content": data_slug.metadata.state
                                }, {
                                    "name": "POSTAL_CODE",
                                    "content": data_slug.metadata.postal_code
                                }, {
                                    "name": "PHONE",
                                    "content": data_slug.metadata.phone
                                }, {
                                    "name": "c",
                                    "content": data_slug.customer_id
                                }, {
                                    "name": "don",
                                    "content": data_slug.donation_id
                                }, {
                                    "name": "charge",
                                    "content": data_slug.charge_id
                                }, {
                                    "name": "CHARGEID",
                                    "content": data_slug.charge_id
                                }, {
                                    "name": "URL",
                                    "content": data_slug.URL
                                }, {
                                    "name": "Frequency",
                                    "content": data_slug.frequency
                                }
                            ]
                        }
                    ]
                }
            });
        }//End try
        catch (e) {
            logger.error('Mandril sendEmailOutAPI Method error message: ' + e.message);
            logger.error('Mandril sendEmailOutAPI Method error: ' + e);
            throw new Meteor.error(e);
        }
    }
});