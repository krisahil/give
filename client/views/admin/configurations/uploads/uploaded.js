Template.Uploaded.helpers( {
  images: function () {
    return Uploads.find();
  }
});

Template.Upload.onCreated(function() {
  let self = this;
  // Use self.subscribe with the data context reactively
  self.autorun(function () {
    self.subscribe("uploaded");
  });
});