Meteor.startup(function() {
    Stripe.setPublishableKey(Meteor.settings.public.stripe.publishable);
    Bert.defaults.autoHide = false;

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