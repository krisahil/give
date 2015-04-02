// meteor-security ongoworks allow/deny rules

Security.permit(['insert', 'update', 'remove'])
    .collections(
    [
        AllErrors,
        Audit_trail,
        Charges,
        Customers,
        Devices,
        Donations,
        DT_donations,
        DT_funds,
        Invoices,
        Subscriptions
    ])
    .ifHasRole('admin')
    .apply();