Future = Meteor.npmRequire("fibers/future");
// Initialize Stripe with the secret key
Stripe = StripeAPI(Meteor.settings.stripe.secret);

Utils = {
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
    // Check donation form entries
    check_update_customer_form: function(form, customer_id, dt_persona_id) {
        check(dt_persona_id, Number);
        check(customer_id, String);
        check(form,
            {
                'address':{
                    'address_line1': String,
                    'address_line2': Match.Optional(String),
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

        // Check all the form fields from the donation forms
        check(form, {
            paymentInformation: {
                amount: Match.Integer,
                campaign: Match.Optional(String),
                coverTheFees: Boolean,
                created_at: String,
                donateTo: String,
                donateWith: Match.Optional(String),
                dt_source: Match.Optional(String),
                fees: Match.Optional(Number),
                href: Match.Optional(String),
                is_recurring: Match.OneOf("one_time", "monthly", "weekly", "daily", "yearly"),
                later: Match.Optional(Boolean),
                note: Match.Optional(String),
                saved: Boolean,
                send_scheduled_email: Match.Optional(String),
                source_id: Match.Optional(String),
                start_date: Match.Optional(String),
                token_id: Match.Optional(String),
                total_amount: Match.Integer,
                type: String,
                writeIn: Match.Optional(String)
            },
            customer: {
                fname: String,
                lname: String,
                org: Match.Optional(String),
                email_address: String,
                phone_number: Match.Optional(String),
                address_line1: String,
                address_line2: Match.Optional(String),
                region: String,
                city: String,
                postal_code: String,
                country: Match.Optional(String),
                created_at: String,
                id: Match.Optional(String)
            },
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