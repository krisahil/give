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
        DT_donations,
        DT_funds,
        DT_sources,
        GivingOptions,
        Invoices,
        MultiConfig,
        Payments,
        Subscriptions
    ])
    .ifHasRole('admin')
    .apply();