

_.extend(Utils, {
    update_balanced_customer: function(form, customer_id){
        logger.info("Inside update_balanced_customer.");
        console.log(customer_id);

        // Setup balanced key
        balanced.configure(Meteor.settings.balanced_api_key);


        var customerData = {};
        customerData = Utils.extractFromPromise(balanced.get('/customers/'+ customer_id).set('address',
                {
                    "city": form['address.city'],
                    "state": form['address.state'],
                    "line1": form['address.line1'],
                    "line2": form['address.line2'],
                    "postal_code": form['address.postal_code']
                })
                .set("phone", form.phone)
                .save()
        );
        console.dir(customerData);
    },
    get_card: function (customer_id, cardHref) {
        logger.info("Inside get_card.");
        var card;
        card = Utils.extractFromPromise(balanced.get(cardHref));

        var insert_card = card._api.cache[card.href];
        return card;
    },
    get_check: function (customer_id, checkHref) {
        logger.info("Inside get_check.");
        var check;
        check = Utils.extractFromPromise(balanced.get(checkHref));

        var insert_check = check._api.cache[check.href];
        return check;
    },
    create_association: function (customer_id, paymentHref, customerHref) {
        /*try {*/
        logger.info("Inside create_association function");
        associate = Utils.extractFromPromise(balanced.get(paymentHref).associate_to_customer(customerHref));
        //add debit response from Balanced to the database
        var insert_this = associate._api.cache[associate.href];
        //add card create response from Balanced to the collection
        if(associate._type === 'bank_account'){
            Customers.update(customer_id, {
                $push: {
                    bank_accounts: insert_this
                }
            });
        } else {
            Customers.update(customer_id, {
                $push: {
                    cards: insert_this
                }
            });
        }

        return associate;
        /*} catch (e) {
         logger.info("Got to catch error area of create_associate. Donation_id: " + donation_id + " Category Code: " + e.category_code + ' Description: ' + e.description);
         Donations.update(donation_id, {
         $set: {
         'failed.category_code': e.category_code,
         'failed.description': e.description,
         'failed.in': 'create_association',
         'failed.eventID': e.request_id,
         'status': 'failed'
         }
         });
         throw new Meteor.Error(e.category_code, e.description);
         }*/
    },
    get_debit: function (debitHref) {
        logger.info("Inside get_debit.");
        logger.info("Debit Href: " + debitHref);
        balanced.configure(Meteor.settings.balanced_api_key);

        //var debit = Utils.extractFromPromise(balanced.get(debitHref));
        var debit = Utils.extractFromPromise(balanced.get(debitHref));
        //logger.info(Object.getOwnPropertyNames(debit));
        logger.info(debit._api.cache[debit.href]);
        var insert_debit = debit._api.cache[debit.href];
        return insert_debit;
    },
    get_customer: function (customerHref) {
        logger.info("Inside get_customer.");
        logger.info("Customer Href: " + customerHref);
        balanced.configure(Meteor.settings.balanced_api_key);

        var customer = Utils.extractFromPromise(balanced.get(customerHref));
        logger.info(customer._api.cache[customer.href]);
        var customer_info = customer._api.cache[customer.href];
        return customer_info;
    }
});


