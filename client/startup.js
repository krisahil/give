Meteor.startup( function() {
  Stripe.setPublishableKey(Meteor.settings.public.stripe_publishable);
  Bert.defaults = {
    hideDelay: 10000,
    style: 'fixed-top'
  };
});
