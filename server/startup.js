Meteor.startup( function() {
  let config = ConfigDoc();

  if (config &&
    config.Services &&
    config.Services.Kadira &&
    config.Services.Kadira.appId && 
    config.Services.Kadira.appSecret) {
    Kadira.connect(
      config.Services.Kadira.appId, config.Services.Kadira.appSecret
    );
  }
});
