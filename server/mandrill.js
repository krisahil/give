_.extend(Utils,{

	add_email_vars: function (vars, name, content) {
        logger.info("Started add_email_vars");


        var push_vars = vars.push({"name": name, "content": content});
        /*var vars= [
            {
                "name": "CreatedAt",
                "content": ""
            }, {
                "name": "DEV",
                "content": Meteor.settings.dev
            }, {
                "name": "DonatedTo",
                "content": ""
            }, {
                "name": "DonateWith",
                "content": ""
            }, {
                "name": "GiftAmount",
                "content": ("" / 100).toFixed(2)
            }, {
                "name": "GiftAmountFees",
                "content": ""
            }, {
                "name": "TotalGiftAmount",
                "content": ("" / 100).toFixed(2)
            }, {
                "name": "FailureReason",
                "content": ""
            },{
                "name": "FailureReasonCode",
                "content": ""
            },{
                "name": "NAME",
                "content": "Test Inserted"
            },{
                "name": "FULLNAME",
                "content": ""
            }, {
                "name": "ORG",
                "content": ""
            }, {
                "name": "ADDRESS_LINE1",
                "content": ""
            }, {
                "name": "ADDRESS_LINE2",
                "content": ""
            }, {
                "name": "LOCALITY",
                "content": ""
            }, {
                "name": "REGION",
                "content": ""
            }, {
                "name": "POSTAL_CODE",
                "content": ""
            }, {
                "name": "PHONE",
                "content": ""
            }, {
                "name": "c",
                "content": ""
            }, {
                "name": "don",
                "content": ""
            }, {
                "name": "charge",
                "content": ""
            }, {
                "name": "CHARGEID",
                "content": ""
            }, {
                "name": "URL",
                "content": ""
            }, {
                "name": "Frequency",
                "content": ""
            }
        ];*/
        return push_vars;
    },
    add_recipient_to_email: function (data_slug, email) {
        logger.info("Started add_receipient_to_email");

        data_slug.message.to[0].email           = email;
        data_slug.message.merge_vars[0].rcpt    = email;

        return data_slug;

    },
    send_donation_email: function (recurring, id, amount, type, body, frequency, subscription) {
        try {
            logger.info("Started send_donation_email with ID: " + id);
            if (type === "charge.updated") {
                logger.info("Don't need to send an email when a charge is updated, exiting the send_donation_email method.");
                return;
            }
            var donation_cursor;
            // Setup a cursor for the Audit_trail document corresponding to this charge_id
            var audit_trail_cursor = Audit_trail.findOne({charge_id: id});
            var charge_cursor = Charges.findOne({_id: id});
            if (!charge_cursor) {
                logger.error("No charge found here, exiting.");
                return;
            }

            var customer_cursor = Customers.findOne({_id: charge_cursor.customer});
            if (!customer_cursor) {
                logger.error("No customer found here, exiting.");
                return;
            }

            var data_slug = {
                "template_name": "",
                "template_content": [
                    {}
                ],
                "message": {
                    "to": [
                        {"email": ""}
                    ],
                    "bcc_address": "support@trashmountain.com",
                    "merge_vars": [
                        {
                            "rcpt": "",
                            "vars": [
                                {
                                    "name": "CreatedAt",
                                    "content": moment(new Date(Number(charge_cursor.created * 1000))).format('MM/DD/YYYY h:mma')
                                }, {
                                    "name": "DEV",
                                    "content": Meteor.settings.dev
                                }, {
                                    "name": "DonateWith",
                                    "content": charge_cursor.source.brand
                                }, {
                                    "name": "TotalGiftAmount",
                                    "content": (charge_cursor.amount / 100).toFixed(2)
                                }, {
                                    "name": "GiftAmount",
                                    "content": (amount / 100).toFixed(2)
                                }, {
                                    "name": "NAME",
                                    "content": charge_cursor.source.name
                                }, {
                                    "name": "ADDRESS_LINE1",
                                    "content": customer_cursor.metadata.address_line1
                                }, {
                                    "name": "LOCALITY",
                                    "content": customer_cursor.metadata.city
                                }, {
                                    "name": "REGION",
                                    "content": customer_cursor.metadata.state
                                }, {
                                    "name": "POSTAL_CODE",
                                    "content": customer_cursor.metadata.postal_code
                                }, {
                                    "name": "PHONE",
                                    "content": customer_cursor.metadata.phone
                                }, {
                                    "name": "c",
                                    "content": charge_cursor.customer
                                }, {
                                    "name": "charge",
                                    "content": charge_cursor._id
                                }, {
                                    "name": "CHARGEID",
                                    "content": charge_cursor._id
                                }, {
                                    "name": "failure_message",
                                    "content": charge_cursor.failure_message
                                }, {
                                    "name": "failure_code",
                                    "content": charge_cursor.failure_code
                                }
                            ]
                        }
                    ]
                }
            };

            if (customer_cursor.metadata.address_line2) {
                data_slug.message.merge_vars[0].vars.push(
                    {
                        "name": "ADDRESS_LINE2",
                        "content": customer_cursor.metadata.address_line2 + "<br>"
                    }
                );
            }

            if (customer_cursor.metadata.business_name) {
                data_slug.message.merge_vars[0].vars.push(
                    {
                        "name": "FULLNAME",
                        "content": customer_cursor.metadata.business_name + "<br>" + customer_cursor.metadata.fname + " " + customer_cursor.metadata.lname
                    }
                );
            } else {
                data_slug.message.merge_vars[0].vars.push(
                    {
                        "name": "FULLNAME",
                        "content": customer_cursor.metadata.fname + " " + customer_cursor.metadata.lname
                    }
                );
            }

            //Get the donation with description for either the card or the bank account
            if (charge_cursor.source.brand) {
                data_slug.message.merge_vars[0].vars.push(
                    {
                        "name": "donateWith",
                        "content": charge_cursor.source.brand + " - ending in, " + charge_cursor.source.last4
                    }
                );
            } else {
                data_slug.message.merge_vars[0].vars.push(
                    {
                        "name": "donateWith",
                        "content": charge_cursor.source.bank_name + " - ending in, " + charge_cursor.source.last4
                    }
                );
            }

            if (frequency !== "One Time") {
                if (frequency === 'day') {
                    data_slug.message.merge_vars[0].vars.push(
                        {
                            "name": "frequency",
                            "content": "daily"
                        }
                    );
                } else {
                    data_slug.message.merge_vars[0].vars.push(
                        {
                            "name": "frequency",
                            "content": frequency + "ly"
                        }
                    );
                }
            } else {
                data_slug.message.merge_vars[0].vars.push(
                    {
                        "name": "frequency",
                        "content": frequency
                    }
                );
            }

            if (subscription) {
                donation_cursor = Donations.findOne({subscription_id: subscription});
                if (!donation_cursor) {
                    if (!type === 'charge.failed') {
                        logger.error("No donation found here, exiting.");
                        return;
                    } else {
                        // Check to see if the failed email has already been sent for this charge
                        if (audit_trail_cursor && audit_trail_cursor.charge.failed && audit_trail_cursor.charge.failed.sent) {
                            logger.info("A 'failed' email has already been sent for this charge, exiting email send function.");
                            return;
                        }

                        data_slug.template_name = "fall-2014-donation-failed-recurring";
                        data_slug = Utils.add_recipient_to_email(data_slug, customer_cursor.email);
                        data_slug.message.merge_vars[0].vars.push(
                            {
                                "name": "URL",
                                "content": "https://trashmountain.com/give/user/subscriptions?fix_it=" + subscription
                            }
                        );
                    }
                } else {
                    if (type === 'charge.failed') {
                        data_slug.template_name = "fall-2014-donation-failed-recurring";
                        data_slug.message.merge_vars[0].vars.push(
                            {
                                "name": "URL",
                                "content": "https://trashmountain.com/give/user/subscriptions?fix_it=" + subscription
                            }
                        );
                        data_slug.message.merge_vars[0].vars.push(
                            {
                                "name": "PHONE",
                                "content": donation_cursor.phone
                            }
                        );
                    }
                    data_slug.message.merge_vars[0].vars.push(
                        {
                            "name": "donateTo",
                            "content": donation_cursor.donateTo
                        }
                    );
                    data_slug.message.merge_vars[0].vars.push(
                        {
                            "name": "don",
                            "content": donation_cursor._id
                        }
                    );
                }
            } else {
                donation_cursor = Donations.findOne({charge_id: id});
                console.log("LOOK HERE ***********************");
                console.dir(donation_cursor);
                console.log("LOOK HERE ***********************");
                if (!donation_cursor) {
                    if (!type === 'charge.failed') {
                        logger.error("No donation found here, exiting.");
                        return;
                    } else {
                        if (audit_trail_cursor && audit_trail_cursor.charge.failed && audit_trail_cursor.charge.failed.sent) {
                            logger.info("A 'failed' email has already been sent for this charge, exiting email send function.");
                            return;
                        }

                        data_slug.template_name = "fall-2014-donation-failed";

                        data_slug.message.merge_vars[0].vars.push(
                            {
                                "name": "URL",
                                "content": "https://trashmountain.com/donate"
                            }
                        );
                    }
                } else {
                    data_slug.message.merge_vars[0].vars.push(
                        {
                            "name": "donateTo",
                            "content": donation_cursor.donateTo
                        }
                    );
                    data_slug.message.merge_vars[0].vars.push(
                        {
                            "name": "don",
                            "content": donation_cursor._id
                        }
                    );
                }
            }

            if (type === 'charge.failed') {
                Utils.audit_email(id, type, body.failure_message, body.failure_code);

                data_slug = Utils.add_recipient_to_email(data_slug, customer_cursor.email);
                Utils.send_mandrill_email(data_slug, 'charge.failed');
            } else if (type === 'charge.pending') {
                if (audit_trail_cursor && audit_trail_cursor.charge && audit_trail_cursor.charge.pending && audit_trail_cursor.charge.pending.sent) {
                    logger.info("A 'created' email has already been sent for this charge, exiting email send function.");
                    return;
                }
                Utils.audit_email(id, type);
                data_slug.template_name = "donation-initial-email";
                data_slug = Utils.add_recipient_to_email(data_slug, customer_cursor.email);
                // TODO: need to determine if we want to keep this pending email bcc_address sending us emails everytime
                //data_slug.message.bcc_address   = null;
                Utils.send_mandrill_email(data_slug, 'charge.pending');

            } else if (type === 'charge.succeeded') {
                if (audit_trail_cursor && audit_trail_cursor.charge && audit_trail_cursor.charge.succeeded && audit_trail_cursor.charge.succeeded.sent) {
                    logger.info("A 'succeeded' email has already been sent for this charge, exiting email send function.");
                    return;
                }
                Utils.audit_email(id, type);
                data_slug.template_name = "fall-2014-donation-receipt-multi-collection";
                data_slug = Utils.add_recipient_to_email(data_slug, customer_cursor.email);
                Utils.send_mandrill_email(data_slug, 'charge.succeeded');
            } else if (type === 'large_gift') {
                if (audit_trail_cursor && audit_trail_cursor.charge && audit_trail_cursor.charge.large_gift && audit_trail_cursor.charge.large_gift.sent) {
                    logger.info("A 'large_gift' email has already been sent for this charge, exiting email send function.");
                    return;
                }
                Utils.audit_email(id, type);
                data_slug = Utils.add_recipient_to_email(data_slug, "large_gift@trashmountain.com");
                data_slug.template_name = "large-gift-notice-multi-collection";
                data_slug.message.bcc_address = null;
                Utils.send_mandrill_email(data_slug, 'large-gift');
            }
        }
        catch (e) {
            logger.error('Mandril sendEmailOutAPI Method error message: ' + e.message);
            logger.error('Mandril sendEmailOutAPI Method error: ' + e);
            throw new Meteor.error(e);
        }
    },
	send_mandrill_email: function(data_slug, type){
        try{
            logger.info("Started send_mandrill_email type: " + type);
            console.dir(data_slug);
            Meteor.Mandrill.sendTemplate(data_slug);
        }//End try
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
    }
});