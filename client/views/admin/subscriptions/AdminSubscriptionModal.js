Template.AdminSubscriptionModal.helpers({
  attributes_Input_Amount: function() {
    return {
      name: "amount",
      id: "amount",
      min: 1,
      required: true
    };
  },
  amount: function () {
    return Session.get("change_amount");
  },
  currentDate: function () {
    if(Session.equals("yes_change_date", true)){
      let currentDate = moment.unix(Session.get("change_date")).format('D MMM, YYYY');
      return currentDate;
    } else {
      return;
    }
  },
  changeDate: function () {
    return Session.get("yes_change_date");
  },
  changeDesignation: function () {
    return Session.get("yes_change_designation");
  }
});

Template.AdminSubscriptionModal.events({
  'submit form': function(e) {
    e.preventDefault();
    console.log("Submitted event started for AdminSubscriptionModal form");
    let subscription_id = Session.get("change_subscription_id");
    let customer_id = Session.get("change_customer_id");
    let amount = parseInt(((App.getCleanValue('#amount').replace(/[^\d\.\-\ ]/g, '')) * 100).toFixed(0));
    let trial_end = $("#start_date").val() ? moment(new Date(App.getCleanValue('#start_date'))).format('X'): '';
    let donateToText = $("#designationSection").is(":visible") ? $('#donateTo option:selected').text() : Session.get("change_donateTo");

    // TODO: update these area for change designation show/hide
    if(Session.get("change_donateTo") === donateToText && Session.get("change_amount") === amount &&
      (Session.equals("yes_change_date", false) || !Session.get("yes_change_date"))){
      alert("You haven't made any changes.");
      return "No changes";
    }

    amount = Session.get("change_amount") === amount ? 0 : amount;

    var loadingSubmitButton = $(':submit').button('loading');

    console.log(customer_id, subscription_id, amount, trial_end, donateTo);
    // TODO: modal for showing the user the form with current subscription values. Then from there you can call the below method
    Meteor.call( "edit_subscription", customer_id, subscription_id, amount, trial_end, donateToText, function ( error, response ) {
      if( error ) {
        console.log( error, error.message);
        Bert.alert( error.message, "danger" );
        $( loadingSubmitButton ).button( 'reset' );
      } else {
        console.log( response );
        Bert.alert( response, "success" );
        $( loadingSubmitButton ).button( 'reset' );

        Session.set("yes_change_date", false);
        Session.set("yes_change_designation", false);
        $('#calendarSection').hide();
        $('#designationSection').hide();
        $('#modal_for_admin_subscription_change_form').modal('hide');
      }
    } );

  },
  'click #showCalendar': function (e) {
    e.preventDefault();
    Session.set("yes_change_date", true);
    $('#calendarSection').show();
  },
  'click #hideCalendar': function (e) {
    e.preventDefault();
    Session.set("yes_change_date", false);
    $('#calendarSection').hide();
  },
  'click #showDesignation': function (e) {
    e.preventDefault();
    Session.set("yes_change_designation", true);
    $('#designationSection').show();
  },
  'click #hideDesignation': function (e) {
    e.preventDefault();
    Session.set("yes_change_designation", false);
    $('#designationSection').hide();
  },
  'click .close': function (e) {
    Session.set("yes_change_date", false);
    Session.set("yes_change_designation", false);
    $('#calendarSection').hide();
    $('#designationSection').hide();
  }
});

Template.AdminSubscriptionModal.onRendered(function () {

  Session.set("yes_change_date", false);

  // Setup parsley form validation
  $('#subscription_change').parsley();

  $('select').select2({dropdownCssClass: 'dropdown-inverse'});

  var datepickerSelector = $('#start_date');
  datepickerSelector.datepicker({
    showOtherMonths: true,
    selectOtherMonths: true,
    dateFormat: 'd MM, yy',
    minDate: 0,
    maxDate: +32
  }).prev('.input-group-btn').on('click', function (e) {
    e && e.preventDefault();
    datepickerSelector.focus();
  });
  $.extend($.datepicker, { _checkOffset: function (inst,offset,isFixed) { return offset; } });

  // Now let's align datepicker with the prepend button
  datepickerSelector.datepicker('widget').css({ 'margin-left': -datepickerSelector.prev('.input-group-btn').find('.btn').outerWidth() + 5 });

});



