
Template.registerHelper('formatTime', function(context, options) {
  if(context)
    return moment(context).format('MM/DD/YYYY, hh:mma');
});

Template.registerHelper('shortIt', function(stringToShorten, maxCharsAmount){
  if(stringToShorten.length <= maxCharsAmount){
    return stringToShorten;
  }
  return stringToShorten.substring(0, maxCharsAmount);
});

Template.registerHelper('twoDecimalPlaces', function(stringToAddDecimal){
  return parseFloat(Math.round(stringToAddDecimal) / 100).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
});

Template.registerHelper('formatDate', function(context, options) {
  if(context)
    return moment(context).format('MMM DD, YYYY');
});

Template.registerHelper('logged_in', function(context) {
  if(Meteor.user()){
    switch(context){
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
        if(Meteor.user().profile.business_name){
          return  Meteor.user().profile.business_name;
        }
        break;
      default:
        return;
    }
  }
  else{
    return;
  }
});

/*
 * Epoch to String
 * Convert a UNIX epoch string to human readable time.
 */

Template.registerHelper('epochToString', function(timestamp){
  if (timestamp){
    var length = timestamp.toString().length;
    if ( length === 10 ) {
      return moment.unix(timestamp).format("MMMM Do, YYYY");
    } else {
      return moment.unix(timestamp / 1000).format("MMMM Do, YYYY");
    }
  }
});

/*
 * If Equals
 * Take the two passed values and compare them, returning true if they're equal
 * and false if they're not.
 */

Template.registerHelper('equals', function(c1,c2){
  // If case1 is equal to case2, return true, else false.
  return c1 == c2 ? true : false;
});

/*
 * Cents to Dollars
 * Take the passed value in cents and convert it to USD.
 */

Template.registerHelper('centsToDollars', function(cents){
  return "$" + cents / 100;
});

/*
 * Percentage
 * Take the two passed values, divide them, and multiply by 100 to return percentage.
 */

Template.registerHelper('percentage', function(v1,v2){
  return ( parseInt(v1) / parseInt(v2) ) * 100 + "%";
});

/*
 * Capitalize
 * Take the passed string and capitalize it. Helpful for when we're pulling
 * data out of the database that's stored in lowercase.
 */

Template.registerHelper('capitalize', function(string){
  if (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
});

/*
 * Limit String
 * Return the proper string based on the number of lists.
 */

Template.registerHelper('limitString', function(limit){
  return limit > 1 ? limit + " lists" : limit + " list";
});

/*
 * Plan
 * Get the current subscription data for our user. We set this up as a UI helper
 * because we'll need to reference this information more than once.
 */

Template.registerHelper('plan', function(){
  // Get the current user.
  var user = Meteor.userId(),
    plan = Session.get('currentUserPlan_' + user);
  // If we have a user, call to checkUserPlan on the server to determine
  // their current plan. We do this so that we don't have to publish the user's
  // subscription data to the client.
  if ( user ) {
    Meteor.call('checkUserPlan', user, function(error, response){
      if (error) {
        alert(error.reason);
      } else {
        // Get the response from the server and set it equal to the user's
        // unique session variable (this will be either true or false).
        Session.set('currentUserPlan_' + user, response);
      }
    });
  }
  // Return the result of the method being called.
  return plan;
});

/*
 * Current Route
 * Return an active class if the currentRoute session variable name
 * (set in the appropriate file in /client/routes/) is equal to the name passed
 * to the helper in the template.
 */

Template.registerHelper('currentRoute', function(route){
  return Session.equals('currentRoute', route) ? 'active' : '';
});

Template.registerHelper('MeteorUser', function(){
  if(Meteor.user()){
    return true;
  } else{
    return false;
  }
});


Template.registerHelper('campaign', function() {
  var campaign = Session.get('params.campaign');
  if(campaign === '') {
    return false;
  } else if (campaign === 'Aquaponics Marketplace - Rhiza'){
    return '<img src="/images/marketplace.jpeg" style="width: 50%" />';
  } else if (campaign === 'Aquaponics Marketplace - Karpos'){
    return '<img src="/images/marketplace.jpeg" style="width: 50%" />';
  }
});


Template.registerHelper('locked_amount', function () {
  var locked = Session.get("params.locked_amount");
  if(locked === 'true') {
    return true;
  } else {
    return false;
  }
});

Template.registerHelper('locked_frequency', function () {
  var locked = Session.get("params.locked_frequency");
  if(locked === 'true') {
    return true;
  } else {
    return false;
  }
});

Template.registerHelper('cleanupString', function(string) {
  var cleanString = s(string).stripTags().trim().value();
  return cleanString;
});