Meteor.startup(function() {
  UploadServer.init({
    tmpDir: process.env.PWD + '/.uploads/tmp',
    checkCreateDirectories: true, // create the directories for you
    uploadDir: process.env.PWD + '/.uploads/',
    validateRequest: function(req) {
      logger.info("Got to validateRequest");
      if (req.headers["content-length"] > 10000000) {
        logger.info("File is too long");
        return "File is too long!";
      }
      return null;
    },
    validateFile: function(file, req) {
      logger.info("Got to validateFile");
      if (req.maxFileSize < file.size) {
        console.log("File is to large");
        return 'File size to large, should be less than 10MB';
      }
      console.log(file.type);
      console.log(req);
      console.log("File is NOT to large");
      return null;
    },
    imageTypes: /.(gif|jpe?g|png)$/i,
    maxFileSize: 10000000,
    getFileName: function( fileInfo, formData ) {
      console.log("In getFileName");
      console.log(fileInfo);
      console.log(formData);
      return fileInfo.name.replace(/\s+/g, '');
    },
    finished: function(fileInfo, formFields) {
      // Merge the formFields Object into the fileInfo Object
      Object.assign(fileInfo, formFields);

      // Use GM to convert the image
      console.log(fileInfo);
      console.log(formFields);
      gm(process.env.PWD + '/.uploads' + fileInfo.path)
        .resize(256, 256)
        .type("TrueColor")
        .write(process.env.PWD + '/.uploads/thumbnailBig/' + fileInfo.name, function(err) {
          if (err) {
            console.error(err);
            logger.error(err);
          }
        } );
      gm(process.env.PWD + '/.uploads' + fileInfo.path)
        .resize(128, 128)
        .type("TrueColor")
        .write(process.env.PWD + '/.uploads/thumbnailSmall/' + fileInfo.name, function(err) {
          if (err) {
            console.error(err);
            logger.error(err);
          }
        } );
      // Insert the information about this file into the Uploads Collection
      Uploads.insert(fileInfo);
    }
  });
});