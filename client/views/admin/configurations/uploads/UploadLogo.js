Template.UploadLogo.helpers({
  addData: function() {
    let config = ConfigDoc();
    if (config && config._id) {
      return {
        configId: config._id,
        fundId: this.id,
        userId: Meteor.userId(),
        logo: "_true"
      };
    }
    return;
  }
});