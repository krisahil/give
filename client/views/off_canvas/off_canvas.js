Template.OffCanvas.events({
  'click .dismiss-what-is-new': function (e) {
    e.preventDefault();

    Meteor.setTimeout(function() {
      // Update this user's new stuff version to one past the current
      const currentWhatIsNewVersion = Meteor.settings.public.newStuffVersion;
      let incrementedVersion =        Number(currentWhatIsNewVersion) + .1;
      console.log(incrementedVersion);
      Meteor.users.update({_id: Meteor.userId()}, {$set: {"profile.newStuffVersion": incrementedVersion.toString()}});
    }, 2001);
    // Move the button to behind the outer section
    $(".peek-from-bottom-of-nav").css("top", "80px");

  }
});

Template.OffCanvas.onRendered(function () {
  materialadmin.AppOffcanvas.initialize($("#offcanvas-what-is-new"));
});