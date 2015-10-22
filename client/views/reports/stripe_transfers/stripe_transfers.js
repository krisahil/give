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
    return Transfers.find();
  },
  transfer_date: function () {
    let timestamp = this.date;
    return moment.utc(timestamp, 'X').format("MMMM Do, YYYY");
  }
});

/*****************************************************************************/
/* StripeTransfers: Lifecycle Hooks */
/*****************************************************************************/
Template.StripeTransfers.onCreated(function () {
});

Template.StripeTransfers.onRendered(function () {
});

Template.StripeTransfers.onDestroyed(function () {
});
