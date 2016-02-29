

Template.OrgInfo.helpers({
  multiConfigDoc: function () {
    return MultiConfig.findOne( { org_domain: Meteor.settings.public.org_domain } );
  }
});