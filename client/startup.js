Meteor.startup( function() {
  Stripe.setPublishableKey(Meteor.settings.public.stripe_publishable);
  Bert.defaults = {
    hideDelay: 10000,
    style: 'fixed-top'
  };

  Uploader.finished = function(index, fileInfo) {
    Bert.alert({
      message: "Uploaded " + fileInfo.name,
      type: 'success',
      icon: 'fa-smile-o',
      style: 'growl-top-left'
    });
  };
});
