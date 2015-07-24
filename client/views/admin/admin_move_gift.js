
Template.AdminMoveGift.rendered = function () {
    // Setup parsley form validation
    $('#quick_move').parsley();

};

Template.AdminMoveGift.helpers({
});

Template.AdminMoveGift.events({
    'submit form': function(e) {
        //prevent the default reaction to submitting this form
        e.preventDefault();
        // Stop propagation prevents the form from being submitted more than once.
        e.stopPropagation();

        var opts = {color: '#FFF', length: 60, width: 10, lines: 8};
        var target = document.getElementById('spinContainer');
        spinnerObject = new Spinner(opts).spin(target);

        $("#spinDiv").show();

        // Start the method for moving this gift
        Meteor.call("move_donation_to_other_person", $('#donation-id').val(), $('#move-to-id').val(), function (error, result) {
            if (result) {
                console.log(result);
                $("#spinDiv").hide();
            } else {
                console.log(error);
                $("#spinDiv").hide();
            }
        });

    }
});