/*****************************************************************************/
/* StripeTransfers: Event Handlers */
/*****************************************************************************/
Template.StripeTransfers.events({
  'click .clickable_row': function(){
    Router.go('/transfers/' + this.id);
  }
});

/*****************************************************************************/
/* StripeTransfers: Helpers */
/*****************************************************************************/
Template.StripeTransfers.helpers({
  transfer: function () {
    return Transfers.find( {}, {
      sort: { date: -1 }
    } );
  },
  transfer_date: function () {
    let timestamp = this.date;
    return moment.utc(timestamp, 'X').format("MMMM Do, YYYY");
  },
  monthRange: function () {
    if(Session.get("transferRange")) {
      let transferRange = Session.get( "transferRange" );
      let transferStart = transferRange.start;
      let transferEnd = transferRange.end;

      transferStart = moment( transferStart ).format( "MM/DD/YYYY" );
      transferEnd = moment( transferEnd ).format( "MM/DD/YYYY" );

      let today = transferStart + " - " + transferEnd;
      return today;
    }
  },
  redText: function () {
    if(this.status && this.status === 'in_transit') {
      return 'orange-text';
    }
  }
});

/*****************************************************************************/
/* StripeTransfers: Lifecycle Hooks */
/*****************************************************************************/
Template.StripeTransfers.onCreated(function () {

  // Setup the range for this month if no previous session is set for "transferRange"
  if(!Session.get("transferRange")){
    Session.setDefault("transferRange", {start: moment().startOf('month').format("YYYY-MM-DD"), end: moment().endOf("month").format("YYYY-MM-DD")});
  }
  let self = this;

  // Use self.subscribe with the data context reactively
  self.autorun(function () {
    let transferRange = Session.get("transferRange");
    self.subscribe("transfersRange", transferRange);
  });
});

Template.StripeTransfers.onRendered(function () {

  $('input[name="daterange"]').daterangepicker({
    ranges: {
      'All Time': [moment().subtract(10, 'years').startOf('month'), moment().endOf('year')],
      'Today': [moment(), moment()],
      'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
      'Last 7 Days': [moment().subtract(6, 'days'), moment()],
      'Last 30 Days': [moment().subtract(29, 'days'), moment()],
      'This Month': [moment().startOf('month'), moment().endOf('month')],
      'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
    }
  });

  $('input[name="daterange"]').on('apply.daterangepicker', function(ev, picker) {
    Session.set( "transferRange", {start: picker.startDate.format('YYYY-MM-DD'), end: picker.endDate.format('YYYY-MM-DD')} );
  });
});