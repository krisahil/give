BrowserPolicy.framing.disallow();
BrowserPolicy.content.disallowInlineScripts();
BrowserPolicy.content.disallowEval();
BrowserPolicy.content.allowInlineStyles();
BrowserPolicy.content.allowFontDataUrl();

var trusted = [
    'js.stripe.com',
    'checkout.stripe.com',
    'give.trashmountain.com',
    'trashmountain.com',
    'kadira.io',
    'enginex.kadira.io',
    'use.typekit.net',
    'p.typekit.net'
];

_.each(trusted, function(origin) {
    var dup_origin = origin;
    origin = "https://" + origin;
    BrowserPolicy.content.allowOriginForAll(origin);
    dup_origin = "http://" + dup_origin;
    BrowserPolicy.content.allowOriginForAll(dup_origin);
});

BrowserPolicy.content.allowInlineScripts("https://give.trashmountain.com");