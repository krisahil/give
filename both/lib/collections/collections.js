AllErrors = new Mongo.Collection('allerrors');

Audit_trail = new Mongo.Collection('audit_trail');

BankAccounts = new Mongo.Collection('bankAccounts');

Charges = new Mongo.Collection('charges');

// Organization configuration
Config = new Mongo.Collection('config');

Config.after.update(function (userId, doc, fieldNames, modifier, options) {
  if (fieldNames.indexOf("Stripe") !== -1 || fieldNames.indexOf("DonorTools") !== -1){
    if(this.previous.Stripe.ach_verification_type !==
      doc.Stripe.ach_verification_type ||
      this.previous.Stripe.keys_publishable !==
      doc.Stripe.keys_publishable ||
      this.previous.Stripe.keys_secret !==
      doc.Stripe.keys_secret ||
      this.previous.DonorTools.url !==
      doc.DonorTools.url ||
      this.previous.DonorTools.username !==
      doc.DonorTools.username ||
      this.previous.DonorTools.password !==
      doc.DonorTools.password
    ) {
      // TODO: send email letting the admins know that one of these settings were changed
    }
  }
}, {fetchPrevious: true});

Customers = new Mongo.Collection('customers');

Devices = new Mongo.Collection('devices');

Donate = new Mongo.Collection('donate');

Donations = new Mongo.Collection('donations');

DT_splits = new Mongo.Collection('dt_splits');

DT_donations = new Mongo.Collection('dt_donations');

DT_funds = new Mongo.Collection('dt_funds');

DT_sources = new Mongo.Collection('dt_sources');

Invoices = new Mongo.Collection('invoices');

Payments = new Mongo.Collection('payments');

Refunds = new Mongo.Collection('refunds');

Subscriptions = new Mongo.Collection('subscriptions');

// Used to collect Stripe transactions for the transfer reports
Transactions = new Mongo.Collection('transactions');

// Used to collect Stripe transfers
Transfers = new Mongo.Collection('transfers');

// Uploads, used for admin file uploading
Uploads = new Mongo.Collection('uploads');
