// meteor-security ongoworks allow/deny rules
Security.permit(['insert', 'update', 'remove'])
  .collections(
  [
    AllErrors,
    Audit_trail,
    Charges,
    Customers,
    Devices,
    Donate,
    Donations,
    DT_splits,
    DT_donations,
    DT_funds,
    DT_sources,
    Invoices,
    Config,
    Payments,
    Refunds,
    Subscriptions,
    Uploads
  ])
  .ifHasRole('admin')
  .apply();
