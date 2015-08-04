/*****************************************************************************/
/* Modals: Event Handlers and Helpersss .js*/
/*****************************************************************************/
Template.Modals.helpers({
    contact_address: function () {
        return Meteor.settings.public.contact_address;
    },
    support_address: function () {
        return Meteor.settings.public.support_address;
    },
    churchSources: function () {
        return DT_sources.find();
    },
    OTRSourceName: function () {
        var regOTR = /^OTR\s-\s2015\s-\s/;
        var nameReplaced = this.name.replace(regOTR, "")
        return nameReplaced;
    },
    sourceId: function () {
        return this.id;
    }
});