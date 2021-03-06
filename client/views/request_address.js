/*****************************************************************************/
/* RequestAddress: Event Handlers and Helpers */
/*****************************************************************************/
Template.RequestAddress.events({
  'change #country': function(e, tmpl) {
    if($('#country').val() !== "US") {
      $('#phone').hide().find('input, textarea').prop('disabled', true);
      $('#phone, text').val("");
      $('#phoneDiv').hide().find('input, textarea').prop('disabled', true);
      $('#city').attr("placeholder", "City / Town");
      $('#region').attr("placeholder", "State / Province / Region");
      $('#postal_code').attr("placeholder", "ZIP / Postal Code");
    } else {
      $('#phoneDiv').show().find('input, textarea').prop('disabled', false);
      $('#phone').show().find('input, textarea').prop('disabled', false);
    }
  },
  'click #show_business_name': function () {
    console.log("clicked");
    $("#org").val('');
    $( "#org_form_group" ).toggle();
  }
});

Template.RequestAddress.helpers({
  attributes_Input_FName: function () {
      return {
        type: "text",
        name: "fname",
        id: 'fname',
        placeholder: "First Name",
        required: true
      }
    },
    attributes_Input_LName: function () {
      return {
        type: "text",
        name: "lname",
        id: "lname",
        placeholder: "Last Name",
        required: true
      }
    },
    attributes_Input_Email_Address: function () {
      return {
        type: "email",
        name: "email_address",
          id: "email_address",
        placeholder: "Email Address",
        required: true
      }
    },
    attributes_Input_Email_Address_Verify: function () {
      return {
        type: "email",
        name: "email_address_verify",
          id: "email_address_verify",
        placeholder: "Retype Your Email Address",
        required: true
      }
    },
    attributes_Input_Phone_Number: function () {
      return {
        placeholder: "Phone Number",
        required: true,
        type: "tel",
        id: "phone"
      }
    },
    attributes_Input_AddressLine1: function () {
      return {
        type: "text",
        name: "address_line1",
          id: "address_line1",
        placeholder: "address line 1",
        required: true
      }
    },
    attributes_Input_AddressLine2: function () {
      return {
        type: "text",
        name: "address_line2",
          id: "address_line2",
        placeholder: "address line 2"
      }
    },
    attributes_Input_City: function () {
      return {
        type: "text",
        name: "city",
          id: "city",
        placeholder: "city",
        required: true
      }
    },
    attributes_Input_State: function () {
      return {
        type: "text",
        name: "region",
        id: "region",
        placeholder: "State",
        required: true
      }
    },
    attributes_Input_Zip: function() {
      return {
        type: "text",
        name: "postal_code",
        id: "postal_code",
        placeholder: "Zip or Postal Code",
        required: true
      };
    },
    attributes_Select_Country: function() {
      return {
        name: "country",
        id: "country",
        required: true
      };
    }
});

Template.RequestAddress.onRendered(function() {
  $("#phone").mask("(999) 999-9999");
});
