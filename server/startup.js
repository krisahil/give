Meteor.startup(function() {

    return Meteor.Mandrill.config({
        username: Meteor.settings.mandrillUsername,
        "key": Meteor.settings.mandrillKey
    });


    Stripe.setPublishableKey(Meteor.settings.public.stripe.publishable);
});

/*

logger.info("Started get_dt_funds");
var fundResults;
fundResults = HTTP.get(Meteor.settings.donor_tools_site + '/settings/funds.json?per_page=1000', {
    auth: Meteor.settings.donor_tools_user + ':' + Meteor.settings.donor_tools_password
});
Utils.separate_funds(fundResults.data);


*/
