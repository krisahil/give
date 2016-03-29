Template.ACH.onRendered(function() {
  this.autorun(() => {
    this.subscribe("ach");
  });
});

Template.ACH.helpers({
  'bankAccounts': function() {
    return BankAccounts.find();
  },
  'ifRecurringSelectedText': function () {
    // TODO: if this is a recurring gift return the below text
    return 'selected-row';
  },
  'pendingSetup': function () {
    // TODO: if this is a gift that hasn't been setup manually yet return true
    return true;
  },
  'donorName': function() {
    return 'name';
  },
  'donationTo': function () {
    return 'to';
  },
  'donationAmount': function(){
    return 'amount';
  },
  'donationDate': function() {
    return 'date';
  },
  'donationStatus': function() {
    return 'status';
  }
});

Template.ACH.events({
  'click .pending-setup-checkbox': function() {
    // TODO: write the function for turning this pending setup into setup
    console.log("pending setup clicked");
  }
});
