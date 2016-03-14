App.helpers = {
};

_.each(App.helpers, function(helper, key) {
  UI.registerHelper(key, helper);
});

UI.registerHelper('contact_address', function() {
  return Meteor.settings.public.contact_address;
});

UI.registerHelper('support_address', function() {
  return Meteor.settings.public.support_address;
});

UI.registerHelper('canceled_gift_address', function() {
  return Meteor.settings.public.canceled_gift_address;
});

UI.registerHelper('bcc_address', function() {
  return Meteor.settings.public.bcc_address;
});

UI.registerHelper('large_gift_address', function() {
  return Meteor.settings.public.large_gift_address;
});

UI.registerHelper('org_name', function() {
  return Meteor.settings.public.org_name;
});

UI.registerHelper('org_street_address', function() {
  return Meteor.settings.public.org_street_address;
});

UI.registerHelper('org_city', function() {
  return Meteor.settings.public.org_city;
});

UI.registerHelper('org_state', function() {
  return Meteor.settings.public.org_state;
});

UI.registerHelper('org_state_short', function() {
  return Meteor.settings.public.org_state_short;
});

UI.registerHelper('org_zip', function() {
  return Meteor.settings.public.org_zip;
});

UI.registerHelper('org_phone', function() {
  return Meteor.settings.public.org_phone;
});

UI.registerHelper('org_ein', function() {
  return Meteor.settings.public.org_ein;
});

UI.registerHelper('org_is_501c3', function() {
  return Meteor.settings.public.org_is_501c3;
});
