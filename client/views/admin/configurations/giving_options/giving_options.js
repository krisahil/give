function reorderItems() {
  console.log("started reorder");
  let orderOfOptions = $("#selectedGivingOptionsDiv").sortable("toArray");
  let newOptionsOrder = [];

  let currentGroup;
  orderOfOptions.forEach(function(id, index) {
    console.log(index, id);
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
    console.log("Saving");

    var group = MultiConfig.findOne().donationOptions;
    let elementPos;
    elementPos = _.filter( group, function(x) {
      if (x && !x.text) {
        return x.id ? x.id : x.groupId;
      }
    });
    console.log("after");
    console.log(elementPos);

    if (elementPos && elementPos.length > 0) {
      elementPos.forEach( function ( item ) {
        console.log( item.id ? item.id : item.groupId );

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
    // TODO: update the array object of this id with the new value
  },500),
  'click .remove-item': function(e) {
    e.preventDefault();
    let dtId = $(e.currentTarget).attr('data-el-id');
    console.log(dtId);

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
            $(e.target).attr('data-description') :
            "",
          type: 'option',
          position: $(".selected-options").length
        }
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
      return Uploads.findOne({fundId: this.id}).url;
    }
    return;
  },
  donationOptions: function() {
    let configOptions =  MultiConfig.findOne() && MultiConfig.findOne().donationOptions;
    return _.sortBy(configOptions, 'position');
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

  // Set configId
  Session.set("configId", MultiConfig.findOne()._id);

  //var MultiConfigAllOptions = MultiConfig.findOne().GivingOptions;
  var temp1 = MultiConfig.findOne() && MultiConfig.findOne().donationOptions;

  console.log(temp1);
  if(temp1 && temp1.length > 0){

    $('#testDropdown').select2({
      data: _.sortBy(temp1, 'position'),
      dropdownCssClass: 'dropdown-inverse',
      placeholder: "Choose one"
    });
    $("#testDropdown").select2('val',temp1[0].id);

    Session.set("givingOptionsChecked", temp1);
    let sortableArray = $("#selectedGivingOptionsDiv").sortable("toArray");
    let groupIds = _.filter( temp1, function(item) {
        return item && item.groupId;
      });
    console.log(groupIds);

    // Setup the DD-Slick version of the individual select elements
    /*temp1.forEach(function(val){
      let itemName = 'testSelect' + val.text;
      $("select[data-dt-name='" + itemName + "']").ddslick();
    });*/

    if ($("select[data-dt-name='testSelectMain']")) {
      $("select[data-dt-name='testSelectMain']").ddslick();
    }
  }
});
