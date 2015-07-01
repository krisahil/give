/*****************************************************************************/
/* Modals: Event Handlers and Helpersss .js*/
/*****************************************************************************/
Template.Modals.helpers({
    contact_address: function () {
        return Meteor.settings.public.contact_address;
    },
    support_address: function () {
        return Meteor.settings.public.support_address;
    }
});