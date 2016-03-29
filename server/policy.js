BrowserPolicy.framing.disallow();
BrowserPolicy.content.disallowInlineScripts();
BrowserPolicy.content.disallowEval();
BrowserPolicy.content.allowInlineStyles();
BrowserPolicy.content.allowFontDataUrl();

var trusted = [
  'js.stripe.com',
  'api.stripe.com',
  'q.stripe.com',
  'checkout.stripe.com',
  Meteor.settings.public.org_subdomain ? Meteor.settings.public.org_subdomain + "." +
    Meteor.settings.public.org_domain : '',
  Meteor.settings.public.org_domain,
  'kadira.io',
  'enginex.kadira.io',
  'use.typekit.net',
  'p.typekit.net',
  'cdn.heapanalytics.com',
  'heapanalytics.com'
];

_.each(trusted, function(origin) {
  var secureOrigin = "https://" + origin;
  BrowserPolicy.content.allowOriginForAll(secureOrigin);
  if (Meteor.settings.dev) {
    let nonSecureOrigin = "http://" + origin;
    BrowserPolicy.content.allowOriginForAll(nonSecureOrigin);
  }
});

BrowserPolicy.content.allowInlineScripts(Meteor.settings.public.URL);
