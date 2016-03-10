Meteor.startup(function () {
  UploadServer.init({
    tmpDir: process.env.PWD + '/.uploads/tmp',
    uploadDir: process.env.PWD + '/.uploads/',
    checkCreateDirectories: true, //create the directories for you
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
      console.log(fileInfo);
      console.log(formFields);
      // TODO: this is where we can upload into the files collection.
      // don't upload the file, just the file name and the user_id it is tied to and the path
      // use the baseUrl + name to get the actual path
      // then go into the uploads page and use #each to show all those files
    }
  });
});