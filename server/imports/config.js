export let config = Config.findOne({
  'OrgInfo.web.domain_name': Meteor.settings.public.org_domain
});
