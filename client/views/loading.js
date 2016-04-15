Template.loading.onCreated(function() {
  Session.set("loading", true);
});

Template.loading.onDestroyed(function() {
  Session.set("loading", false);
});
