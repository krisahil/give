
Template.registerHelper('formatTime', function(context) {
  if (context) {
    return moment( context ).format( 'MM/DD/YYYY, hh:mma' );
  }
});

Template.registerHelper('shortIt', function(stringToShorten, maxCharsAmount) {
  if ( stringToShorten.length <= maxCharsAmount ) {
    return stringToShorten;
  }
  return stringToShorten.substring(0, maxCharsAmount);
});

Template.registerHelper('twoDecimalPlaces', function(stringToAddDecimal) {
  return parseFloat(Math.round(stringToAddDecimal) / 100).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
});

Template.registerHelper('formatDate', function(date, unix) {
  if (date && unix) {
    return moment.unix(date).format('MMM DD, YYYY');
  } else if (date) {
    return moment(date).format('MMM DD, YYYY');
  }
});

Template.registerHelper('logged_in', function(context) {
  if (Meteor.user()) {
    switch (context) {
      case "fname":
        return Meteor.user().profile.fname;
        break;
      case "lname":
        return Meteor.user().profile.lname;
        break;
      case "email":
        return Meteor.user().emails[0].address;
        break;
      case "line1":
        return Meteor.user().profile.address.line1;
        break;
      case "line2":
        return Meteor.user().profile.address.line2;
        break;
      case "city":
        return Meteor.user().profile.address.city;
        break;
      case "state":
        return Meteor.user().profile.address.state;
        break;
      case "postal_code":
        return Meteor.user().profile.address.postal_code;
        break;
      case "phone":
        return Meteor.user().profile.phone;
        break;
      case "business_name":
        if (Meteor.user().profile.business_name) {
          return  Meteor.user().profile.business_name;
        }
        break;
      default:
        return;
    }
  }
  else {
    return;
  }
});

/*
 * Epoch to String
 * Convert a UNIX epoch string to human readable time.
 */

Template.registerHelper('epochToString', function(timestamp) {
  if (timestamp) {
    var length = timestamp.toString().length;
    if ( length === 10 ) {
      return moment.unix(timestamp).format("MM/DD/YY");
    }
    return moment.unix(timestamp / 1000).format("MM/DD/YY");
  }
});

/*
 * If Equals
 * Take the two passed values and compare them, returning true if they're equal
 * and false if they're not.
 */

Template.registerHelper('equals', function(c1, c2) {
  // If case1 is equal to case2, return true, else false.
  return c1 === c2 ? true : false;
});

/*
 * Cents to Dollars
 * Take the passed value in cents and convert it to USD.
 */

Template.registerHelper('centsToDollars', function(cents) {
  return "$" + cents / 100;
});

/*
 * Percentage
 * Take the two passed values, divide them, and multiply by 100 to return percentage.
 */

Template.registerHelper('percentage', function(v1, v2) {
  return ( parseInt(v1, 10) / parseInt(v2, 10) ) * 100 + "%";
});

/*
 * Capitalize
 * Take the passed string and capitalize it. Helpful for when we're pulling
 * data out of the database that's stored in lowercase.
 */

Template.registerHelper('capitalize', function(string) {
  if (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
});

/*
 * Limit String
 * Return the proper string based on the number of lists.
 */

Template.registerHelper('limitString', function(limit) {
  return limit > 1 ? limit + " lists" : limit + " list";
});

/*
 * Current Route
 * Return an active class if the currentRoute session variable name
 * (set in the appropriate file in /client/routes/) is equal to the name passed
 * to the helper in the template.
 */

Template.registerHelper('currentRoute', function(route) {
  return Session.equals('currentRoute', route) ? 'active' : '';
});

Template.registerHelper('MeteorUser', function() {
  if (Meteor.user()) {
    return true;
  }
  return false;
});


Template.registerHelper('campaign', function() {
  var campaign = Session.get('params.campaign');
  if (campaign === '') {
    return false;
  }
});


Template.registerHelper('locked_amount', function() {
  var locked = Session.get("params.locked_amount");
  if (locked === 'true') {
    return true;
  } else {
    return false;
  }
});

Template.registerHelper('locked_frequency', function() {
  var locked = Session.get("params.locked_frequency");
  if (locked === 'true') {
    return true;
  }
  return false;
});

Template.registerHelper('cleanupString', function(string) {
  var cleanString = s(string).stripTags().trim().value();
  return cleanString;
});

/*
 * Subtract
 * Take the two passed values, subtract them, and divide by 100 to return dollar amount.
 */

Template.registerHelper('subtract', function(v1, v2) {
  // Don't want to divide by 0 or a negative
  if (v1 <= v2) {
    return;
  }
  return ( v1 - v2 ) / 100;
});

/*
 * Add
 * Take the two passed values, add them, and divide by 100 to return dollar amount.
 */

Template.registerHelper('add', function(v1, v2) {
  if ((v1 + v2) === 0 ) return 0; // Don't want to divide by 0
  return ( v1 + v2 ) / 100;
});

Template.registerHelper('addingNew', function(type) {
  if (Session.equals("addingNew", type)) {
    return true;
  }
  return false;
});


/*
 * Is this a logged in user?
 */

Template.registerHelper( 'isCurrentUser', ( currentUser ) => {
  return currentUser === Meteor.userId() ? true : false;
});


Template.registerHelper( 'disableIfAdmin', ( userId ) => {
  if ( Meteor.userId() === userId ) {
    return Roles.userIsInRole( userId, 'admin' ) ? "disabled" : "";
  }
});

Template.registerHelper( 'not_dt_user', ( ) => {
  return Session.equals("NotDTUser", true);
});

Template.registerHelper( 'tutorialEnabled', ( ) => {
  return Session.get('tutorialEnabled');
});

Template.registerHelper( 'contact_us', ( ) => {
  return '<a class="email" href="mailto:' + Meteor.settings.public.support_address + '">' +
    Meteor.settings.public.support_address + '</a><div class="tel">' +
    Meteor.settings.public.org_phone + '</div>';
});

Template.registerHelper( 'not_safari', ( ) => {
  let user_agent = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  console.log(user_agent);
  return user_agent;
});


/*
*  Meteor.settings.public helpers
*  */

Template.registerHelper( 'URL', ( ) => {
  return Meteor.settings.public.URL;
});
Template.registerHelper( 'bcc_address', ( ) => {
  return Meteor.settings.public.bcc_address;
});
Template.registerHelper( 'canceled_gift_address', ( ) => {
  return Meteor.settings.public.canceled_gift_address;
});
Template.registerHelper( 'contact_address', ( ) => {
  return Meteor.settings.public.contact_address;
});
Template.registerHelper( 'donor_tools_site', ( ) => {
  return Meteor.settings.public.donor_tools_site;
});
Template.registerHelper( 'full_org_name', ( ) => {
  return Meteor.settings.public.full_org_name;
});
Template.registerHelper( 'heap_id', ( ) => {
  return Meteor.settings.public.heap_id;
});
Template.registerHelper( 'large_gift_address', ( ) => {
  return Meteor.settings.public.large_gift_address;
});
Template.registerHelper( 'org_city', ( ) => {
  return Meteor.settings.public.org_city;
});
Template.registerHelper( 'org_domain', ( ) => {
  return Meteor.settings.public.org_domain;
});
Template.registerHelper( 'org_donate_url', ( ) => {
  return Meteor.settings.public.org_donate_url;
});
Template.registerHelper( 'org_ein', ( ) => {
  return Meteor.settings.public.org_ein;
});
Template.registerHelper( 'org_homepage_url', ( ) => {
  return Meteor.settings.public.org_homepage_url;
});
Template.registerHelper( 'org_is_501c3', ( ) => {
  return Meteor.settings.public.org_is_501c3;
});
Template.registerHelper( 'org_mission_statement', ( ) => {
  return Meteor.settings.public.org_mission_statement;
});
Template.registerHelper( 'org_name', ( ) => {
  return Meteor.settings.public.org_name;
});
Template.registerHelper( 'org_phone', ( ) => {
  return Meteor.settings.public.org_phone;
});
Template.registerHelper( 'org_state', ( ) => {
  return Meteor.settings.public.org_state;
});
Template.registerHelper( 'org_state_short', ( ) => {
  return Meteor.settings.public.org_state_short;
});
Template.registerHelper( 'org_street_address', ( ) => {
  return Meteor.settings.public.org_street_address;
});
Template.registerHelper( 'org_subdomain', ( ) => {
  return Meteor.settings.public.org_subdomain;
});
Template.registerHelper( 'org_zip', ( ) => {
  return Meteor.settings.public.org_zip;
});
Template.registerHelper( 'other_support_addresses', ( ) => {
  return Meteor.settings.public.other_support_addresses;
});
Template.registerHelper( 'stripe_publishable', ( ) => {
  return Meteor.settings.public.stripe_publishable;
});
Template.registerHelper( 'support_address', ( ) => {
  return Meteor.settings.public.support_address;
});
