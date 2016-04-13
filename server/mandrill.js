_.extend(Utils,{
	add_email_vars: function (vars, name, content) {
    logger.info("Started add_email_vars");

    var push_vars = vars.push({"name": name, "content": content});
    return push_vars;
  },
  add_recipient_to_email: function (data_slug, email) {
    logger.info("Started add_recipient_to_email");

    data_slug.message.to[0].email           = email;
    data_slug.message.merge_vars[0].rcpt    = email;

    return data_slug;

  },
  send_failed_to_add_to_dt_email_to_support: function(persona_id, charge_id){
    logger.info("Started send_failed_to_add_to_dt_email_to_support");
    let data_slug = {
      "template_name": "failed-dt-add-notice",
      "template_content": [
        {}
      ],
      "message": {
        "to": [
          {"email": Meteor.settings.public.support_address}
        ],
        "bcc_address": "",
        "merge_vars": [
          {
            "rcpt": Meteor.settings.public.support_address,
            "vars": [
              {
                "name": "DEV",
                "content": Meteor.settings.dev
              }, {
                "name": "PERSONA_ID",
                "content": persona_id
              }, {
                "name": "CHARGE_ID",
                "content": charge_id
              }
            ]
          }
        ]
      }
    };

    Utils.send_mandrill_email(data_slug, 'failed-dt-add-notice');

  },
  send_cancelled_email_to_admin: function (subscription_id, stripeEvent) {
    var audit_trail_cursor = Audit_trail.findOne({subscription_id: subscription_id});

    // Check to see if the deleted subscription email has already been sent for this charge
    if (audit_trail_cursor && audit_trail_cursor.subscription_deleted && audit_trail_cursor.subscription_deleted.sent_to_admin) {
        logger.info("A 'subscription deleted' email has already been sent, exiting email send function.");
        return;
    } else {
        Audit_trail.upsert({subscription_id: subscription_id}, {
            $set: {
                'subscription_deleted.sent_to_admin': true,
                'subscription_deleted.time': new Date()
            }
        });
    }

    var start_date = moment( new Date(stripeEvent.data.object.start * 1000) ).format('DD MMM, YYYY');

    var last_gift = moment(new Date(stripeEvent.data.object.current_period_start * 1000)).format('DD MMM, YYYY');

    var canceled_date = new Date(stripeEvent.data.object.canceled_at * 1000);
    canceled_date = moment(canceled_date).format('DD MMM, YYYY hh:mma');

    var customer_cursor = Customers.findOne({_id: stripeEvent.data.object.customer});

    var donor_name = customer_cursor && customer_cursor.metadata && customer_cursor.metadata.fname + " " + customer_cursor.metadata.lname;

    var donateWith = stripeEvent.data.object.metadata && stripeEvent.data.object.metadata.donateWith;

    var testorlive = Meteor.settings.dev ? '/test' : '';

    let data_slug = {
      "template_name": "canceled-recurring-notice",
      "template_content": [
        {}
      ],
      "message": {
        "to": [
            {"email": Meteor.settings.public.canceled_gift_address}
        ],
        "bcc_address": "",
        "merge_vars": [
            {
              "rcpt": Meteor.settings.public.canceled_gift_address,
              "vars": [
                {
                  "name": "DEV",
                  "content": Meteor.settings.dev
                }, {
                  "name": "testorlive",
                  "content": testorlive
                }, {
                  "name": "Request",
                  "content": stripeEvent.request
                }, {
                  "name": "START",
                  "content": start_date
                }, {
                  "name": "SubscriptionId",
                  "content": subscription_id
                }, {
                  "name": "DonateWith",
                  "content": donateWith
                }, {
                  "name": "LastGift",
                  "content": last_gift
                }, {
                  "name": "Interval",
                  "content": stripeEvent.data.object.plan.interval
                }, {
                  "name": "TotalGiftAmount",
                  "content": (stripeEvent.data.object.quantity / 100).toFixed(2)
                }, {
                  "name": "CANCELED_AT",
                  "content": canceled_date
                }, {
                  "name": "CancelReason",
                  "content": stripeEvent.data.object.metadata.canceled_reason
                }, {
                  "name": "NAME",
                  "content": donor_name
                }, {
                  "name": "PHONE",
                  "content": customer_cursor.metadata && customer_cursor.metadata && customer_cursor.metadata.phone
                }
              ]
          }
        ]
      }
    };

    Utils.send_mandrill_email(data_slug, 'customer.subscription.deleted');

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
              "bcc_address": "",
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
                              "name": "TotalGiftAmount",
                              "content": (charge_cursor.amount / 100).toFixed(2)
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
                          }, {
                              "name": "URL",
                              "content": Meteor.settings.public.URL + "/thanks?"
                          }
                      ]
                  }
              ]
          }
      };

      if(charge_cursor.metadata.fees){
          data_slug.message.merge_vars[0].vars.push(
              {
                  "name": "GiftAmountFees",
                  "content": (charge_cursor.metadata.fees / 100).toFixed(2)
              },
              {
                  "name": "GiftAmount",
                  "content": ((amount / 100).toFixed(2) - (charge_cursor.metadata.fees / 100).toFixed(2))
              }
          );
      } else {
          data_slug.message.merge_vars[0].vars.push(
              {
                  "name": "GiftAmount",
                  "content": (amount / 100).toFixed(2)
              }
          );
      }
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
      if (charge_cursor && charge_cursor.source && charge_cursor.source.brand) {
          data_slug.message.merge_vars[0].vars.push(
              {
                  "name": "DonateWith",
                  "content": charge_cursor.source.brand + " - ending in, " + charge_cursor.source.last4
              }, {
                  "name": "NAME",
                  "content": charge_cursor.source.name
              }, {
                  "name": "TYPE",
                  "content": "card"
              }
          );
      } else if(charge_cursor && charge_cursor.source && charge_cursor.source.bank_name) {
          data_slug.message.merge_vars[0].vars.push(
              {
                  "name": "DonateWith",
                  "content": charge_cursor.source.bank_name + " - ending in, " + charge_cursor.source.last4
              }, {
                  "name": "NAME",
                  "content": charge_cursor.source.name
              }, {
                  "name": "TYPE",
                  "content": "bank"
              }
          );
      } else{
          data_slug.message.merge_vars[0].vars.push(
              {
                  "name": "DonateWith",
                  "content": charge_cursor.payment_source.bank_name + " - ending in, " + charge_cursor.payment_source.last4
              }, {
                  "name": "NAME",
                  "content": customer_cursor.metadata.fname + " " + customer_cursor.metadata.lname
              }
          );
      }

      if (frequency !== "One Time") {
          if (frequency === 'day') {
              data_slug.message.merge_vars[0].vars.push(
                  {
                      "name": "Frequency",
                      "content": "daily"
                  }
              );
          } else {
              data_slug.message.merge_vars[0].vars.push(
                  {
                      "name": "Frequency",
                      "content": frequency + "ly"
                  }
              );
          }
      } else {
          data_slug.message.merge_vars[0].vars.push(
              {
                  "name": "Frequency",
                  "content": "one time"
              }
          );
      }

      if (subscription) {
          donation_cursor = Donations.findOne({subscription_id: subscription});
          var subscription_cursor = Subscriptions.findOne({_id: subscription});

          // payment_type is for setting the payment type used for this subscription, commonly "card", or "bank"
          var payment_type = subscription_cursor.metadata.donateWith.slice(0,4);

          if (!donation_cursor) {
              if (type !== 'charge.failed') {
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
                          "content": Meteor.absoluteUrl("user/subscriptions/" + payment_type.toLowerCase() + "/resubscribe?s=" +
                              subscription + "&c=" + subscription_cursor.customer)
                      }
                  );
              }
          } else if (type === 'charge.failed') {
              data_slug.template_name = "fall-2014-donation-failed-recurring";
              data_slug.message.merge_vars[0].vars.push(
                  {
                      "name": "URL",
                      "content": Meteor.absoluteUrl("user/subscriptions/" + payment_type.toLowerCase() +  "/resubscribe?s=" +
                          subscription + "&c=" + subscription_cursor.customer)
                  }
              );
              data_slug.message.merge_vars[0].vars.push(
                  {
                      "name": "DonateTo",
                      "content": Utils.getDonateToName(donation_cursor.donateTo)
                  }
              );
              data_slug.message.merge_vars[0].vars.push(
                  {
                      "name": "don",
                      "content": donation_cursor._id
                  }
              );
          } else if ( type === 'charge.succeeded' || 
                      type === 'payment.paid' || 
                      type === 'large_gift' ) {
              data_slug.message.merge_vars[0].vars.push(
                  {
                      "name": "DonateTo",
                      "content": Utils.getDonateToName(subscription_cursor.metadata.donateTo)
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
          if (!donation_cursor) {
              if (type !== 'charge.failed') {
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
                          "content": Meteor.settings.public.org_donate_url
                      }
                  );
              }
          } else {
              data_slug.message.merge_vars[0].vars.push(
                  {
                      "name": "DonateTo",
                      "content": Utils.getDonateToName(donation_cursor.donateTo)
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
          data_slug.message.bcc_address  = Meteor.settings.public.bcc_address;
          Utils.send_mandrill_email(data_slug, 'charge.pending');
      } else if (type === 'payment.created') {
          if (audit_trail_cursor && audit_trail_cursor.payment && audit_trail_cursor.payment.created && audit_trail_cursor.payment.created.sent) {
              logger.info("A 'created' email has already been sent for this charge, exiting email send function.");
              return;
          }
          Utils.audit_email(id, type);
          data_slug.template_name = "donation-initial-email";
          data_slug = Utils.add_recipient_to_email(data_slug, customer_cursor.email);
          data_slug.message.bcc_address  = Meteor.settings.public.bcc_address;
          data_slug = Utils.add_recipient_to_email(data_slug, customer_cursor.email);
          Utils.send_mandrill_email(data_slug, 'payment.created');

      } else if (type === 'charge.succeeded') {
          if (audit_trail_cursor && audit_trail_cursor.charge && audit_trail_cursor.charge.succeeded && audit_trail_cursor.charge.succeeded.sent) {
              logger.info("A 'succeeded' email has already been sent for this charge, exiting email send function.");
              return;
          }
          Utils.audit_email(id, type);
          data_slug.template_name = "fall-2014-donation-receipt-multi-collection";
          data_slug = Utils.add_recipient_to_email(data_slug, customer_cursor.email);
          Utils.send_mandrill_email(data_slug, 'charge.succeeded');
      } else if (type === 'payment.paid') {
          if (audit_trail_cursor && audit_trail_cursor.payment && audit_trail_cursor.payment.paid && audit_trail_cursor.payment.paid.sent) {
              logger.info("A 'succeeded' email has already been sent for this charge, exiting email send function.");
              return;
          }
          Utils.audit_email(id, type);
          data_slug.template_name = "fall-2014-donation-receipt-multi-collection";
          data_slug = Utils.add_recipient_to_email(data_slug, customer_cursor.email);
          Utils.send_mandrill_email(data_slug, 'payment.paid');
      } else if (type === 'large_gift') {
          if (audit_trail_cursor && audit_trail_cursor.charge && audit_trail_cursor.charge.large_gift && audit_trail_cursor.charge.large_gift.sent) {
              logger.info("A 'large_gift' email has already been sent for this charge, exiting email send function.");
              return;
          }
          Utils.audit_email(id, type);
          data_slug.message.subject = 'A Partner just Gave $' + (amount/ 100).toFixed(2);
          data_slug = Utils.add_recipient_to_email(data_slug, Meteor.settings.public.large_gift_address);
          data_slug.template_name = "large-gift-notice-multi-collection";
          data_slug.message.bcc_address =
            Meteor.settings.public.bcc_address ?
            Meteor.settings.public.bcc_address :
            '';
          Utils.send_mandrill_email(data_slug, 'large-gift');
      }
    }  catch (e) {
      logger.error('Mandril sendEmailOutAPI Method error message: ' + e.message);
      logger.error('Mandril sendEmailOutAPI Method error: ' + e);
      throw new Meteor.Error(e);
    }
  },
  send_manually_processed_initial_email: function(donation_id, customer_id) {

    let audit_trail_id = Audit_trail.upsert({donation_id: donation_id}, {
      $set: {
        'charge.pending.sent': true,
        'charge.pending.time': new Date()
      }
    });
    let audit_trail_cursor = Audit_trail.findOne({_id: audit_trail_id});
    let donation_cursor = Donations.findOne({_id: donation_id});

    var customer_cursor = Customers.findOne({_id: customer_id});
    if (!customer_cursor) {
      logger.error("No customer found here, exiting.");
      return;
    }

    let data_slug = {
      "template_name":    "",
      "template_content": [
        {}
      ],
      "message":          {
        "to":          [
          { "email": "" }
        ],
        "bcc_address": "",
        "merge_vars":  [
          {
            "rcpt": "",
            "vars": [
              {
                "name":    "CreatedAt",
                "content": moment(donation_cursor.created_at).format("MM/DD/YYYY hh:mm a")
              }, {
                "name":    "DEV",
                "content": Meteor.settings.dev
              }, {
                "name":    "TotalGiftAmount",
                "content": (donation_cursor.total_amount / 100).toFixed( 2 )
              }
            ]
          }
        ]
      }
    };
    data_slug.template_name = "donation-initial-email";
    data_slug = Utils.add_recipient_to_email(data_slug, customer_cursor.email);
    data_slug.message.bcc_address  = Meteor.settings.public.bcc_address;

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
    Utils.send_mandrill_email(data_slug, 'charge.pending');
  },
	send_mandrill_email: function(data_slug, type){
    try{
      logger.info("Started send_mandrill_email type: " + type);
      Mandrill.messages.sendTemplate(data_slug);
    }//End try
    catch (e) {
      logger.error('Mandril sendEmailOutAPI Method error message: ' + e.message);
      logger.error('Mandril sendEmailOutAPI Method error: ' + e);
      throw new Meteor.Error(e);
    }
  },
  send_scheduled_email: function (id, subscription_id, frequency, amount) {
    try {
      logger.info("Started send_scheduled_email with ID: " + id + " subscription_id: " + subscription_id + " frequency: " + frequency + "amount: " + amount);

      // Check to see if this email has already been sent before continuing, log it if it hasn't
      var subscription_cursor = Subscriptions.findOne({_id: subscription_id});
      if(subscription_cursor.metadata &&
        subscription_cursor.metadata.send_scheduled_email &&
        subscription_cursor.metadata.send_scheduled_email === 'no'){
        return;
      }
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

      var bcc_address = Meteor.settings.public.bcc_address;
      var email_address = customer_cursor.email;

      // convert the amount from an integer to a two decimal place number
      amount = (amount/100).toFixed(2);
      var slug = "scheduled-donation-with-amount-and-frequency";

      logger.info("Sending with template name: " + slug);
      Mandrill.messages.sendTemplate({
        "key": Meteor.settings.mandrillKey,
        "template_name": slug,
        "template_content": [
          {}
        ],
        "message": {
          "to": [
            {"email": email_address}
          ],
          "bcc_address": "",
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
    } catch (e) {
      logger.error('Mandril sendEmailOutAPI Method error message: ' + e.message);
      logger.error('Mandril sendEmailOutAPI Method error: ' + e);
      throw new Meteor.Error(e);
    }
  }
});