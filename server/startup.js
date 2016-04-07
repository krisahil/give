Meteor.startup( function() {

  let config = Config.findOne({
    'OrgInfo.web.domain_name': Meteor.settings.public.org_domain
  });
  
  if (config && config.OrgInfo && config.OrgInfo.emails) {
    return Mandrill.config({
      username: config.OrgInfo.emails.mandrillUsername,
      "key": config.OrgInfo.emails.mandrillKey
    });  
  }
});
