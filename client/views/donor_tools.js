function output(inp) {
    document.body.appendChild(document.createElement('pre')).innerHTML = inp;
}

Template.DonorToolsFunds.events({
    'submit form': function(e) {
        //prevent the default reaction to submitting this form
        e.preventDefault();
        // Stop propagation prevents the form from being submitted more than once.
        e.stopPropagation();

        Meteor.call("get_dt_funds", function (error, result) {
            if (result) {
                console.dir(result);
                $('#data').html('<div class="col-lg-6 text-center"><br><p>' + result+ '</p></div>');
                $('#form_result').show();
                alert("Got 'em.")
            } else {
                console.log(error);
            }
        });
    }
});
