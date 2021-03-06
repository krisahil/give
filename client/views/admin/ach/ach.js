
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
      return Donations.find({}, { sort: { created_at: 1} });
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
  'donationFrequency': function() {
    if (this.frequency && !(this.frequency === 'one_time')) { 
      return 'recurring';
    }
    return 'one-time'
  },
  'pendingSetup': function() {
    if (!this.iterationCount) {
      return true;
    }
  },
  'donorName': function() {
    let customer = Customers.findOne({_id: this.customer_id});
    let name;
    if (customer) {
      if (customer.metadata.business_name) {
        name = customer.metadata.business_name + " ";
      }
      name = name ? name : '' + customer.metadata.fname + " " + customer.metadata.lname;
      return name;
    }
  },
  'donationAmount': function() {
    return (this.total_amount / 100).toFixed(2);
  },
  'donationDate': function() {
    return moment(this.start_date * 1000).format("MM/DD/YYYY");
  },
  'disabledIfBeforeToday': function() {
    return (this.start_date > (new Date().getTime() / 1000 | 0)) ? 'disabled': '';
  },
  'routingNumber': function() {
    let bankInfo = BankAccounts.findOne({_id: this.source_id});
    if (bankInfo) {
      return bankInfo.routing_number;
    }
  },
  'accountType': function() {
    let bankInfo = BankAccounts.findOne({_id: this.source_id});
    if (bankInfo) {
      return bankInfo.account_type;
    }
  },
  'personaId': function() {
    let customer = Customers.findOne({_id: this.customer_id});
    if (customer) {
      return customer.metadata.dt_persona_id ? customer.metadata.dt_persona_id : '';
    }
  },
  'showSingleRecord': function() {
    // TODO Return the below text unless we have selected a single record to view
    return false;
  }
});

Template.ACH.events({
  'click .pending-setup': function() {
    let self = this;

    console.log("pending setup clicked");
    swal({
      title: "Have you manually setup this ACH?",
      type: "info",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      closeOnConfirm: false,
      closeOnCancel: true,
      showLoaderOnConfirm: true
    }, function(isConfirm) {
      if (isConfirm) {

        Meteor.call( 'manual_gift_processed', self._id, function( error, response ) {
          if ( error ) {
            console.log(error);
            swal("Error", "Something went wrong", "error");
          } else {
            console.log(response);
            swal({
              title: "Done",
              text: "Ok, I've added this gift to Donor Tools",
              type: 'success'
            });
          }
        });
      }
    });
  },
  'click .stop-recurring': function(e) {
    console.log("stop recurring clicked ", $(e.currentTarget).attr("data-id"));
    swal({
      title: "Are you sure?",
      text: "Do you really want to stop this recurring gift?",
      type: "info",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      closeOnConfirm: false,
      closeOnCancel: true,
    }, function(isConfirm) {
      if (isConfirm) {
        Donations.remove({_id: $(e.currentTarget).attr("data-id")});
        swal({
          title: "Done",
          text: "This recurring gift has been stopped.",
          type: 'success'
        });
      }
    });
  },
  'click .edit-ach': function(e) {
    console.log("edit ach clicked ", $(e.currentTarget).attr("data-id"));

    e.preventDefault();
    let self = this;

    Session.set("change_donation_id", this._id);
    Session.set("change_customer_id", this.customer_id);
    Session.set('change_donateTo', this.donateTo);
    Session.set('change_note', this.note);
    Session.set('change_amount', this.total_amount);
    Session.set('change_date', this.start_date);

    $('#modal_for_admin_ach_change_form').modal({
      show: true,
      backdrop: 'static'
    });

    Meteor.setTimeout(function() {
      $("select option").filter(function() {
        //may want to use $.trim in here
        return $(this).text() === self.donateTo;
      }).prop('selected', true).change();
    }, 0);
  },
  'keyup, change .search': _.debounce(function () {
    updateSearchVal();
  }, 300),
  'click .clear-button': function () {
    $(".search").val("").change();
  },
  'click .show-account-number': function (e) {
    console.log("show account number clicked");
    let bankInfo = BankAccounts.findOne({_id: this.source_id});
    $(e.currentTarget).html(bankInfo.account_number);
    $(e.currentTarget).removeClass('show-account-number');
  }
});

Template.ACH.onDestroyed(function() {
  Session.delete("searchValue");
});
