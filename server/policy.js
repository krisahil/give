BrowserPolicy.framing.disallow();
BrowserPolicy.content.disallowInlineScripts();
BrowserPolicy.content.disallowEval();
BrowserPolicy.content.allowInlineStyles();
BrowserPolicy.content.allowFontDataUrl();

var trusted = [
    'js.stripe.com',
    'checkout.stripe.com',
    'trashmountain.com/system/wp-content/uploads/2012/07/bw_logo.png'
];

_.each(trusted, function(origin) {
    origin = "https://" + origin;
    BrowserPolicy.content.allowOriginForAll(origin);
});