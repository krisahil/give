Meteor.startup(function() {
    Stripe.setPublishableKey(Meteor.settings.public.stripe.publishable);

  // Setup the client side logging to pass that logging to the
  // papertrailapp.com server by way of a method call
/*
Not ready to use this __proto__ call to connect to the console.log() function,
Seems to be a little to far to go just to get logging in the papertrailapp.com
Need to look into a package that can help with better loggin on the client side


console.__proto__.log = (function(_super) {
    return function() {
      Meteor.call("clientLog", arguments[0], function (err, res) {
        if(err) {
          console.error("err");
        } else {
          console.info("res");
        }
      });
      return _super.apply(this, arguments);
    };

  })(console.__proto__.log);*/

  Bert.defaults = {
    hideDelay: 10000,
    style: 'fixed-top'
  };

  return SEO.config({
      title: 'Give - Trash Mountain Project',
      meta: {
        'description': 'Webapp for giving to Trash Mountain Project'
      },
      og: {
        'image': 'https://give.trashmountain.com/images/TMP_Logo_White_Background_WO_Live_the_Command.png'
      }
    });
});