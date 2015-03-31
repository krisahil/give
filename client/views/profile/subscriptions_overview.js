Template.SubscriptionsOverview.rendered = function() {
    Session.setDefault('paymentMethod', 'default');

    //setup modal for entering give toward information
    if (Session.equals('params.give', 'Yes')) {
        $('#modal_for_user_give_form').modal({
            show: true,
            backdrop: 'static'
        });
    }
}


Template.SubscriptionsOverview.helpers({
    subscriptions: function(){
        return Subscriptions.find();
    },
    plan_name: function() {
        return Subscriptions.findOne().plan.name;
    },
    show_give_form: function () {
        return Session.equals("params.give", "Yes");
    }
});
