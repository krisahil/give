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
    return DT_sources.find();
  },
  serve1000SourceName: function () {
    var regServe1000 = /^Serve\s1000\s-\s/;
    var nameReplaced = this.name.replace(regServe1000, "")
    return nameReplaced;
  },
  sourceId: function () {
    return this.id;
  }
});

Template.Modals.onRendered(function() {
  $('select').select2({dropdownCssClass: 'dropdown-inverse'});
  $("#options").select2('destroy');

  $('#options').chosen({width: "95%"});

});
