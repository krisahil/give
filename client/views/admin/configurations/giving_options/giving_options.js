
function insertCheckbox(el, insertDiv, checked) {var content = '<div class="checkbox" >';
  content += '<input type="checkbox" value="' + el.id + '" id="' + el.id + '" class="sortable ui-sortable" data-name="' + el.text + '">  ' + el.text;
  content += '<\/div>';
  $( content ).appendTo( $('#' + insertDiv) );
  if(checked) {
    $('#' + el.id).prop('checked', true);
  }
}

function sortableFunction () {
  $(".sortable").sortable({
    cursor: 'move',
    dropOnEmpty: true,
    forceHelperSize: true,
    forcePlaceholderSize: true,
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

    var content= "";
    content += "<input class='form-control slim-borders groupName' placeholder='Group name'>";
    content += "<\/input>";

    $( content ).appendTo('#selectedGivingOptionsDiv');
  },
  'click #updateDropdown': function () {
    console.log("saving");

    var group = $('#selectedGivingOptionsDiv').children();
    var arrayNames = [];
    var givingOptionsSelectedIDs = [];

    // Empty the select list
    //$( '#testDropdown' ).empty();

    var optgroupName = 0;

    group.each(function (el) {
      console.log($(this).children('input').val());
      }
    );

    group.each(function () {
      if( $(this).children('input').val() ) {
        console.log("Val: " + $(this).children('input').val());
        if( optgroupName !== 0 ){
          givingOptionsSelectedIDs.push($(this).children('input').val());
          console.log(optgroupName);
          var insertHere = _.findWhere(arrayNames, {text: optgroupName});
          console.log(insertHere);
          insertHere.children.push({
            id: $(this).children('input').val(),
            text: $(this).children('input').attr('data-name')
          });
        } else {
          givingOptionsSelectedIDs.push($(this).children('input').val());
          arrayNames.push({
            id: $(this).children('input').val(),
            text: $(this).children('input').attr('data-name')
          });
        }
      } else {
        console.log($(this).val());
        optgroupName = $(this).val();
        arrayNames.push({
          text: $(this).val(),
          children: []
        });
      }
    });

    MultiConfig.update({_id: 'trashmountain.com'}, {$set: {"GivingOptions": arrayNames, "GivingOptionsSelectedIDs": givingOptionsSelectedIDs}});

    $('#testDropdown' ).select2( {
      data:        arrayNames,
      placeholder: "Select an option"
    });
    console.log(arrayNames);

    // TODO: rewrite all of this to just update the session object
    // TODO: have iron router load the session object up with the previously saved value from the giving options collection or config collection


    // TODO: don't show the source on the left column if it is already loaded into the list

    // TODO: when unchecking, the items should go back to their alphabetic place in the list on the left
  },
  'click :checkbox': function(event) {
    event.preventDefault();
    console.log( $(event.target).is(":checked") );
    console.log( $(event.target).val() );
var self = $(event.target).closest('div');
//var selfDiv = $(event.target).closest('div');

    var givingOptionsChecked;
    if(!$(event.target).is(":checked")){
      givingOptionsChecked = Session.get("givingOptionsChecked");
      givingOptionsChecked = _.extend([], givingOptionsChecked);

      var newCheckedOptions = _.reject(givingOptionsChecked, function (element) {
        return element.value === $(event.target ).val();
      } );
      $( event.target ).closest('div').remove();
      Session.set("givingOptionsChecked", newCheckedOptions);
      var el = {id: $(event.target).val(), text: $(event.target).attr('data-name')};
      insertCheckbox( el, 'givingOptionsDiv', false );
    } else {
      givingOptionsChecked = Session.get("givingOptionsChecked");
      givingOptionsChecked = _.extend([], givingOptionsChecked);
      givingOptionsChecked.push({
        "value": $(event.target).val(),
        "name": s( $(event.target).attr('data-name') ).trim().value()
      });
      $( event.target ).closest('div').remove();
      Session.set("givingOptionsChecked", givingOptionsChecked);
      var el = {id: $(event.target).val(), text: $(event.target).attr('data-name')};
      insertCheckbox( el, 'selectedGivingOptionsDiv', true);
    }

  }
});

/*****************************************************************************/
/* GivingOptions: Helpers */
/*****************************************************************************/
Template.GivingOptions.helpers({
  dt_funds: function () {
    var selectedGivingOptions = MultiConfig.findOne( {_id: 'trashmountain.com' } ).GivingOptionsSelectedIDs;
    return DT_funds.find({'id': {$nin: selectedGivingOptions}});
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

  var MultiConfigAllOptions = MultiConfig.findOne( {} ).GivingOptions;
  var temp1 = MultiConfig.findOne( {} ).GivingOptions;

  $('#testDropdown').select2({
    data: temp1,
    dropdownCssClass: 'dropdown-inverse'
  });

  var insertDiv = $('#selectedGivingOptionsDiv');
  temp1.forEach(function(value) {
    console.log(value);
    if(value.children) {
      console.log("Got Parent");
      console.log(value.text);
      var content= "";
      content += "<input class='form-control slim-borders groupName' value='" + value.text + "'>";
      $( content ).appendTo( insertDiv );
      value.children.forEach(function (el) {
        insertCheckbox(el, 'selectedGivingOptionsDiv', true);
      })
    } else {
      insertCheckbox(value, 'selectedGivingOptionsDiv', true);
    }
  });

  Session.set("givingOptionsChecked", temp1);

});

Template.GivingOptions.onDestroyed(function () {
});
