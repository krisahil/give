function setupDonateTo(){
  // This helper doesn't return anything, rather it is used as a reactive
  // helper to retrieve the configuration document reactively
  let config = ConfigDoc();

  var givingOptions = config && config.Giving && config.Giving.options;

  if( givingOptions && givingOptions.length > 0 ) {
    $( '#donateTo' ).select2( {
      data:             _.sortBy( givingOptions, 'position' ),
      dropdownCssClass: 'dropdown-inverse',
      placeholder:      "Choose one"
    } );
  }
}

Template.DonationTo.helpers({
  setupDonateToDropwdown: function () {
    setupDonateTo();
  }
});

Template.DonationTo.events({
  'change #donateTo': function() {
    if ($('#donateTo').val() !== 'WriteIn') {
      $('#giftDesignationText').hide();
      Session.set('showWriteIn', 'no');
    } else {
      Session.set('showWriteIn', 'yes');
      // setup modal for entering give toward information
      $('#modal_for_write_in').modal({
        show: true,
        backdrop: 'static'
      }, function(e) {
      });
    }
    Session.set('params.donateTo', $('#donateTo').val());
  }
});

Template.DonationTo.onRendered(function() {
  setupDonateTo();

  if (Session.get('params.donateTo')) {
    $("#donateTo").val(Session.get('params.donateTo'));
	}
  if (Session.get('params.donateWith')) {
    $("#donateWith").val(Session.get('params.donateWith'));
  }
  if(Session.get('params.donateWith') === 'Check') {
    Session.set("paymentMethod", 'Check');
  } else {
    Session.set("paymentMethod", 'Card');
  }
  if(Session.get('params.recurring')) {
    $("#is_recurring").val(Session.get('params.recurring'));
  }
});

