Charges._ensureIndex({'id': 1}, {background: true});

Customers._ensureIndex({'id': 1}, {background: true});

Devices._ensureIndex({'id': 1}, {background: true});

Donations._ensureIndex({'customer_id': 1}, {background: true});

DT_donations._ensureIndex({'persona_id': 1}, {background: true});

DT_donations._ensureIndex({'transaction_id': 1}, {background: true});

DT_funds._ensureIndex({'name': 1}, {background: true});

Invoices._ensureIndex({'id': 1}, {background: true});

MultiConfig._ensureIndex({'id': 1}, {backgrond: true});

Subscriptions._ensureIndex({'id': 1}, {background: true});

