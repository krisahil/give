Future = Meteor.npmRequire("fibers/future");
// Initialize Stripe with the secret key
Stripe = StripeAPI(Meteor.settings.stripe.secret);

Utils = {
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
            donateWith: Match.OneOf("Card", "Check"),
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
            type: String
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