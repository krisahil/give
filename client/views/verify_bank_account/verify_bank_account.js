Template.VerifyBankAccount.events({
   'submit form': function (e) {
     e.preventDefault();

     var amountOne = e.target.micro_amount_one.value;
     var amountTwo = e.target.micro_amount_two.value;

     // Hard-code customer ID attached to test bank account, for testing.
     var customer_id = 'cus_8TeICQnpJuehV7';

      Meteor.call('stripeVerifyBankAccount', customer_id, function(error, customer){
        if (error){
          Bert.alert(error.message, "danger");
        } else {
          console.log(customer);
        }
      });
   },
});
