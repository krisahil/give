/*****************************************************************************/
/* OrgInfo: Helpers */
/*****************************************************************************/
Template.OrgInfo.helpers({
  updateDoc: function () {
    return MultiConfig.findOne( { org_name: Meteor.settings.public.org_name } );
  }
});
