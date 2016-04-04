Meteor.startup( function() {

  return Mandrill.config({
    username: Meteor.settings.mandrillUsername,
    "key": Meteor.settings.mandrillKey
  });

});

Meteor.startup( function() {

  // We store our DonorTools username and password in our Meteor.settings
  // We store out Stripe keys in the Meteor.settings as well
  // Here we store the status of these settings in our Config document
  // This way we can show certain states from within the app, both to admins and
  // guests

  let config = Config.findOne({
    'OrgInfo.web.domain_name': Meteor.settings.public.org_domain
  });
  console.log(config);
  if (config) {
    if (Meteor.settings.donor_tools_user) {
      config.Settings.DonorTools.usernameExists = true;
    } else {
      config.Settings.DonorTools.usernameExists = false;
    }
    if (Meteor.settings.donor_tools_password) {
      config.Settings.DonorTools.passwordExists = true;
    } else {
      config.Settings.DonorTools.passwordExists = false;
    }
    if (Meteor.settings.stripe.secret) {
      config.Settings.Stripe.keysPublishableExists = true;
    } else {
      config.Settings.Stripe.keysPublishableExists = false;
    }
    if (Meteor.settings.public.stripe_publishable) {
      config.Settings.Stripe.keysSecretExists = true;
    } else {
      config.Settings.Stripe.keysSecretExists = false;
    }
    Config.update({_id: config._id}, {$set: config});
  }
});