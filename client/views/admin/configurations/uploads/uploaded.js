Template.Uploaded.helpers( {
  images: function () {
    return Uploads.find();
  }
});

Template.Upload.onCreated(function() {
  // Use this.subscribe with the data context reactively
  let self = this;
  self.autorun(function() {
    self.subscribe("uploaded");
  });
});