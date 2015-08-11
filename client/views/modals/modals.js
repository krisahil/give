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
  thousandChildrenSourceName: function () {
    var regthousandChildren = /^1000\sChildren\s-\s2015\s-\s/;
    var nameReplaced = this.name.replace(regthousandChildren, "")
    return nameReplaced;
  },
  sourceId: function () {
    return this.id;
  }
});

Template.Modals.rendered = function() {
  $('select').select2({dropdownCssClass: 'dropdown-inverse'});
  $("#options").select2('destroy');

  $('#options').chosen({width: "95%"});

};
