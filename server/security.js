// meteor-security ongoworks allow/deny rules
Security.permit(['insert', 'update', 'remove'])
  .collections(
  [
    AllErrors,
    Audit_trail,
    BankAccounts,
    Charges,
    Config,
    Customers,
    Devices,
    Donate,
    Donations,
    DT_splits,
    DT_donations,
    DT_funds,
    DT_sources,
    Fundraisers,
    Invoices,
    Config,
    Payments,
    Refunds,
    Subscriptions,
    Transactions,
    Transfers,
    Uploads
  ])
  .ifHasRole('admin')
  .apply();

Trips.permit('update').ownsDocument('fundAdmin').apply();

Security.defineMethod('ownsDocument', {
  fetch: [],
  allow(type, field, userId, doc) {
    if (!field) field = 'userId';
    return userId === doc[field];
  }
});

