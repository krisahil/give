Meteor.methods({
  /**
   * check that the connection to DonorTools is up
   *
   * @method checkDonorTools
   */
  checkDonorTools: function () {
    this.unblock();
    try {
      const result = HTTP.get(Meteor.settings.public.donor_tools_site + "/settings/name_types.json", {
          auth: Meteor.settings.donor_tools_user + ':' + Meteor.settings.donor_tools_password
      });
      return true;
    } catch (e) {
      throw new Meteor.Error(500, "No connection to DT found.");
    }
  }
});