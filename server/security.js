// meteor-security ongoworks allow/deny rules

Security.permit(['insert', 'update', 'remove'])
    .collections(
    [
        AllErrors,
        Audit_trail,
        Books,
        Charges,
        Customers,
        Devices,
        Donate,
        Donations,
        DT_donations,
        DT_funds,
        DT_sources,
        Invoices,
        MultiConfig,
        Payments,
        Subscriptions
    ])
    .ifHasRole('admin')
    .apply();