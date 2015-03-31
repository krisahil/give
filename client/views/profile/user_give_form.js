Template.UserGiveForm.rendered = function () {

}

Template.UserGiveForm.helpers({
    selectedNewDevice: function () {
        return true;
    },
    paymentWithCard: function() {
        return Session.equals("UserPaymentMethod", "Card");
    },
    paymentWithCheck: function() {
        return Session.equals("UserPaymentMethod", "Check");
    }
});

Template.UserGiveForm.events({
});