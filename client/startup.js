Meteor.startup(function() {
    Stripe.setPublishableKey(Meteor.settings.public.stripe.publishable);

    // Initialize Mixpanel Analytics
    mixpanel.init(Meteor.settings.public.mixpanel.token); //YOUR TOKEN

    // Link their account
    Deps.autorun(function() {
        var user = Meteor.user();

        if (! user)
            return;

        mixpanel.identify(user._id);
        mixpanel.people.set({
            "Name": user.profile.firstName + ' ' + user.profile.lastName,
            // special mixpanel property names
            "$first_name": user.profile.firstName,
            "$last_name": user.profile.lastName,
            "$email": user.emails[0].address //IF YOU HAVE IT
        });
    });
});