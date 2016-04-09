Template.UserNav.events({
  'click #nav-password': function(evt){
    evt.preventDefault();
    Router.go('changePwd');
  },
  'click #nav-sign-out': function(evt){
    evt.preventDefault();
    AccountsTemplates.logout();
  },
  'click #nav-profile': function(evt){
    evt.preventDefault();
    Router.go('user.profile');
  },
  'click #nav-subscriptions': function(evt){
    evt.preventDefault();
    Session.set('addingNewCreditCard', false);
    Router.go('subscriptions');
  }
});

Template.UserNav.helpers({
  dismissedNewStuff: function () {
    let newStuffVersion = Meteor.user() && Meteor.user().profile &&
      Meteor.user().profile.newStuffVersion;
    if (newStuffVersion && newStuffVersion > Meteor.settings.public.newStuffVersion) {
      return true;
    } else {
      return false;
    }
  }
});

Template.UserNav.onRendered(function () {
  materialadmin.AppOffcanvas.initialize($("#offcanvas-what-is-new"));

  // Subscribe to the configuration
  this.autorun(() => {
    this.subscribe("config");
    let config = ConfigDoc();

    if (config && config.Services && config.Services.Analytics && config.Services.Analytics.heapId) {
      window.heap = window.heap || [], heap.load = function ( e, t ) {
        window.heap.appid = e, window.heap.config = t = t || {};
        var n = t.forceSSL || "https:" === document.location.protocol, a = document.createElement( "script" );
        a.type = "text/javascript", a.async = !0, a.src = (n ? "https:" : "http:") + "//cdn.heapanalytics.com/js/heap-" + e + ".js";
        var o = document.getElementsByTagName( "script" )[0];
        o.parentNode.insertBefore( a, o );
        for( var r = function ( e ) {
          return function () {
            heap.push( [e].concat( Array.prototype.slice.call( arguments, 0 ) ) )
          }
        }, p = ["clearEventProperties", "identify", "setEventProperties",
                "track",
                "unsetEventProperty"], c = 0; c < p.length; c++ )heap[p[c]] = r( p[c] )
      };
      heap.load( config.Services.Analytics.heapId );
    }
  });
});
