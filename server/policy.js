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
    Meteor.settings.public.URL,
    Meteor.settings.public.org_domain,
    'kadira.io',
    'enginex.kadira.io',
    'use.typekit.net',
    'p.typekit.net',
    'cdn.heapanalytics.com',
    'heapanalytics.com'
];

_.each(trusted, function(origin) {
    var dup_origin = origin;
    origin = "https://" + origin;
    BrowserPolicy.content.allowOriginForAll(origin);
    dup_origin = "http://" + dup_origin;
    BrowserPolicy.content.allowOriginForAll(dup_origin);
});

BrowserPolicy.content.allowInlineScripts(Meteor.settings.public.URL);