


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
          console.log(optgroupName);
          var insertHere = _.findWhere(arrayNames, {text: optgroupName});
          console.log(insertHere);
          insertHere.children.push({
            id: $(this).children('input').val(),
            text: $(this).children('input').attr('data-name')
          });
        } else {
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
  'click .checkbox': function(event) {
    event.preventDefault();
    console.log( $(event.target) );
    console.log( $(event.target).text() );
    $(event.target).radiocheck('toggle');

    var givingOptionsChecked;
    if($(event.target).is(":checked")){

      givingOptionsChecked = Session.get("givingOptionsChecked");
      givingOptionsChecked = _.extend([], givingOptionsChecked);
      givingOptionsChecked.push({
        "value": $(event.target).val(),
        "name": s( $(event.target).attr('data-name') ).trim().value()
      });
      Session.set("givingOptionsChecked", givingOptionsChecked);
      $( event.target ).closest('label').appendTo('#selectedGivingOptionsDiv');
    } else {
      givingOptionsChecked = Session.get("givingOptionsChecked");
      givingOptionsChecked = _.extend([], givingOptionsChecked);

      var newCheckedOptions = _.reject(givingOptionsChecked, function (element) {
        return element.value === $(event.target ).val();
      } );
      Session.set("givingOptionsChecked", newCheckedOptions);
      $( event.target ).closest('label').appendTo('#givingOptionsDiv');
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

  function insertCheckbox(el) {var content = '<label for="' + el.id + '" class="checkbox" >';
    content += '<input type="checkbox" data-toggle="checkbox" value="' + el.id + '" id="' + el.id + '" class="sortable ui-sortable custom-checkbox" data-name="' + el.text + '">  ' + el.text;
    content += '<\/label>';
    $( content ).appendTo( $('#selectedGivingOptionsDiv') );
  }

  var temp1 = [
    {
      "id": "60463",
      "text": "BaseCamp - Brett Durbin"
    },
    {
      "id": "60464",
      "text": "BaseCamp - Jon DeMeo"
    },
    {
      "text": "Test",
      "children": [
        {
          "id": "60465",
          "text": "BaseCamp - Shelley Setchell"
        },
        {
          "id": "60480",
          "text": "BaseCamp - John Kazaklis"
        }
      ]
    },
    {
      "text": "Test1",
      "children": [
        {
          "id": "60489",
          "text": "Int'l Field Projects - Honduras"
        },
        {
          "id": "63656",
          "text": "BaseCamp"
        }
      ]
    },
    {
      "text": "Test2",
      "children": [
        {
          "id": "63656",
          "text": "BaseCamp"
        }
      ]
    },
    {
      "text": "Test3",
      "children": [
        {
          "id": "60489",
          "text": "Int'l Field Projects - Honduras"
        }
      ]
    }
  ];

  $('#testDropdown').select2({
    data: temp1,
    dropdownCssClass: 'dropdown-inverse'
  });

  var insertDiv = $('#selectedGivingOptionsDiv');
  temp1.forEach(function(value) {
    console.log(value)
    if(value.children) {
      console.log("Got Parent");
      console.log(value.text);
      var content= "";
      content += "<input class='form-control slim-borders groupName' value='" + value.text + "'>";
      $( content ).appendTo( insertDiv );
      value.children.forEach(function (el) {
        insertCheckbox(el);
      })
    } else {
      insertCheckbox(value);
    }
  });


  $(':checkbox').radiocheck();

  Session.set("givingOptionsChecked", temp1);

});

Template.GivingOptions.onDestroyed(function () {
});
