AllErrors = new Mongo.Collection('allerrors');

Audit_trail = new Mongo.Collection('audit_trail');

Charges = new Mongo.Collection('charges');

Customers = new Mongo.Collection('customers');

Devices = new Mongo.Collection('devices');

Donate = new Mongo.Collection('donate');

Donations = new Mongo.Collection('donations');

DT_splits = new Mongo.Collection('dt_splits');

DT_donations = new Mongo.Collection('dt_donations');

DT_funds = new Mongo.Collection('dt_funds');

DT_sources = new Mongo.Collection('dt_sources');

Invoices = new Mongo.Collection('invoices');

// For Multi-tenancy
MultiConfig = new Mongo.Collection('multi_config');

Payments = new Mongo.Collection('payments');

Subscriptions = new Mongo.Collection('subscriptions');

// Used to collect Stripe transactions for the transfer reports
Transactions = new Mongo.Collection('transactions');

// Used to collect Stripe transfers
Transfers = new Mongo.Collection('transfers');
