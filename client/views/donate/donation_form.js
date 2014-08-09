/*****************************************************************************/
/* DonationForm: Event Handlers and Helpers */
/*****************************************************************************/
// this function is used to update the displayed total
// since we can take payment with card fees added in this is needed to update the 
// amount that is shown to the user and passed as total_amount through the form
function updateTotal(){
  var data = Session.get('paymentMethod');
  var donationAmount = $('#amount').val();
  donationAmount = donationAmount.replace(/^0+/, '');
  console.log(donationAmount);
  console.log(data);
  if (data == 'check') {
    if ($.isNumeric(donationAmount)) {
      $("#total_amount").val(donationAmount);
      console.log($("#total_amount").val());
      var testValueTransfer = $("#total_amount").val();
      $("#total_amount_display").text("$" + donationAmount).css({ 'color': '#34495e'});
      return Session.set("total_amount", testValueTransfer);
    } else {
          return $("#total_amount_display").text("Please enter a number in the amount field").css({ 'color': 'red'});
        }
  } else {
    if (donationAmount < 1 && $.isNumeric(donationAmount) ) {
      return $("#total_amount_display").text("Amount cannot be lower than $1.").css({ 'color': 'red'});
    } else{
      if ($.isNumeric(donationAmount)) {
        if ($('#coverTheFees').prop('checked')) {
          var fee = Math.round(donationAmount * .029 + .30);
          var roundedAmount = (+donationAmount + +fee);
          $("#total_amount_display").text("$" + donationAmount + " + $" + fee + " = $" + roundedAmount).css({ 'color': '#34495e'});
          $("#total_amount").val(roundedAmount);
          return Session.set("amount", roundedAmount);
        } else{
          $("#total_amount").val(donationAmount);
          return $("#total_amount_display").text("$" + donationAmount).css({ 'color': '#34495e'});
        }
      } else {
          return $("#total_amount_display").text("Please enter a number in the amount field").css({ 'color': 'red'});
        }
      
    }
  }
}
uncheckThatBox = function () {
  $(':checkbox').checkbox('toggle');
}

Template.DonationForm.events({
  /*'keypress form': function(e, tmpl) {
      var keycode = (event.keyCode ? event.keyCode : event.which);
      if (keycode == '13') {
        $('button[name="submitThisForm"]').trigger('click');
      }
    },*/
    //'click [name=submitThisForm]': function (e, tmpl) {
  'submit form': function (e, tmpl) {
    e.preventDefault();
    
    //Start the bootstrap modal with the awesome font refresh logo
    //Also, backdrop: 'static' sets the modal to not be exited when 
    //a user clicks in the background.
    $('#loading1').modal({
      visibility: 'show',
      backdrop: 'static'});
    
    //var coverTheFeesStatus =  $(e.target).find('[name=coverTheFees]').is(':checked');
    var form = {
      "paymentInformation": [{
      "amount":         $(e.target).find('[name=amount]').val(),
      "total_amount":   $(e.target).find('[name=total_amount]').val(),
      "donateTo":       $("#donateTo").val(),
      "donateWith":     $("#donateWith").val(),
      "is_recurring":   $('#is_recurring').val(),
      "coverTheFees":   $('#coverTheFees').is(":checked"),
      "created_at":     new Date().getTime(),
      }],
        "customer": [{
        "fname":          $(e.target).find('[name=fname]').val(),
        "lname":          $(e.target).find('[name=lname]').val(),
        "email_address":  $(e.target).find('[name=email_address]').val(),
        "phone_number":   $(e.target).find('[name=phone_number]').val(),
        "address_line1":  $(e.target).find('[name=address_line1]').val(),
        "address_line2":  $(e.target).find('[name=address_line2]').val(),
        "region":         $(e.target).find('[name=region]').val(),
        "city":           $(e.target).find('[name=city]').val(),
        "postal_code":    $(e.target).find('[name=postal_code]').val(),
        "country":        $(e.target).find('[name=country]').val(),
        "created_at":     new Date().getTime()
      }]
    };
//remove below before production    
console.log(form.paymentInformation[0].donateTo);
console.log(form.paymentInformation[0].is_recurring);
if(form.paymentInformation[0].donateWith === "card") {
  form.paymentInformation[0].card_number =     $(e.target).find('[name=card_number]').val();
  form.paymentInformation[0].expiry_month =    $(e.target).find('[name=expiry_month]').val();
  form.paymentInformation[0].expiry_year =     $(e.target).find('[name=expiry_year]').val();
  form.paymentInformation[0].cvv =             $(e.target).find('[name=cvv]').val();

  //set the form type so the server side method knows what to do with the data.
  form.paymentInformation[0].type = "card";
} else {
  form.paymentInformation[0].account_number =  $(e.target).find('[name=account_number]').val();
  form.paymentInformation[0].routing_number =  $(e.target).find('[name=routing_number]').val();
  form.paymentInformation[0].account_type =    $(e.target).find('[name=account_type]').val();

  //set the form type so the server side method knows what to do with the data.
  form.paymentInformation[0].type = "check";
  Session.equals("paymentMethod", "check");
}
    form._id = Donate.insert(form.created_at);

    Donate.update(form._id, {$set: {
      sessionId: Meteor.default_connection._lastSessionId,
      'customer': form.customer[0],
      'debit.donateTo': form.paymentInformation[0].donateTo,
      'debit.donateWith': form.paymentInformation[0].donateWith,
      'debit.email_sent': false,
      'debit.type': form.paymentInformation[0].type,
      'debit.total_amount': form.paymentInformation[0].total_amount,
      'debit.amount': form.paymentInformation[0].amount,
      'debit.fees': form.paymentInformation[0].fees,
      'debit.coveredTheFees': form.paymentInformation[0].coverTheFees
    }});
    //remove below before production 
    console.log("ID: " + form._id);
    console.log("Session ID: " + Meteor.default_connection._lastSessionId);
/*    Meteor.call('createBillyCustomer', 1, function (error, result) {
      console.log(error);
      console.log(result);
    });*/
    console.log($('#is_recurring').val());
    if ($('#is_recurring').val() == 'one_time') {
    Meteor.call("processPayment", form, function(error, result) {
        if(result) {
          $('#loading1').modal('hide');

          //Session.set('status', Donate.findOne({id: form._id}).status);
           Router.go('/give/thanks/' + form._id);
         } else {
            Donate.update(form._id, {$set: {failed: error}});
            var donateDocument = Donate.findOne({'_id': form._id});
            var insertDoc = AllErrors.insert({name: "Failed", failedResponse: donateDocument});
            console.log("Error message: " + error.message);
            console.log(error);
            var errorCode = error.error;
            var errorDescription = error.description;
            //remove below before production 
            console.log("description: " + error.description);
            
            //handleErrors is used to check the returned error and the display a user friendly message about what happened that caused
            //the error. 
            handleErrors(errorCode);

            $('#loading1').modal('hide');
            }
            //END error handling block for meteor call to processPayment
        });
        //END Meteor call block
        } else {
          form.pass = true;
          Meteor.call('createCustomer', form, function (error, result) {
            if (result) {
              $('#loading1').modal('hide');
                Router.go('/give/thanks/' + form._id);
                console.log(" Result: " + result.statusCode);
            } else {
              //remove below before production 
              $('#loading1').modal('hide');
              var errorCode = error.error;
              alert(errorCode);

              //handleErrors is used to check the returned error and the display a user friendly message about what happened that caused
              //the error. 
              handleErrors(errorCode);
              console.log(error.error.data.error_class);
              console.log(error.error.data.error_message);
              console.log(error.reason);
            }
          });
        }
  },
    
  'click [name=is_recurring]': function (e, tmpl) {
      if ($( "#is_recurring" ).val() == 'monthly') {
        Session.set('recurring', true);
        console.log("Checked equal to true");
      }else {
        Session.set('recurring', false);
        console.log("Checked equal to false");
      }
    },    
    'click [name=coverTheFees]': function (e, tmpl) {
      var coverTheFeesBox = tmpl.find('input').checked;
    },
    'keyup [name=amount]': function() {    
      return updateTotal();
    },
    'change [name=amount]': function() {    
      return updateTotal();
    },
    'change [name=coverTheFees]': function() {    
      return updateTotal();
    },
    'click [name=donateWith]': function(e,tmpl) {
      var selectedValue = $("#donateWith").val();
      Session.set("paymentMethod", selectedValue);
      updateTotal(selectedValue);
    },
    'change [name=donateWith]': function(e,tmpl) {
      setTimeout(function () {
        uncheckThatBox(); //call the same function twice, 
        uncheckThatBox(); //ugly hack to fix the box not appearing when switching between check and card
      }, 20);
      var selectedValue = $("#donateWith").val();
      Session.set("paymentMethod", selectedValue);
      updateTotal(selectedValue);
    },
    //keypress input detection for autofilling form with test data
    'keypress input': function(e) {
      if(e.which === 17) { //17 is ctrl + q
        fillForm();
      }
    }/*,
    'mouseover #accountTypeQuestion': function(e,tmpl) {
      $('[name=checkGraphic]').toggle();
    },
    'click #accountTypeQuestion': function(e,tmpl) {
      $('[name=checkGraphic]').toggle();
    }*/
});

Template.DonationForm.helpers({
  paymentWithCard: function () {
    return Session.equals("paymentMethod", "card");
  },
  coverTheFeesChecked: function () {
    return this.coverTheFees ? 'checked' : '';
  },
  attributes_Input_Amount: function () {
    return {
        name: "amount",
        id: "amount",
        class: "form-control",
        min: "1",
        type: "number",
        required: true
    }
  },
  attributes_Label_Amount: function () {
      return {
          class: "col-md-4 control-label",
          for: "amount"
      }
  },
  attributes_Label_Name: function () {
    return {
      class: "col-sm-3 control-label",
      for: "name"
    }
  }
});

/*****************************************************************************/
/* DonationForm: Lifecycle Hooks */
/*****************************************************************************/
Template.DonationForm.created = function () {
};

Template.DonationForm.rendered = function () {

// Below is used to rewrite the style of the drop down
  $('select[name=donateWith]').selectpicker({style: 'btn-primary', menuStyle: 'dropdown-inverse'}); 
  $('select[name=donateTo]').selectpicker({style: 'btn-primary', menuStyle: 'dropdown-inverse'});
  $('select[name=is_recurring]').selectpicker({style: 'btn-primary', menuStyle: 'dropdown-inverse'}); 
  $(':checkbox').checkbox('uncheck');
  $('#amount').tooltip({container: 'body', trigger: 'hover focus click', title: 'Amount', placement: 'auto top'});
  $('[name=donationSummary]').tooltip({trigger: 'hover focus', template: '<div class="tooltip tooltipWide" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner tooltipInnerWide"></div></div>',
    title: 'Below is the summary of your donation. To change your options please use the dropdown buttons.', placement: 'auto top'});
  $('#donateWith').tooltip({container: 'body', trigger: 'hover focus', title: 'How do you want to pay for your gift?', placement: 'auto top'});
  $('#is_recurring').tooltip({container: 'body', trigger: 'hover focus', title: 'Select weather this is a one-time gift or recurring monthly.', placement: 'auto top'});
  $('[name=fname]').tooltip({container: 'body', trigger: 'hover focus', title: 'First Name', placement: 'auto top'});
  $('[name=lname]').tooltip({container: 'body', trigger: 'hover focus', title: 'Last Name', placement: 'auto top'});
  $('[name=email_address]').tooltip({container: 'body', trigger: 'hover focus', title: 'Email Address', placement: 'auto top'});
  $('#phone').tooltip({container: 'body', trigger: 'hover focus', title: 'Phone Number', placement: 'auto top'});
  $('[name=address_line1]').tooltip({container: 'body', trigger: 'hover focus', title: 'Address Line 1', placement: 'auto top'});
  $('[name=address_line2]').tooltip({container: 'body', trigger: 'hover focus', title: 'Address Line 2', placement: 'auto top'});
  $('[name=city]').tooltip({container: 'body', trigger: 'hover focus', title: 'City', placement: 'auto top'});
  $('[name=region]').tooltip({container: 'body', trigger: 'hover focus', title: 'State/Region', placement: 'auto top'});
  $('[name=postal_code]').tooltip({container: 'body', trigger: 'hover focus', title: 'Postal Code', placement: 'auto top'});
  $('[name=country]').tooltip({container: 'body', trigger: 'hover focus', title: 'Country', placement: 'auto top'});  
  $('#accountTypeQuestion').tooltip({container: 'body', trigger: 'hover focus', template: '<div class="tooltip tooltipWide" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner tooltipInnerWide"></div></div>',
    title: 'Give by ACH. There are usually 3 sets of numbers at the bottom of a check. The short check number, the 9 digit routing number and the account number.',
    placement: 'auto top'});  
  //$('[name=checkGraphic]').hide();
//remove below before production 
//Parsley form validation setup, commented to test other things while I wait to 
//hear back from the developer on a good example to work from.
/*  $('#donation_form').parsley(parsleyOptions);
  parsleyOptions = {
  // Sets success and error class to Bootstrap class names
  successClass: '',//'has-success',
  errorClass: 'has-error has-feedback',
  trigger: 'change',

  // Bootsrap needs success/error class to be set on parent element
  errors: {
   classHandler: function ( elem, isRadioOrCheckbox ) {
     // specify where parsley error-success classes are set
     return $(elem).parents(".form-group");
   },
   // Set these to empty to make sure the default Parsley elements are not rendered
   errorsWrapper: '',
   errorElem: ''
  },

  listeners: {
   onFieldValidate: function ( elem ) {
     // remove the X from onFieldError if it's there
     elem.next( ".glyphicon-remove" ).remove();
   },

   onFieldError: function ( elem, constraints, parsleyField ) {
     // add the Bootstrap X glyphicon to the right side of the form element
     elem.after( '<span class="glyphicon glyphicon-remove form-control-feedback"></span>' );
     // access the data-required-message="xx" attribute on the field
     throwError( 000, "", elem.data('required-message' ) );
    },

    // onFieldSuccess: function(elem, constraints, parsleyField) {
    //   elem.next().remove( 'form-control-feedback' );
    // }
  }
};*/
};

Template.DonationForm.destroyed = function () {
};


Template.checkPaymentInformation.helpers({

    attributes_Input_AccountNumber: function () {
      return {
        type: "number",
        name: "account_number",
        id: "account_number",
        class: "form-control",
        placeholder: "Bank Account Number"
      }
    },
    attributes_Input_RoutingNumber: function () {
      return {
        type: "text",
        name: "routing_number",
        id: "routing_number",
        class: "form-control",
        required: true,
        placeholder: "Routing numbers are 9 digits long"
      }
    },
    attributes_Label_AccountNumber: function () {
      return {
        class: "col-sm-3 control-label",
        for: "account_number"
      }
    },
    attributes_Label_RoutingNumber: function () {
      return {
        class: "col-sm-3 control-label",
        for: "routing_number"
      }
    }
});

//Check Payment Template mods
Template.checkPaymentInformation.rendered = function () {
  $('select[name="account_type"]').selectpicker({style: 'btn-lg', menuStyle: 'dropdown-inverse'}); 
  $("#routing_number").mask("999999999");
  $('#account_number').tooltip({container: 'body', trigger: 'hover focus', title: 'Bank Account Number', placement: 'auto top'});
  $('#routing_number').tooltip({container: 'body', trigger: 'hover focus', title: 'Routing Number (always 9 digits long)', placement: 'auto top'});  
  }
Template.checkPaymentInformation.created = function () {
  //$("#routing_number").mask("(999)999-9999");
  }

//Card Payment Template mods
Template.cardPaymentInformation.rendered = function () {
  $('select[name="expiry_month"]').selectpicker({style: 'btn-primary btn-lg2', menuStyle: 'dropdown-inverse'}); 
  $('select[name="expiry_year"]').selectpicker({style: 'btn-primary btn-lg2', menuStyle: 'dropdown-inverse'}); 
  $('#card_number').tooltip({container: 'body', trigger: 'hover focus', title: 'Card Number', placement: 'auto top'});
  $('#expirationDataQuestion').tooltip({container: 'body', trigger: 'hover focus', title: 'Card expiration date', placement: 'auto top'});
  $('#cvv').tooltip({container: 'body', trigger: 'hover focus', title: 'CVV Code', placement: 'auto top'}); 
}

function handleErrors (data) {
  switch (data) {
              case "500":
                alert("Something went wrong, sorry about that. Please try again.");
                break;
              case "card-declined":
                  //var sendToErrorFunction = cardDeclined();
                  //remove below before production 
                  alert("Card was declined");
                  //use this area to add the error to the errors collection,
                  //also, send an email to me with the error printed in it
                  //don't need to use mandrill for this (unless that would be 
                  //easier
                  break;
              case "account-insufficient-funds":
                  //var sendToErrorFunction = accountInsufficientFunds();
                  break;
              case "authorization-failed":
                  //var sendToErrorFunction = authorizationFailed();
                  break;
              case "address-verification-failed":
                  //var sendToErrorFunction = addressVerificationFailed();
                  break;
              case "bank-account-not-valid":
                  //var sendToErrorFunction = bankAccountNotValid();
                  break;
              case "card-not-valid":
              //remove below before production 
                  console.log(error.details);
                  //var sendToErrorFunction = cardNotValid();
                  break;
              case "card-not-validated":
                  //this is the error for a card that is to short, probably for other errors too
                  //remove below before production 
                  console.log(error.details);
                  //var sendToErrorFunction = cardNotValidated();
                  break;
              case "insufficient-funds":
                  //var sendToErrorFunction = insufficientFunds();
                  break;
              case "multiple-debits":
                  //var sendToErrorFunction = multipleDebits();
                  break;
              case "no-funding-destination":
                  //var sendToErrorFunction = noFundingDestination();
                  break;
              case "no-funding-source":
                  break;
              case "unexpected-payload":
                  break;
              case "bank-account-authentication-forbidden":
                  break;
              case "incomplete-account-info":
                  break;
              case "invalid-amount":
                alert((error.details));
                  break;
              case "invalid-bank-account-number":
                  break;
              case "invalid-routing-number":
                  break;
              case "not-found":
                  break;
              case "request":
              //remove below before production 
                  console.log(error.details);
                  break;
              case "method-not-allowed":
                  break;
              case "amount-exceeds-limit":
                  //use this area to split payment into more than one
                  //then send the multiple payments through, 
                  //or for a temporary workaround print instructions
                  //back to the user, tell them the max and how they can
                  //debit more in sepearte transactions
                  break;
              default:
              //remove below before production 
                  console.log("Didn't match any error case");
                  //var sendToErrorFunction = "No Match";
                  break;
            }
            //END Switch case block
}

function fillForm() {
  if(Session.get("paymentMethod") === "check"){
    console.log("Check area of fillForm");
    $('#routing_number').val("321174851");
    $('#account_number').val("9900000003");
  } else {
    $('#card_number').val("4444444444444448");
    $('#expiry_month option').prop('selected', false).filter('[value=12]').prop('selected', true);
    $('select[name=expiry_month]').change();
    $('#expiry_year option').prop('selected', false).filter('[value=2015]').prop('selected', true);
    $('select[name=expiry_year]').change();
    //$('select[name="expiry_month"]').val("12");
    //$('select[name="expiry_year"]').val("2015");
    $('#cvv').val("123");
  }
    $('#fname').val("John");
    $('[name="lname"]').val("Doe")
    $('[name="email_address"]').val("josh@trashmountain.com");
    $('#phone').val("(785) 246-6845");
    $('[name="address_line1"]').val("Address Line 1");
    $('[name="address_line2"]').val("Address Line 2");
    $('[name="city"]').val("Topeka");
    $('#region').val("KS");
    $('[name="postal_code"]').val("66618");
    $('#amount').val("1.23");

}