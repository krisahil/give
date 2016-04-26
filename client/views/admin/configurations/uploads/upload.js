Template.Upload.helpers({
  addData: function() {
    let config = ConfigDoc();
    if (config && config._id) {
      return {
        configId: config._id,
        fundId: this.id,
        userId: Meteor.userId()
      };
    }
    return;
  },
  myCallbacks: function() {
    return {
      validate: function(file) {
        if (!file) {
          console.log("Failed");
        }

        if (['image/gif','image/png','image/jpg', 'image/jpeg'].indexOf(file[0].type) === -1) {
          alert("The only image types you can use are png, gif, jpg or jpeg");
          return false;
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
