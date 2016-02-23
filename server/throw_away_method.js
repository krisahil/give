Meteor.methods({
  'send_batch_enroll_email': function (_ids){
    check(_ids, Array);

    _ids.forEach(function (_id) {
      console.log("Sending for " + _id);
      Accounts.sendEnrollmentEmail(_id);
      console.log("Done sending for " + _id);
    });
    return "Sent all";
  }
});