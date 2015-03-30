Template.UserGiveForm.rendered = function () {

}

Template.UserGiveForm.helpers({
    selectedNewDevice: function () {
        return true;
    },
    paymentWithCard: function() {
        return Session.equals("paymentMethod", "Card");
    }
});

Template.UserGiveForm.events({
    'change [name=pay_with]': function() {
        var selectedValue = $("[name=donateWith]").val();
        Session.set("paymentMethod", selectedValue);
    }
});