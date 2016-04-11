Meteor.setTimeout(function() {
  let config = ConfigDoc();
  if (config &&
    config.Services &&
    config.Services.Analytics &&
    config.Services.Analytics.trackjs) {
    window._trackJs = { token: config.Services.Analytics.trackjs };
    var s = document.createElement("script");
    s.type = "text/javascript";
    s.src = "https://d2zah9y47r7bi2.cloudfront.net/releases/current/tracker.js";

    $("head").append(s);
  } else {
    console.warn("To use client side error tracking, setup an account with TrackJS.")
  }
}, 2000);
