function insertCheckbox(el, insertDiv, checked) {
  var content = '<div class="checkbox select-options form-control" >';
  content += '<input type="checkbox" value="' + el.id + '" id="' + el.id + '" class="sortable ui-sortable" data-name="' + el.text + '">  <span contenteditable="true">' + el.text + '<\/span>';
  content += '<i class="fa fa-arrows fa-fw fa-pull-right"><\/i>';
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
    handle: '.fa-arrows',
    helper: function (e, li) {
      this.copyHelper = li.clone().insertAfter(li);
      $(this).data('copied', false);
      return li.clone();
    },
    start: function( event, ui ) {
      clone = $(ui.item[0].outerHTML).clone();
    },
    placeholder: {
      element: function(clone) {
        return $('<div class="sorting checkbox">'+clone[0].innerHTML+'</li>');
      },
      update: function() {
        return;
      }
    },
    stop: function () {
      var copied = $(this).data('copied');
      if (!copied) {
        this.copyHelper.remove();
      }
      this.copyHelper = null;
    },
    receive: function ( e, ui ) {
      ui.sender.data('copied', true);
      sortableIn = 1;
    },
    over: function( e, ui ) {
      sortableIn = 1;
      $('.sorting' ).removeClass("out-sortable");
    },
    out: function( e, ui ) {
      sortableIn = 0;
      $('.sorting' ).addClass("out-sortable");
    },
    beforeStop: function( e, ui ) {
      var self = ui.item[0];
      if ( sortableIn === 0 ) {
        if( $( self ).hasClass( 'checkbox' ) ){
          var el = {
            id: $( self ).find( 'input' ).val(),
            text: $( self ).find( 'input' ).attr( 'data-name' )
          };
          insertCheckbox(el, 'givingOptionsDiv', false);
        }
        ui.item.remove();
      }
    },
    cancel: ".disable-sort"
  });
}

/*****************************************************************************/
/* GivingOptions: Event Handlers */
/*****************************************************************************/
Template.GivingOptions.events({
  'click #addGroupButton': function () {
    var content= "<div class='input-group margin-bottom-sm select-group'>";
    content += "<input type='text' class='form-control slim-borders group-name' placeholder='Group name'>";
    content += '<span class="input-group-addon"><i class="fa fa-arrows fa-fw fa-pull-right"><\/i><\/span>';
    content += "<\/div>";
    $( content ).appendTo('#selectedGivingOptionsDiv');
  },
  'click #updateDropdown': function () {
    console.log("Saving");

    var group = $('#selectedGivingOptionsDiv').children();
    var arrayNames = [];
    var givingOptionsSelectedIDs = [];

    // Empty the select list
    $( '#testDropdown' ).empty();

    var optgroupName = 0;

    group.each(function () {
      if( $(this).children('input[type="checkbox"]').val() ) {
        if( optgroupName !== 0 ){
          givingOptionsSelectedIDs.push($(this).children('input').val());
          var insertHere = _.findWhere(arrayNames, {text: optgroupName});
          console.log($(this).children('input')[0].nextSibling.nextSibling.innerText);
          insertHere.children.push({
            id: $(this).children('input').val(),
            text: $(this).children('input')[0].nextSibling.nextSibling.innerText
          });

        } else {
          givingOptionsSelectedIDs.push($(this).children('input').val());
          console.log($(this).children('input').val());

          arrayNames.push({
            id: $(this).children('input').val(),
            text: $(this).children('input')[0].nextSibling.nextSibling.innerText
          });
        }
      } else {
        optgroupName = $(this).children('input').val();
        if (optgroupName) {
          console.log( $(this).children('input').val() );
          console.log( $(this).children('input').parent().next('div').hasClass("checkbox") );
          if (!$(this).children('input').parent().next('div').hasClass("checkbox")) {
            Bert.alert({
              message: "You need something under each group",
              type: 'danger',
              icon: 'fa-frown-o',
              style: 'growl-top-right'
            });
            throw new Meteor.Error("400", "That won't work, you need something under your group");
          }
          arrayNames.push({
            text: $(this).children('input').val(),
            children: []
          });
        } else {
          Bert.alert({
            message: "Can't have a blank group name",
            type: 'danger',
            icon: 'fa-frown-o',
            style: 'growl-top-right'
          });
          throw new Meteor.Error("400", "Can't have a blank group name");
        }

      }
    });
    console.log(arrayNames);
    console.log(givingOptionsSelectedIDs);

    Meteor.call("update_donation_options", arrayNames, givingOptionsSelectedIDs, function (err){
      if(err){
        Bert.alert({
          message: error,
          type: 'danger',
          icon: 'fa-frown-o',
          style: 'growl-top-right'
        });
      } else {
        Bert.alert({
          message: "Updated",
          type: 'success',
          icon: 'fa-smile-o',
          style: 'growl-top-left'
        });
        // With DD-Slick the operation against the select lists are destructive
        // So we need to reload the page in order to get the new version of these lists
        location.reload();
      }
    });

    $('#testDropdown').select2( {
      data: arrayNames
    });

    // TODO: when unchecking, the items should go back to their alphabetic place in the list on the left
  },
  'click :checkbox': function(event) {
    event.preventDefault();
    var self = $(event.target).closest('div');

    var givingOptionsChecked;
    if(!$(event.target).is(":checked")){
      console.log("Unchecked");
      givingOptionsChecked = Session.get("givingOptionsChecked");
      givingOptionsChecked = _.extend([], givingOptionsChecked);

      var newCheckedOptions = _.reject(givingOptionsChecked, function (element) {
        return element.value === $(event.target ).val();
      } );
      $( event.target ).closest('div').remove();
      Session.set("givingOptionsChecked", newCheckedOptions);
      var el = {
        id: $(event.target).val(),
        text: $(event.target).attr('data-name')
      };
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
    let orgDoc = MultiConfig.findOne({"organization_info.web.domain_name": Meteor.settings.public.org_domain});
    let selectedGivingOptions = orgDoc ? orgDoc.SelectedIDs : null;
    if( selectedGivingOptions ) {
      return DT_funds.find({'id': {$nin: selectedGivingOptions}}, {sort: { name: 1 } });
    }
    return DT_funds.find({}, {sort: { name: 1 } });
  },
  options: function () {
    return MultiConfig.findOne() && MultiConfig.findOne().DonationOptions;
  },
  opt_group: function () {
    return MultiConfig.findOne() && MultiConfig.findOne().DonationOptions;
  }
});


/*****************************************************************************/
/* GivingOptions: Lifecycle Hooks */
/*****************************************************************************/
Template.GivingOptions.onCreated(function () {
  //TODO: uncomment this for production -> Meteor.call("get_dt_funds");
});

Template.GivingOptions.onRendered(function () {

  // Start the function to setup the table connections and make them sortable
  sortableFunction();

  //var MultiConfigAllOptions = MultiConfig.findOne().GivingOptions;
  var temp1 = MultiConfig.findOne() && MultiConfig.findOne().DonationOptions;

  console.log(temp1);
  temp1[0].children[0].selected = 'selected';
  if(temp1){
    $('#testDropdown').select2({
      data: temp1,
      dropdownCssClass: 'dropdown-inverse',
      placeholder: "Choose one"
    });
    $("#testDropdown").select2('val',temp1[0].id);


    var insertDiv = $('#selectedGivingOptionsDiv');
    temp1.forEach(function(value) {
      if (value.children) {
        var content= "<div class='input-group margin-bottom-sm select-group'>" +
        "<input type='text' class='form-control slim-borders group-name' value='" + value.text + "'>" +
        '<span class="input-group-addon"><i class="fa fa-arrows fa-fw"><\/i><\/span>' +
        "<\/dvi>";
        $( content ).appendTo( insertDiv );
        value.children.forEach(function (el) {
          insertCheckbox(el, 'selectedGivingOptionsDiv', true);
        });
      } else {
        insertCheckbox(value, 'selectedGivingOptionsDiv', true);
      }
    });

    Session.set("givingOptionsChecked", temp1);

    // Setup the DD-Slick version of the individual select elements
    temp1.forEach(function(val){
      let itemName = 'testSelect' + val.text;
      $("select[data-dt-name='" + itemName + "']").ddslick();
    });

    $("select[data-dt-name='testSelectMain']").ddslick();
  }

});
