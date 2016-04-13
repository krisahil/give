Template.Upload.helpers({
  addData: function() {
    return {
      userId: Meteor.userId(),
      fundId: this.id
    };
  },
  myCallbacks: function() {
    return {
      validate: function(file) {
        if (!file) {
          console.log("Failed");
        }
        console.log("validate area");
        console.log(file);
        return 'all done';
      },
      finished: function( index, fileInfo, context ) {
        console.log("finished area");
        console.log(index, fileInfo, context);
        return;
      }
    };
  }
});

// This is the package helper which renders the font awesome cloud for the drop zone area
Template.dropzone.helpers( {
  'infoLabel': function() {
    var progress = Template.instance().globalInfo.get();

    // we may have not yet selected a file
    if ( progress.progress === 0 || progress.progress === 100 ) {
      return '<i class="fa fa-2x fa-cloud-upload"></i>';
    }
    return progress.progress + "%";
  }
});
