Meteor.methods({
  checkDonorTools: function () {
    this.unblock();
    try {
      const result = HTTP.get(Meteor.settings.donor_tools_site + "/settings/name_types.json", {
          auth: Meteor.settings.donor_tools_user + ':' + Meteor.settings.donor_tools_password
      });
      return true;
    } catch (e) {
      // Got a network error, time-out or HTTP error in the 400 or 500 range.
      return false;
    }
  }
});