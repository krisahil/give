function updateSelect(e, ui) {
  console.log("received");
  console.log(ui.item);
  console.log(ui.item[0].id);

  var myTable = $( e.target );
  var colArray = [];
  var tableColumn = myTable.find('tr:not(:first) td:nth-child(2)');

  $('#testDropdown')
    .find('option')
    .remove()
    .end();

  _.forEach(tableColumn, function(value){
    colArray.push($(value).text());
    $('#testDropdown').append('<option value="' + $(value).text() + '">' + $(value).text() + '</option>');
  });

  console.log( colArray );
}

/*****************************************************************************/
/* GivingOptions: Event Handlers */
/*****************************************************************************/
Template.GivingOptions.events({
});

/*****************************************************************************/
/* GivingOptions: Helpers */
/*****************************************************************************/
Template.GivingOptions.helpers({
  dt_funds: function () {
    return DT_funds.find();
  },
  multi_config: function () {
    var menu_items = MultiConfig.find( {}, {
      sort: {
        order: 1
      }
    } );

    /*menu_items.forEach( function (value) {
      value.
    });*/

    return menu_items;
  }
});
Template.GivingOptions.events({
});


/*****************************************************************************/
/* GivingOptions: Lifecycle Hooks */
/*****************************************************************************/
Template.GivingOptions.onCreated(function () {
});

Template.GivingOptions.onRendered(function () {

  // TODO: make sure that the select element doesn't pull in the changes when
  // an item is moved into the DT_funds list
  $(".sortableTables").sortable({
    items: 'tr:not(:first)',
    cursor: 'move',
    handle: '.glyphicon-move',
    stack : '#set tr',
    dropOnEmpty: true,
    forceHelperSize: true,
    forcePlaceholderSize: true,
    connectWith: ".sortableTables",
    receive: function ( e, ui ) {
      updateSelect (e, ui);
    },
    update: function ( e, ui ) {
      updateSelect (e, ui);
    }
  });

  $('#testDropdown').select2({dropdownCssClass: 'dropdown-inverse', open: true});

});

Template.GivingOptions.onDestroyed(function () {
});
