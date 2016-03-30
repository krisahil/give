
function updateSearchVal(){
  console.log("Got to updateSearchVal function");
  let searchValue = $(".search").val();
  if (searchValue) {
    // Remove punctuation and make it into an array of words
    searchValue = searchValue
      .replace( /[^\w\s]|_/g, "" )
      .replace( /\s+/g, " " );

    Session.set( "searchValue", searchValue );
  }
};

Template.ACH.onRendered(function() {
  this.autorun(() => {
    this.subscribe("ach");
  });
});

Template.ACH.helpers({
  donations: function () {
    let searchValue = Session.get("searchValue");
    let customers;
    if (!searchValue) {
      return Donations.find({}, { sort: { createdAt: 1} });
    } else {
      customers = Customers.find({
        $or: [
          { 'metadata.fname': { $regex: searchValue, $options: 'i' } },
          { 'metadata.lname': { $regex: searchValue, $options: 'i' } },
          { 'metadata.business_name': { $regex: searchValue, $options: 'i' } },
          { 'emails': { $regex: searchValue, $options: 'i' } }
        ]
      }, { sort: { createdAt: 1} });
      if (customers.count()) {
        return Donations.find({'customer_id': {$in: customers.map(function ( item ) {
          return item._id;
        })} });
      }
      return false;
    }
  },
  'ifRecurringSelectedText': function() {
    // TODO: if this is a recurring gift return the below text
    return 'selected-row';
  },
  'pendingSetup': function() {
    // TODO: if this is a gift that hasn't been setup manually yet return true
    return true;
  },
  'donorName': function() {
    return 'name';
  },
  'donationTo': function() {
    return 'to';
  },
  'donationAmount': function(){
    return 'amount';
  },
  'donationDate': function() {
    return 'date';
  },
  'donationStatus': function() {
    return 'status';
  },
  'disabledIfBeforeToday': function() {
    // TODO Return the below text if the date of the next recurring gift hasn't happened yet. 
    return 'disabled';
  },
  'showSingleRecord': function() {
    // TODO Return the below text unless we have selected a single record to view
    return false;
  }
});

Template.ACH.events({
  'click .pending-setup-checkbox': function() {
    // TODO: write the function for turning this pending setup into setup
    console.log("pending setup clicked");
  },
  'click .stop-recurring': function(e) {
    // TODO: call a method which sets the donation status to stopped
    console.log("stop recurring clicked ", $(e.currentTarget).attr("data-id"));
  },
  'keyup, change .search': _.debounce(function () {
    updateSearchVal();
  }, 300),
  'click .clear-button': function () {
    $(".search").val("").change();
  }
});

Template.ACH.onDestroyed(function() {
  Session.delete("searchValue");
});
