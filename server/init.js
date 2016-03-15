Meteor.startup(function() {
  UploadServer.init({
    tmpDir: process.env.PWD + '/.uploads/tmp',
    uploadDir: process.env.PWD + '/.uploads/',
    checkCreateDirectories: true, // create the directories for you
    imageTypes: /.(gif|jpe?g|png)$/i,
    imageVersions: {
      thumbnailBig: {
        width: 400, height: 300
      },
      thumbnailSmall: {
        width: 128, height: 128
      }
    },
    maxFileSize: 10000000,
    finished: function(fileInfo, formFields) {
      // Merge the formFields Object into the fileInfo Object
      Object.assign(fileInfo, formFields);
      // Insert the information about this file into the Uploads Collection
      Uploads.insert(fileInfo);
    }
  });
});