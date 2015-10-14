/*****************************************************************************/
/* StripeTransfers: Event Handlers */
/*****************************************************************************/
Template.StripeTransfers.events({
  'click .clickable_row': function(){
    console.log(this.id);
    Router.go('/transfers/' + this.id);
  }
});

/*****************************************************************************/
/* StripeTransfers: Helpers */
/*****************************************************************************/
Template.StripeTransfers.helpers({
  transfer: function () {
    return Transfers.find();
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
