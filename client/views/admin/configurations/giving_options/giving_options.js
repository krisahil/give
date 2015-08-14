function updateSelect(e, ui) {
  console.log("Updated");

  $('#appendTablesHere table').each( function ( ) {

    console.log($(this));

    var thisGroupCaptionID = $( this ).attr('id');

    console.log($(thisGroupCaptionID ).caption());

    var thisOptGroup = $('#testDropdown').find('optgroup[data-id="' + thisGroupCaptionID + '"]' );

    if(thisOptGroup){
      console.log(thisOptGroup);

      $('#testDropdown').find('optGroup[label="'+ thisOptGroup + '"' ).children().remove();

      var colArray = [];
      var tableColumn = $(this).find('tr:not(:first) td:nth-child(2)');
      console.log( $( tableColumn[0] ) );
      var nextGroupID = 'test';

      _.forEach(tableColumn, function(value){
        colArray.push($(value).text());
        $('#testDropdown').append('<option value="' + $(value).text() + '">' + $(value).text() + '</option>');
      });
      $('#testDropdown').append('<optgroup data-id="' + nextGroupID + '' +
        '" label="Group name (click me to edit)">');
    }

  });

}


function sortableFunction () {
  $(".sortableTables").sortable({
    items: 'tr:not(:first)',
    cursor: 'move',
    handle: '.glyphicon-move',
    stack : '#set tr',
    dropOnEmpty: true,
    forceHelperSize: true,
    forcePlaceholderSize: true,
    connectWith: ".sortableTables",
    update: function ( e, ui ) {
      console.log( $(this).attr('id') );
      if( $(this).attr('id') === "DTFundsTable" || $(this).attr('id') == undefined) {
        console.log( $(this).attr('id') );
        return;
      } else {
        console.log( $(this).attr('id') );
        updateSelect (e, ui);
      }
    },
    helper: function (e, li) {
      this.copyHelper = li.clone().insertAfter(li);

      $(this).data('copied', false);

      return li.clone();
    },
    stop: function () {

      var copied = $(this).data('copied');

      if (!copied) {
        this.copyHelper.remove();
      }

      this.copyHelper = null;
    },
    receive: function (e, ui) {
      ui.sender.data('copied', true);
      sortableIn = 1;
    },
    over: function(e, ui) {
      sortableIn = 1;
    },
    out: function(e, ui) {
      sortableIn = 0;
    },
    beforeStop: function(e, ui) {
      if (sortableIn === 0 && $(this).attr('id') !== "DTFundsTable") {
        ui.item.remove();
      }
    }

  });
}

/*****************************************************************************/
/* GivingOptions: Event Handlers */
/*****************************************************************************/
Template.GivingOptions.events({
  'click #addGroupButton': function () {
    var lastTableID, nextID, lastGroupID, nextGroupID;

    console.log( "Got to addGroupButton Click" );
    lastTableID = $( '#appendTablesHere table:last' ).attr( 'id' );
    lastGroupID = $( '#appendTablesHere table:last caption' ).attr( 'id' );
    nextID = lastTableID .replace(/(\d+)+/g, function(match, number) {
      return parseInt(number)+1;
    });

    nextGroupID = lastGroupID .replace(/(\d+)+/g, function(match, number) {
      return parseInt(number)+1;
    });


    console.log(nextID);

    var content="";
    content += '<section>';
    content += '<table id="' + nextID + '" class="rwd-table sortableTables">';
    content += '<caption contenteditable class="groupName" id="' + nextGroupID +'"';
    content += "groupCaption1\">Group name (click me to edit)<\/caption>";
    content += "<tr>";
    content += "<th><span class=\"glyphicon glyphicon-minus-sign\" aria-hidden=\"true\"><\/span> Delete";
    content += "<\/th>";
    content += "<th>Fund Name<\/th>";
    content += "<th>Donor Tools ID<\/th>";
    content += "<\/tr>";
    content += "<tr id=\"63661\" data-name=\"Where Most Needed\">";
    content += "<td><span class=\"glyphicon glyphicon-move\" aria-hidden=\"true\"><\/span><\/td>";
    content += "<td class=\"table-editable-content\" contenteditable data-th=\"Name\">Where Most Needed<\/td>";
    content += "<td class=\"table-editable-content\" contenteditable data-th=\"Donor Tools ID\">63661<\/td>";
    content += "<\/tr>";
    content += "<\/table>";
    content += "<\/section>";

    $( '#appendTablesHere' ).append( content );
    sortableFunction ();

    $('#testDropdown').append('<optgroup data-id="' + nextGroupID + '' +
      '" label="Group name (click me to edit)">\n<option>Where Most Needed</option>\n</optgroup>');
  },
  'blur .groupName': function ( e ) {
    console.log($( e.target ).text());
    var thisGroupID = $( e.target ).attr('id');
    var newLabel = $( e.target ).text();


    $('#testDropdown').find('optgroup[data-id="' + thisGroupID + '"]' ).attr('label', newLabel);
    $('#testDropdown').change();
  },
  'click .groupName': function ( e ) {

    var thisGroupID = $( e.target ).attr('id');

    if($( e.target ).text() === 'Group name (click me to edit)'){
      $( e.target ).text('');
    }
    else {
    }


  }
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
    return menu_items;
  }
});


/*****************************************************************************/
/* GivingOptions: Lifecycle Hooks */
/*****************************************************************************/
Template.GivingOptions.onCreated(function () {
});

Template.GivingOptions.onRendered(function () {

  // Start the function to setup the table connections and make them sortable
  sortableFunction ();

  $('#testDropdown').select2({dropdownCssClass: 'dropdown-inverse'});

});

Template.GivingOptions.onDestroyed(function () {
});
