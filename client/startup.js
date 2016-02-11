Meteor.startup(function() {
  Stripe.setPublishableKey(Meteor.settings.public.stripe.publishable);

  Bert.defaults = {
    hideDelay: 10000,
    style: 'fixed-top'
  };
});