function reorderItems() {
  let orderOfOptions = $("#selectedGivingOptionsDiv").sortable("toArray");
  let newOptionsOrder = [];

  let currentGroup;
  orderOfOptions.forEach(function(id, index) {
    let donationOptions = MultiConfig.findOne().donationOptions;
    let thisOption = _.map(donationOptions, function(item){
      if(item.type === 'group'){
        currentGroup = item.groupId;
      } else {
        item.currentGroup = currentGroup;
      }
      if (item.id === id || item.groupId === id){
        item.position = index;
        newOptionsOrder.push(item);
      }
    });
  });

  MultiConfig.update({_id: Session.get("configId")}, {
    $set: {
      donationOptions: newOptionsOrder
    }
  });
};

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
    start: function( e, ui ) {
      clone = $(ui.item[0].outerHTML).clone();
    },
    placeholder: {
      element: function(clone) {
        return $('<div class="row selected-options sortable-clone">'+clone[0].innerHTML+'</li>');
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
      if ( sortableIn === 0 ) {
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
    MultiConfig.update({_id: Session.get("configId")}, {
      $addToSet: {
        "donationOptions": {
          groupId: Random.id([8]),
          type: 'group',
          position: $(".selected-options").length
        }
      }
    });
  },
  'click #updateDropdown': function (e) {
    e.preventDefault();

    var group = MultiConfig.findOne().donationOptions;
    let elementPos;
    elementPos = _.filter( group, function(x) {
      if (x && !x.text) {
        return x.id ? x.id : x.groupId;
      }
    });

    if (elementPos && elementPos.length > 0) {
      elementPos.forEach( function ( item ) {

        if( item.id ) {
          Bert.alert( {
            message: "You have a blank value in an option, couldn't save",
            type:    'danger',
            icon:    'fa-frown-o',
            style:   'growl-top-right'
          } );
          // TODO: add a red background to this element to show them where they are missing text
        } else {
          Bert.alert( {
            message: "You have a blank value in a group, couldn't save",
            type:    'danger',
            icon:    'fa-frown-o',
            style:   'growl-top-right'
          } );
          // TODO: add a red background to this element to show them where they are missing text
        }
      } );
    } else {
      // Store this new order
      reorderItems();
      // TODO: remove this hack
      // hack, reload the page. I think there is a problem between the order of the elements from meteor and
      // the order that sortable has these in
      // without the reload the order isn't correct after the reorderItems() function is run
      location.reload();
    }
  },
  'keyup .editable-content': _.debounce(function(e){
    let text;
    let description;
    let id;

    if($(e.currentTarget).val()){
      text = $(e.currentTarget).val().toUpperCase();
      id = $(e.currentTarget).attr("data-el-id");
    } else {
      let type = $(e.currentTarget).attr("data-text-type");
      if (type === "text") {
        text = $(e.currentTarget).text();
      } else {
        description = $(e.currentTarget).text();
      }
      id = $(e.currentTarget).attr("data-el-id");
    }

    // Store all the current options
    let configOptions = MultiConfig.findOne() && MultiConfig.findOne().donationOptions;
    // Find the indexOf this particular option
    let elementPos = configOptions.map(function(x) {return x.id ? x.id : x.groupId; }).indexOf(id);
    // Update the matching object
    if (text) {
      configOptions[elementPos].text = text;
    } else if (description) {
      configOptions[elementPos].description = description;
    } else {
      configOptions[elementPos].text = text;
    }
    // Store the new version of the configOptions
    MultiConfig.update({_id: Session.get("configId")}, {
      $set: {
        donationOptions: configOptions
      }
    });
  },500),
  'click .remove-item': function(e) {
    e.preventDefault();
    let dtId = $(e.currentTarget).attr('data-el-id');

    if(!dtId){
      Bert.alert({
        message: "Couldn't remove that item. Please save and reload the page",
        type: 'danger',
        icon: 'fa-frown-o',
        style: 'growl-top-right'
      });
      throw new Meteor.Error("400", "Something went wrong, there is no id on this element.");
    }
    let updateOperator = dtId.length === 8 ? {groupId: dtId} : {id: dtId};

    MultiConfig.update({_id: Session.get("configId")}, {
      $pull: {
        "donationOptions": updateOperator
      }
    });

    // Now that we have removed an item we need to update the positions of the
    // remaining options
    reorderItems();
  },
  'click :checkbox': function(e) {
    e.preventDefault();
    let dtId = $(e.target).val();

    MultiConfig.update({_id: Session.get("configId")}, {
      $addToSet: {
        "donationOptions": {
          id: dtId,
          text: $(e.target).attr('data-el-text'),
          description: $(e.target).attr('data-description') ?
            $(e.target).attr('data-description') : "",
          type: 'option',
          position: $(".selected-options").length
        }
      }
    });
  },
  'click .clear-image': function(e) {
    console.log(this);
    confirm("Are you sure?");
    let uploadId = Uploads.findOne({fundId: this.id})._id;
    let uploadName = Uploads.findOne({fundId: this.id}).name;
    Uploads.remove({_id: uploadId});
    Meteor.call("deleteImageFile", uploadName, function(err){
      if(err){
        Bert.alert( {
          message: "Hmm... that didn't work",
          type:    'danger',
          icon:    'fa-frown-o',
          style:   'growl-top-right'
        } );
        throw new Meteor.Error("400", "Something went wrong and the user wasn't able to remove an image");
      } else {
        Bert.alert({
          message: "Removed",
          type: 'success',
          icon: 'fa-smile-o'
        });
      }
    });
  }
});

/*****************************************************************************/
/* GivingOptions: Helpers */
/*****************************************************************************/
Template.GivingOptions.helpers({
  dt_funds: function () {
    let orgDoc = MultiConfig.findOne();
    let selectedGivingOptions = orgDoc ? orgDoc.donationOptions : null;
    if(selectedGivingOptions){
      selectedGivingOptions = selectedGivingOptions.map(function(val){ return val.id; });
      if( selectedGivingOptions ) {
        return DT_funds.find({'id': {$nin: selectedGivingOptions}}, {sort: { name: 1 } });
      }
    }
    return DT_funds.find({}, {sort: { name: 1 } });
  },
  imageExists: function () {
    let id = this.id;
    return Uploads.findOne({fundId: id});
  },
  imageSrc: function () {
    if (Uploads.findOne({fundId: this.id})) {
      return 'http://127.0.0.1:3000/upload/thumbnailBig/' + Uploads.findOne({fundId: this.id}).name;
    }
    return;
  },
  donationOptions: function() {
    let donationOptions =  MultiConfig.findOne() && MultiConfig.findOne().donationOptions;
    return _.sortBy(donationOptions, 'position');
  },
  donationGroups: function() {
    let donationOptions =  MultiConfig.findOne() && MultiConfig.findOne().donationOptions;

    let groups = _.filter( donationOptions, function(item) {
      return item && item.groupId;
    });
    let donationGroups = groups.map(function(group) {
      group.children = _.filter(donationOptions, function(item) {
        return group.groupId === item.currentGroup;
      });
      return group;
    });
    return donationGroups;
  },
  description: function() {
    if (this.description) {
      return this.description;
    } else {
      return "DESCRIPTION HERE";
    }
  },
  showDD: function() {
    return Session.get("showDD");
  }
});


/*****************************************************************************/
/* GivingOptions: Lifecycle Hooks */
/*****************************************************************************/
Template.GivingOptions.onCreated(function () {
  // TODO: remove this for production, use debounce and at least a 1 minute timer
  // with a button to call Meteor.call("get_dt_funds");
  let self = this;
  // Use self.subscribe with the data context reactively
  self.autorun(function () {
    self.subscribe("uploaded");
  });
});

Template.GivingOptions.onRendered(function () {

  // Start the function to setup the table connections and make them sortable
  sortableFunction();

  // Set configId
  Session.set("configId", MultiConfig.findOne()._id);

  //var MultiConfigAllOptions = MultiConfig.findOne().GivingOptions;
  var donationOptions = MultiConfig.findOne() && MultiConfig.findOne().donationOptions;

  if(donationOptions && donationOptions.length > 0){

    $('#testDropdown').select2({
      data: _.sortBy(donationOptions, 'position'),
      dropdownCssClass: 'dropdown-inverse',
      placeholder: "Choose one"
    });
    $("#testDropdown").select2('val',donationOptions[0].id);

    Session.set("givingOptionsChecked", donationOptions);
    let groups = _.filter( donationOptions, function(item) {
        return item && item.groupId;
      });
    Session.set("showDD", false);

    // Setup the DD-Slick version of the individual select elements
    Meteor.setTimeout(function() {
      Session.set( "showDD", true );
    }, 500);
    Meteor.setTimeout(function() {
      groups.forEach(function(item){
        let itemName = '#dd-' + item.groupId;
        $(itemName).ddslick({
          onSelected: function(selectedData) {
            console.log(selectedData.selectedData.value);
            $('[name="donateTo"]').val(selectedData.selectedData.value);
          }
        });
        $(itemName).hide();
      });

      if ($("#mainDD")) {
        $("#mainDD").ddslick({
          onSelected: _.debounce(function(selectedData){
            console.log(selectedData);
            $("#dd-" + selectedData.selectedData.value).show();

            groups.forEach(function(item){
              let itemName = '#dd-' + item.groupId;
              if( selectedData.selectedData.value !== item.groupId) {
                $( itemName ).prop('disabled', true);
                $( itemName ).hide();
              } else {
                $('[name="donateTo"]').val($(itemName).find(":input").val());
              }
            });
          }, 300)
        });
      }
      $(".dd-container").addClass("text-center");
    }, 600);
  }
});
