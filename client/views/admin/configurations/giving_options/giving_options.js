/*****************************************************************************/
/* GivingOptions: Event Handlers */
/*****************************************************************************/
Template.GivingOptions.events({
});

/*****************************************************************************/
/* GivingOptions: Helpers */
/*****************************************************************************/
Template.GivingOptions.helpers({
  multi_config: function () {
    var menu_items = MultiConfig.find( {}, {
      sort:      { order: 1 }
    } );

    /*menu_items.forEach( function (value) {
      value.
    });*/

    return menu_items;
  },
  all_items: function () {
    var self = this;
    console.log(self);
    return [self];
  }
});

/*****************************************************************************/
/* GivingOptions: Lifecycle Hooks */
/*****************************************************************************/
Template.GivingOptions.onCreated(function () {
});

Template.GivingOptions.onRendered(function () {
});

Template.GivingOptions.onDestroyed(function () {
});
