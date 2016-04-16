function addData(from, value){
  let config = ConfigDoc();
  if (config && config._id) {
    let returnThis = {
      configId: config._id,
      fundId: this.id,
      userId: Meteor.userId()
    };
    
    returnThis[from] = value;
    return returnThis;    
  }
  return;
}

function imageExistsInConfig(type, getPath){
  let config = ConfigDoc();
  if (config && config._id) {
    let imageDoc = Uploads.findOne({$and: [{configId: config._id},{[type]: "_true"}]});
    if (imageDoc) {
      if (!getPath) {
        return imageDoc;
      }
      return imageDoc.baseUrl + imageDoc.name;
    }
  }
  return;
}

Template.Logos.helpers( {
  images: function () {
    return Uploads.find().count() ? Uploads.find() : false;
  },
  addFavIconData: function() {
    return addData('favicon', '_true')
  },
  addLogoData: function() {
    return addData('logo', '_true')
  },
  addEmailLogoData: function() {
    return addData('emailLogo', '_true')
  },
  addReceiptImageData: function() {
    return addData('receiptImage', '_true')
  },
  imageExists(type) {
    console.log(type);
    return imageExistsInConfig(type, false);
  },
  imageSrc(type) {
    let config = ConfigDoc();
    if (config && config._id) {
      let imageDoc = Uploads.findOne({$and: [{configId: config._id},{[type]: "_true"}]});
      if (imageDoc) {
        return imageDoc.baseUrl +
          imageDoc.name;
      }
    }
    return;
  }
});

Template.Logos.events({
  'click .clear-image': function(e) {
    let type = $(e.currentTarget).data('el-type');
    confirm( "Are you sure you want to delete the " + type + " ?" );
    let uploadId = Uploads.findOne( { [type]: "_true" } )._id;
    let uploadName = Uploads.findOne( { [type]: "_true" } ).name;
    Uploads.remove( { _id: uploadId } );
    Meteor.call( "deleteImageFile", uploadName, function ( err ) {
      if( err ) {
        Bert.alert( {
          message: "Hmm... that didn't work",
          type:    'danger',
          icon:    'fa-frown-o',
          style:   'growl-bottom-right'
        } );
        throw new Meteor.Error( "400", "Something went wrong and the user wasn't able to remove an image" );
      } else {
        Bert.alert( {
          message: "Removed",
          type:    'success',
          icon:    'fa-smile-o',
          style:   'growl-bottom-right'
        } );
      }
    } )
  }
});