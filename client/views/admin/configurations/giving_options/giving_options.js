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
  }
});

/*****************************************************************************/
/* GivingOptions: Lifecycle Hooks */
/*****************************************************************************/
Template.GivingOptions.onCreated(function () {
});

Template.GivingOptions.onRendered(function () {
  $( "#sortable1, #sortable2, #sortable3, #sortable4" ).sortable({
    connectWith: ".connectedSortable",
    cursor: "move"
  }).disableSelection();
});

Template.GivingOptions.onDestroyed(function () {
});
