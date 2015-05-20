Template.DonationScheduled.helpers({
    frequency: function () {
        return Session.get('params.frequency');
    },
    amount: function () {
        return Session.get('params.amount');
    },
    start_date: function () {
        return Session.get('params.start_date');
    }
});

Template.DonationScheduled.rendered = function () {
    $('#modal_for_user_give_form').modal('hide');
    $('#modal_for_admin_give_form').modal('hide');
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
};

