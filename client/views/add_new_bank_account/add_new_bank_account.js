Template.AddNewBankAccount.events({
  'submit form': function (e) {
    //prevent the default reaction to submitting this form
    e.preventDefault();
    // Stop propagation prevents the form from being submitted more than once.
    e.stopPropagation();

    console.log("Adding");
    let save_payment = $("#save_payment").is(':checked');
    console.log(save_payment, Session.get('updateSubscription'));


    let opts = {color: '#FFF', length: 60, width: 10, lines: 8};
    let target = document.getElementById('spinContainer');
    spinnerObject = new Spinner(opts).spin(target);

    // TODO: Set this as the new primary payment method for this customer's subscription.

    let name;
    if(Meteor.user().profile.business_name) {
      name = Meteor.user().profile.business_name;
    } else {
      name = Meteor.user().profile.fname + " " + Meteor.user().profile.lname;
    }
    Stripe.bankAccount.createToken({
      country: Meteor.user().profile.address.country,
      routing_number: $('#routing_number').val(),
      account_number: $('#account_number').val(),
      name: name
    }, function(status, response) {
      if( response.error ) {
        //error logic here
        App.handleErrors( response.error );
      } else {
        // Call your backend
        console.log(response);

        console.log(Session.get("updateSubscription"));
        let subscription_id = Session.get("updateSubscription");
        Meteor.call('stripeUpdateBank', response.id, subscription_id, save_payment, function (error, result) {
          if (error) {
            console.log(error);
            //App.handleErrors is used to check the returned error and the display a user friendly message about what happened that caused
            //the error.
            Bert.alert({
              message: error.reason,
              type: 'danger',
              icon: 'fa-frown-o'
            });
          } else {
            if ( result.error ) {
              console.log( result.error );
              var send_error = {code: result.error, message: result.message};

              Bert.alert({
                title: send_error.code,
                message: send_error.message,
                type: 'danger',
                icon: 'fa-frown-o'
              });

            } else {
              Bert.alert('Updated', 'success');

              $("#routing_number").val('');
              $("#account_number").val('');
              $('#save_payment').prop('checked', false);
              $('#modal_for_add_new_bank_account').modal('hide');
              Session.delete("updateSubscription");

            }
          }
        });

      }
    });

  }
});

Template.AddNewBankAccount.onRendered( function (){
  $('#add-bank-form').parsley();
});