/*****************************************************************************/
/* Modals: Event Handlers and Helpersss .js*/
/*****************************************************************************/
Template.Modals.helpers({
  contact_address: function () {
    return Meteor.settings.public.contact_address;
  },
  support_address: function () {
    return Meteor.settings.public.support_address;
  },
  churchSources: function () {
    return [
      "New Community Christian Church Salina, KS",
      "The Heights Church Spokane, WA",
      "Topeka Bible Church Topeka, KS",
      "Fountain Springs Church Rapid City, SD",
      "Gracepoint Church Topeka, KS",
      "Gracepoint Church North Topeka, KS",
      "Western Hills Church Topeka, KS",
      "Fellowship Bible Church Topeka, KS",
      "Church On The Hill Dundee, FL",
      "Ridgepoint Church Winter Haven, FL",
      "A Mailer",
      "Other"
    ]
  }
});

Template.Modals.rendered = function() {
  $('select').select2({dropdownCssClass: 'dropdown-inverse'});
  $("#options").select2('destroy');

  $('#options').chosen({width: "95%"});

};
