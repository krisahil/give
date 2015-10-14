/*****************************************************************************/
/* StripeTransferDetails: Event Handlers */
/*****************************************************************************/
Template.StripeTransferDetails.events({
});

/*****************************************************************************/
/* StripeReports: Helpers */
/*****************************************************************************/
Template.StripeTransferDetails.helpers({
  transfer: function () {
    return Transfers.findOne();
  },
  transactions: function () {
    return Transactions.find();
  },
  customers: function () {
    return Customers.find();
  },
  charges: function () {
    return Charges.find();
  }
});

/*****************************************************************************/
/* StripeReports: Lifecycle Hooks */
/*****************************************************************************/
Template.StripeTransferDetails.onCreated(function () {
});

Template.StripeTransferDetails.onRendered(function () {
});

Template.StripeTransferDetails.onDestroyed(function () {
});
