Template.Upload.helpers({
  addData:  function() {
    return {
      userId: Meteor.userId()
    };
  }
});

// This is the package helper which renders the font awesome cloud for the drop zone area
Template.dropzone.helpers( {
  'infoLabel': function() {
    var progress = Template.instance().globalInfo.get();

    // we may have not yet selected a file
    if( progress.progress == 0 || progress.progress == 100 ) {
      return '<i class="fa fa-cloud-upload"></i>';
    }
    return progress.progress + "%";
  }
});