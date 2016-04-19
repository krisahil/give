function updateDoc(e, type, value) {
  let config = ConfigDoc();
  let id = $(e.currentTarget).data('group-id');
  if (guideExists() && groupIndex(config, id) !== -1) {
    Meteor.call( "updateGuide", id, groupIndex(config, id), type, value, function ( err, res ) {
      if( res ) {
        console.log( res );
      } else {
        console.error( err );
      }
    });
  } else {
    Config.update({_id: config._id}, {$addToSet: {'Giving.guide': {groupId: id, [type]: value}}})
  }  
}

function guideExists () {
  let config = ConfigDoc();
  if (config && config.Giving && config.Giving.guide) {
    return true;
  }
  return false;
}

function groupIndex (config, id) {
  return config.Giving.guide.map( function ( group ) {
    return group.groupId;
  } ).indexOf( id );
}

Template.GivingGuide.onRendered(function(){
  $('[data-toggle="popover"]').popover({html: true});
  $('[role="iconpicker"]').iconpicker({iconset: 'fontawesome',
    selectedClass: 'btn-primary',
    unselectedClass: 'btn-default'
  });

});

Template.GivingGuide.helpers({
  configId: function() {
    let config = ConfigDoc();
    return config && config._id;
  },
  givingGroups: function() {
    let config = ConfigDoc();
    var givingOptions = config && config.Giving && config.Giving.options;

    if(givingOptions && givingOptions.length > 0){
      let groups = _.filter( givingOptions, function(item) {
        if ( item && item.groupId ) {
          return item;
        }
      });
      return groups;
    }
  },
  givingGuide: function() {
    let config = ConfigDoc();
    var givingGuide = config && config.Giving && config.Giving.guide;

    if(givingGuide && givingGuide.length > 0){
      return givingGuide;
    }
  },
  checked: function() {
    let config = ConfigDoc();
    if (guideExists()) {
      if (groupIndex(config, this.groupId) !== -1 && config.Giving.guide[groupIndex(config, this.groupId)].show) {
        return 'checked';
      }
    }
    return;
  },
  icon: function () {
    let config = ConfigDoc();
    if (guideExists()) {
      if (groupIndex(config, this.groupId) !== -1 && config.Giving.guide[groupIndex(config, this.groupId)].icon) {
        return config.Giving.guide[groupIndex(config, this.groupId)].icon;
      }
    }
    return;
  },
  title: function () {
    let config = ConfigDoc();
    if (guideExists()) {
      if (groupIndex(config, this.groupId) !== -1 && config.Giving.guide[groupIndex(config, this.groupId)].title) {
        return config.Giving.guide[groupIndex(config, this.groupId)].title;
      }
    }
    return;
  },
  description: function () {
    let config = ConfigDoc();
    if (guideExists()) {
      if (groupIndex(config, this.groupId) !== -1 && config.Giving.guide[groupIndex(config, this.groupId)].description) {
        return config.Giving.guide[groupIndex(config, this.groupId)].description;
      }
    }
    return;
  }
});

Template.GivingGuide.events({
  'click .guide-show': function(e) {
    console.log("Checked? " + $(e.currentTarget).is(':checked'));
    updateDoc(e, 'show', $(e.currentTarget).is(':checked'));
  },
  'change .guide-icon': function (e) {
    console.log("Change: " + e.icon);
    updateDoc(e, 'icon', e.icon);
  },
  'input .guide-title': _.debounce(function (e) {
    console.log("Change: " + $(e.currentTarget).val());
    updateDoc(e, 'title', $(e.currentTarget).val());
  }, 500),
  'input .guide-description': _.debounce(function (e) {
    console.log("Change: " + $(e.currentTarget).val());
    updateDoc(e, 'description', $(e.currentTarget).val());
  }, 500)
});
