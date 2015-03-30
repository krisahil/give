Meteor.startup(function() {
    Stripe.setPublishableKey(Meteor.settings.public.stripe.publishable);
    StripeCheckout.configure({
        key: Meteor.settings.public.stripe.publishable,
        token: function(token) {}
    });
});