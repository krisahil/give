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
    let charge = Charges.findOne({_id: this.source});
    return Customers.findOne({_id: charge.customer});
  },
  charges: function () {
    return Charges.findOne({_id: this.source});
  },
  name: function () {
    if(this.metadata.business_name){
      return this.metadata.business_name;
    } else {
      return this.metadata.fname + " " + this.metadata.lname;
    }
  },
  ach_or_card: function () {
    if(this.source.object === 'bank_account'){
      return "ACH";
    } else {
      return "Card"
    }
  },
  fees_covered: function () {
    if(this.metadata.coveredTheFees === 'false' || !this.metadata.coveredTheFees) {
      return '';
    } else {
      return 'checked';
    }
  },
  total_fees: function () {
    // TODO: need to probably write a method call that gets each of the charges associated with this transfer,
    // then totals them and sends that total back here. Or, you could do this when the
    // transfer is inserted into the collection and then put that total into the metadata of the transfer
    let transactions = Transactions.find().fetch();
    let total = 0;
    transactions.forEach(function (each_transactions){
      total += each_transactions.fee;
    });
    return total;
  },
  dt_source: function () {
    if(this.metadata.dt_source) {
      return DT_sources.findOne( { _id: this.metadata.dt_source } ).name;
    } else {
      return;
    }
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
