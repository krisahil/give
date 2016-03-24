Template.DonationTo.events({
  'change #donateTo': function() {
    console.log("Test");
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
  if (Session.get('params.donateTo')) {
    $("#donateTo").val(Session.get('params.donateTo'));
	}
  if (Session.get('params.donateWith')) {
    $("#donateWith").val(Session.get('params.donateWith'));
  }
  if(Session.get('params.donateWith') === 'Card') {
    Session.set("paymentMethod", 'Card');
  } else {
    Session.set("paymentMethod", 'Check');
  }
  if(Session.get('params.recurring')) {
    $("#is_recurring").val(Session.get('params.recurring'));
  }
});

