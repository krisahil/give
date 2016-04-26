Meteor.startup(function() {
  UploadServer.init({
    tmpDir: process.env.PWD + '/.uploads/tmp',
    uploadDir: process.env.PWD + '/.uploads/',
    checkCreateDirectories: true, // create the directories for you
    validateRequest: function(req) {
      try {
        logger.info("Got to validateRequest");
        // 10485760 = 10 Megabytes
        if (req.headers["content-length"] > 10485760) {
          logger.info("File is too long");
          return "File is too long!";
        }
        return null;
      } catch(e) {
        logger.error(e);
        throw new Meteor.Error(500, e);
      }
    },
    validateFile: function(file, req) {
      try {
        logger.info("Got to validateFile");
        if (req.maxFileSize < file.size) {
          logger.info("File is to large");
          return 'File size to large, should be less than 10MB';
        }
        logger.info(file.type);
        logger.info(req);
        logger.info("File is NOT to large");
        return null;
      } catch(e) {
        logger.error(e);
        throw new Meteor.Error(500, e);
      }
    },
    imageTypes: /.(gif|jpe?g|png)$/i,
    maxFileSize: 10000000,
    getFileName: function( fileInfo, formData ) {
      try {
        logger.info("In getFileName");
        logger.info(fileInfo);
        logger.info(formData);
        return fileInfo.name.replace(/[*_\s]/g, '');
      } catch(e) {
        logger.error(e);
        throw new Meteor.Error(500, e);
      }
    },
    finished: function(fileInfo, formFields) {
      try {
        // Merge the formFields Object into the fileInfo Object
        Object.assign( fileInfo, formFields );

        // Use GM to convert the image
        logger.info( fileInfo );
        logger.info( formFields );
        gm( process.env.PWD + '/.uploads' + fileInfo.path )
          .resize( 256, 256 )
          .type( "TrueColor" )
          .write( process.env.PWD + '/.uploads/thumbnailBig/' + fileInfo.name, function ( err ) {
            if( err ) {
              console.error( err );
              logger.error( err );
            }
          } );
        gm( process.env.PWD + '/.uploads' + fileInfo.path )
          .resize( 128, 128 )
          .type( "TrueColor" )
          .write( process.env.PWD + '/.uploads/thumbnailSmall/' + fileInfo.name, function ( err ) {
            if( err ) {
              console.error( err );
              logger.error( err );
            }
          } );
        // Insert the information about this file into the Uploads Collection
        Uploads.insert( fileInfo );
      } catch( e ) {
        logger.error( e );
        throw new Meteor.Error( 500, e );
      }
    }
  });
});