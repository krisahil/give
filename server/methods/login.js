Meteor.methods( {
  /**
   * set a user's state object and update that object with a timestamp
   *
   * @method set_user_state
   * @param {String} userId - _id of user who's stae is being updated
   * @param {String} state - OneOf the values, 'disabled', 'enabled', or 'invited'
   */
  set_user_state: function( userId, state ) {
    logger.info("Started set_user_state method");
    console.log(state);

    check(userId, String);
    check(state, Match.OneOf('disabled', 'enabled', 'invited'));

    try {
      // check to see that the user is the admin user
      if (Roles.userIsInRole(this.userId, ['admin'])) {
        // Set the state of the user with userId
        Meteor.users.update( { _id: userId }, { $set: {
          state: {
            status: state,
            updatedOn: new Date()
          }
        } } );

        // Logout user
        Meteor.users.update( { _id: userId }, { $set: { "services.resume.loginTokens": [] } } );
        return "Updated User";
      }
      throw new Meteor.Error(403, "Not allowed");
    } catch (e) {
      throw new Meteor.Error(500, "Can't do that");
    }
  }
});
