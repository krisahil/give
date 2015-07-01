Template.OtherWaysToGive.helpers({
    contact_address: function () {
        return Meteor.settings.public.contact_address;
    },
    org_name: function () {
        return Meteor.settings.public.org_name;
    },
    org_is_501c3: function () {
        return Meteor.settings.public.org_is_501c3;
    },
    org_street_address: function () {
        return Meteor.settings.public.org_street_address;
    },
    org_state: function () {
        return Meteor.settings.public.org_state;
    },
    org_city: function () {
        return Meteor.settings.public.org_city;
    },
    org_zip: function () {
        return Meteor.settings.public.org_zip;
    },
    org_ein: function () {
        return Meteor.settings.public.org_ein;
    }
});