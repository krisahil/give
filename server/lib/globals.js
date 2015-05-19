Future = Meteor.npmRequire("fibers/future");
// Initialize Stripe with the secret key
Stripe = StripeAPI(Meteor.settings.stripe.secret);

Utils = {
    extractFromPromise: function(promise) {
        var fut = new Future();
        promise.then(function (result) {
            fut.return(result);
        }, function (error) {
            logger.info(error);
            fut.throw(error);
        });
        return fut.wait();
    },
    get_stripe_customer: function (stripe_customer_id) {
        logger.info("Started get_stripe_customer");
        console.log("Stripe customer id: " + stripe_customer_id);
        var stripe_customer = new Future();

        Stripe.customers.retrieve(stripe_customer_id,
            function (error, customer) {
                if (error) {
                    //console.dir(error);
                    stripe_customer.return(error);
                } else {
                    stripe_customer.return(customer);
                }
            }
        );

        stripe_customer = stripe_customer.wait();

        if (!stripe_customer.object) {
            throw new Meteor.Error(stripe_customer.rawType, stripe_customer.message);
        }

        return stripe_customer;
    },
    // Used for getting the customer data from balanced
    get_balanced_customer: function (id) {
        logger.info("Started get_balanced_customer");
        console.log("customer id from get_id: " + id);
        var customer;
        customer = Donate.findOne({'customer.id': id});
        if(customer){
            customer = customer.customer;
        } else {
            customer = Donate.findOne({'debit.customer': id});
            if(customer) {
                customer = customer.customer;
            } else {
                balanced.configure(Meteor.settings.balanced_api_key);

                var balanced_customer = Utils.extractFromPromise(balanced.get('/customers/' + id));
                balanced_customer = balanced_customer._api.cache['/customers/' + id];
                console.dir(balanced_customer);
                var name = balanced_customer.name.split(' ');

                customer = {
                    "fname" : name.slice(0, split_test.length -1).join(' '),
                    "lname" : name.slice(-1),
                    "org" : balanced_customer.business_name,
                    "email_address" : balanced_customer.email,
                    "phone_number" : balanced_customer.phone,
                    "address_line1" : balanced_customer.address.line1,
                    "address_line2" : balanced_customer.address.line2,
                    "region" : balanced_customer.address.state,
                    "city" : balanced_customer.address.city,
                    "postal_code" : balanced_customer.address.postal_code,
                    "country" : balanced_customer.address.country_code,
                    "balanced_customer_id" : id
                };

                /*logger.error("Couldn't find this customer in the donate collection");
                return '';*/
            }
            /*var temp_customer_string = '/customers/' + id;
            customer = Donate.findOne({'debit.billy_customer.processor_url': temp_customer_string});
            if(customer){
                customer = customer.customer;
            } else {
                logger.error("Couldn't find this customer in the donate collection");
                return '';
            }*/
        }
        console.log("Balanced customer_id: " + customer);
        return customer;
    },
    // Take the data from balanced and update Stripe with it
    update_stripe_customer_with_balanced_data: function (data, customer_id, stripe_customer){
        logger.info("Started update_stripe_customer_with_balanced_data");
        var stripeCustomerUpdate = new Future();
        console.dir(data);
        var user_id =               stripe_customer && stripe_customer.metadata && stripe_customer.metadata.user_id;
        var balanced_customer_id;
        if(stripe_customer && stripe_customer.metadata && stripe_customer.metadata.balanced_customer_id){
            balanced_customer_id = stripe_customer.metadata.balanced_customer_id;
        } else if(stripe_customer && stripe_customer.metadata && stripe_customer.metadata['balanced.customer_id']) {
            balanced_customer_id = stripe_customer.metadata['balanced.customer_id'];
        }

        Stripe.customers.update(customer_id, {
                metadata: {
                    "city":                     data.city,
                    "state":                    data.region,
                    "country":                  data.country,
                    "address_line1":            data.address_line1,
                    "address_line2":            data.address_line2,
                    "postal_code":              data.postal_code,
                    "phone":                    data.phone_number,
                    "email":                    data.email_address,
                    "fname":                    data.fname,
                    "lname":                    data.lname,
                    "org":                      data.business_name,
                    "balanced.customer_id":     null,
                    "balanced_customer_id":     balanced_customer_id,
                    "user_id":                  user_id
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
    // Check donation form entries
    check_update_customer_form: function(form, customer_id, dt_persona_id) {
        check(dt_persona_id, Number);
        check(customer_id, String);
        check(form,
            {
                'address':{
                    'address_line1': String,
                    'address_line2': String,
                    'city': String,
                    'state': String,
                    'postal_code': String
                },
                'phone': String
            }
        );
    },
    // Check donation form entries
    checkFormFields: function(form) {

    check(form,
        {paymentInformation: {
            amount: Match.Integer,
            total_amount: Match.Integer,
            donateTo: String,
            donateWith: Match.Optional(String),
            is_recurring: Match.OneOf("one_time", "monthly", "weekly", "daily"),
            coverTheFees: Boolean,
            created_at: String,
            href: Match.Optional(String),
            token_id: Match.Optional(String),
            source_id: Match.Optional(String),
            fees: Match.Optional(Number),
            writeIn: Match.Optional(String),
            start_date: Match.Optional(String),
            later: Match.Optional(Boolean),
            type: String,
            saved: Boolean
        },
            customer: {
                fname: String,
                lname: String,
                org: Match.Optional(String),
                email_address: String,
                phone_number: Match.Optional(String),
                address_line1: String,
                address_line2: String,
                region: String,
                city: String,
                postal_code: String,
                country: String,
                created_at: String,
                id: Match.Optional(String)
            },
            URL: String,
            sessionId: String
        });
    },
    checkLoginForm: function(form){
        check(form, {
            username: String,
            password: String
        });
    }
};