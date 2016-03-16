function insertCheckbox(el, insertDiv, checked) {
  console.log(el);
  let fundDescription = el.description ? el.description : 'Description Here';
  var content = '<div class="checkbox select-options form-control" >' +
  '<input type="checkbox" value="' + el.id + '" id="' + el.id +
  '" class="sortable ui-sortable" data-el-text="' + el.text +
  '"data-description="' + fundDescription + '"><span class="right-side-stuff" data-el-id="' + el.id + '">' +
  '<i class="fa fa-arrows fa-fw fa-pull-right"></i>' +
  '</span><span contenteditable="true" data-el-text="' + el.text + '">' + el.text + '</span>' +
  '<br><span contenteditable="true">' + fundDescription + '</span>' +
  '</div>';
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
            text: $( self ).find( 'input' ).attr( 'data-el-text' ),
            description: $( self ).find( 'input' ).attr( 'data-description' )
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
  'click #updateDropdown': function (e) {
    e.preventDefault();
    console.log("Saving");

    var group = $('#selectedGivingOptionsDiv').children();
    var arrayNames = [];
    var givingOptionsSelectedIDs = [];

    // Empty the select list
    $( '#testDropdown' ).empty();

    var optgroupName = 0;

    let nameOfOption;
    let descriptionOfOption;

    group.each(function () {
      if( $(this).children('input[type="checkbox"]').val() ) {
        if( optgroupName !== 0 ){
          givingOptionsSelectedIDs.push($(this).children('input').val());
          var insertHere = _.findWhere(arrayNames, {text: optgroupName});
          nameOfOption = $(this).children("[contenteditable='true']")[0];
          descriptionOfOption = $(this).children("[contenteditable='true']")[1];

          console.log($(nameOfOption).text());
          console.log($(descriptionOfOption).text());
          insertHere.children.push({
            id: $(this).children('input').val(),
            text: $(nameOfOption).text(),
            description: $(descriptionOfOption).text()
          });

        } else {

          nameOfOption = $(this).children("[contenteditable='true']")[0];
          descriptionOfOption = $(this).children("[contenteditable='true']")[1];
          givingOptionsSelectedIDs.push($(this).children('input').val());
          console.log($(this).children('input').val());

          arrayNames.push({
            id: $(this).children('input').val(),
            text: $(nameOfOption).text(),
            description: $(descriptionOfOption).text()
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
        //location.reload();
      }
    });

    $('#testDropdown').select2( {
      data: arrayNames
    });

    // TODO: when unchecking, the items should go back to their alphabetic place in the list on the left
  },
  'keyup .editable-content': _.debounce(function(e){
    console.log($(e.currentTarget).text());
    //MultiConfig.update({})
  },500),
  'click :checkbox': function(event) {
    event.preventDefault();
    var self = $(event.target).closest('div');

    let dtId = $(event.target).val();

    let orgDocId = MultiConfig.findOne()._id;
    if(!$(event.target).is(":checked")) {
      MultiConfig.update({_id: orgDocId}, {$pull: {"donationOptions": {id: dtId}}});
    } else {
      MultiConfig.update({_id: orgDocId}, {$addToSet: {"donationOptions": {id: dtId}}});
    }

    //MultiConfig.update({_id: orgDocId}, {$pushToSet: {}});
    /*

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
            text: $(event.target).attr('data-el-text'),
            description: $(event.target).attr('data-description')
          };
          insertCheckbox( el, 'givingOptionsDiv', false );
        } else {
          givingOptionsChecked = Session.get("givingOptionsChecked");
          givingOptionsChecked = _.extend([], givingOptionsChecked);
          givingOptionsChecked.push({
            "value": $(event.target).val(),
            "name": s( $(event.target).attr('data-el-text') ).trim().value(),
            "description": s( $(event.target).attr('data-description') ).trim().value()
          });
          $( event.target ).closest('div').remove();
          Session.set("givingOptionsChecked", givingOptionsChecked);
          var el = {
            id: $(event.target).val(),
            text: $(event.target).attr('data-el-text'),
            description: $(event.target).attr('data-description')
          };
          var waitForInsert = insertCheckbox( el, 'selectedGivingOptionsDiv', true);

          // Insert the Upload template with Blaze.render inside of the input box
          let dtId = $(event.target).val();
          var nameOfOption = $("#" + dtId).parent().children(".right-side-stuff")[0];
          Blaze.render(Template.Upload, nameOfOption);
        }
    */


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
  imageExists: function () {
    let id = this.id;
    return Uploads.findOne({fundId: id});
  },
  imageSrc: function () {
    console.log(this);
    if (Uploads.findOne({fundId: this.id})) {
      return Uploads.findOne({fundId: this.id}).url;
    }
    return;
  }
});


/*****************************************************************************/
/* GivingOptions: Lifecycle Hooks */
/*****************************************************************************/
Template.GivingOptions.onCreated(function () {
  // TODO: remove this for production, use debounce and at least a 1 minute timer Meteor.call("get_dt_funds");
  let self = this;
  // Use self.subscribe with the data context reactively
  self.autorun(function () {
    self.subscribe("uploaded");
  });
});

Template.GivingOptions.onRendered(function () {

  // Start the function to setup the table connections and make them sortable
  sortableFunction();

  //var MultiConfigAllOptions = MultiConfig.findOne().GivingOptions;
  var temp1 = MultiConfig.findOne() && MultiConfig.findOne().DonationOptions;

  console.log(temp1);
  if(temp1 && temp1.length > 0){

    $('#testDropdown').select2({
      data: temp1,
      dropdownCssClass: 'dropdown-inverse',
      placeholder: "Choose one"
    });
    $("#testDropdown").select2('val',temp1[0].id);

    Session.set("givingOptionsChecked", temp1);

    // Setup the DD-Slick version of the individual select elements
    temp1.forEach(function(val){
      let itemName = 'testSelect' + val.text;
      $("select[data-dt-name='" + itemName + "']").ddslick();
    });

    if ($("select[data-dt-name='testSelectMain']")) {
      $("select[data-dt-name='testSelectMain']").ddslick();
    }
  }
});
