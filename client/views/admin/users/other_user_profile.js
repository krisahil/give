Template.OtherUserProfile.helpers({
  user: function () {
    return Meteor.users.findOne({_id: Session.get("params.userID")});
  },
  showHistory: function () {
    return Session.get("showHistory");
  },
  donation: function () {
    return Donations.find({}, {sort: {created_at: 1}});
  },
  total_amount: function () {
    return this.total_amount / 100;
  },
  dt_gifts: function () {
    var donations = DT_donations.find({persona_id: this.id});
    var fullSplitList = [];
    var number_of_gifts = 0;
    var total_given = 0;
    donations.forEach(function (element){
      if(element.payment_status === "succeeded" ||
      element.payment_status === "pending" ||
      element.payment_status === "" ||
      element.payment_status == null){
        number_of_gifts++;
        element.splits.forEach(function (value){
          total_given += value.amount_in_cents;
          if(!_.contains(fullSplitList, value.fund_id)){
            fullSplitList.push(value.fund_id)}
        });
      }

    });
    return {categories: fullSplitList.length, number_of_gifts: number_of_gifts, total_given: total_given};
  },
  customer: function () {
    return Customers.findOne();
  },
  address_line2: function () {
    if(Meteor.users.findOne({_id: Session.get("params.userID")}) &&
      Meteor.users.findOne({_id: Session.get("params.userID")}).profile.address.address_line2) {
      return '<span class="">' +
        Meteor.users.findOne({_id: Session.get("params.userID")}).profile.address.address_line2 +
        '</span> <br>';
    } else return;
  },
  email: function () {
    if(Meteor.users.findOne({_id: Session.get("params.userID")}) && Meteor.users.findOne({_id: Session.get("params.userID")}).emails[0].address) {
      return Meteor.users.findOne({_id: Session.get("params.userID")}).emails[0].address;
    } else return;
  },
  business_name: function () {
    if(Meteor.users.findOne({_id: Session.get("params.userID")}) && Meteor.users.findOne({_id: Session.get("params.userID")}).profile.business_name) {
      return '<h5>' + Meteor.users.findOne({_id: Session.get("params.userID")}).profile.business_name + '</h5>';
    }
    else return;
  },
  company_name: function () {
    if(this.company_name) {
      return '<h5>' + this.company_name + '</h5>';
    }
    else return;
  },
  giving_focus: function () {
    var donations = Donations.find().fetch();
    var orgs = {};

    _.each(donations, function(donation) {
      if (orgs[donation.donateTo] == null)
        orgs[donation.donateTo] = 0;
      orgs[donation.donateTo] += donation.amount;
    });

    var amount = _.max(_.values(orgs));
    var donateTo = _.invert(orgs)[amount];
    var count = _.where(donations, {donateTo: donateTo}).length;
    var result = {donateTo: donateTo, amount: amount, count: count};
    return result.donateTo === 'Honduras Urgent' ? '<img src="https://trashmountain.com/system/wp-content/uploads/2014/12/Honduras-01.svg" alt="" class="img-circle img-responsive">' : result.donateTo;
  },
  dt_donations: function() {
    var page = Session.get('dt_donations_cursor');
    return DT_donations.find({'persona_id': this.id}, {sort: {received_on: -1}, limit: 10, skip: page});
  },
  split: function () {
    return this.splits;
  },
  fundName: function() {
    if(DT_funds.findOne({_id: this.fund_id.toString()}) && DT_funds.findOne({_id: this.fund_id.toString()}).name){
      return DT_funds.findOne({_id: this.fund_id.toString()}).name;
    }
    else return '<span style="color: red;">Finding fund...</span>';
  },
  redText: function(){
    if(this.payment_status && this.payment_status === 'pending'){
      return 'orange-text';
    } else if(this.payment_status && this.payment_status === 'failed'){
      return 'red-text';
    }
  },
  receipt_link: function() {
    var charge_id, donation_id, customer_id;
    if(this.transaction_id && Charges.findOne({_id: this.transaction_id})){
      charge_id = this.transaction_id;
      customer_id = Charges.findOne({_id: charge_id}).customer;
      return '/thanks?c=' + customer_id + '&charge=' + charge_id;
    }else{
      return;
    }
  },
  clickable_row: function() {
    if(this.transaction_id && Charges.findOne({_id: this.transaction_id})){
      return 'clickable_row';
    }
    else{
      return;
    }
  },
  personas : function () {
    return Meteor.users.findOne({_id: Session.get("params.userID")}) &&
      Meteor.users.findOne({_id: Session.get("params.userID")}).persona_info;
  },
  company_or_name: function () {
    // TODO: need to fix this to look at the persona info, not the profile info
    var user = Meteor.users.findOne({_id: Session.get("params.userID")});
    return this.company_name ? this.company_name :
      this.names ? this.names[0].first_name + ' ' + this.names[0].last_name :
      '';
  },
  street_address: function () {
    var street_address = this.addresses[0].street_address;
    street_address = street_address.split("\n");
    return street_address;
  },
  disabledUserFA: function () {
    if(!this.state){
      return '<i class="fa fa-lock"></i>';
    }
    if(this.state && this.state.status && this.state.status === 'disabled'){
      return '<i class="fa fa-unlock"></i>';
    } else {
      return '<i class="fa fa-lock"></i>';
    }
  }
});

Template.OtherUserProfile.events({
  'click #viewHistory': function() {
    Session.set("showHistory", false);
  },
  'click .edit_address': function () {
    //setup modal for entering give toward information
    $('#modal_for_address_change').modal({show: true, static: true});
  },
  'submit form': function (evt, tmpl) {
    evt.preventDefault();
    evt.stopPropagation();
    var fields = {
      address: {
        'address_line1':    $('#line1').val(),
        'address_line2':    $('#line2').val(),
        'city':             $('#city').val(),
        'state':            $('#state').val(),
        'postal_code':      $('#zip').val()
      },
      phone:                  $('#phone').val()
    };

    var loadingButton = $(':submit').button('loading');

    var updateThis = {};
    updateThis.profile = Meteor.users.findOne({_id: Session.get("params.userID")}) && Meteor.users.findOne({_id: Session.get("params.userID")}).profile;
    updateThis.profile[Session.get('activeTab')] = fields;

    // Update the Meteor.user profile
    Meteor.users.update({_id: Meteor.users.findOne({_id: Session.get("params.userID")})._id}, {$set:  updateThis});
    //var customer_id = Meteor.users.findOne({_id: Session.get("params.userID")}) & Meteor.users.findOne({_id: Session.get("params.userID")}).primary_customer_id;

    Meteor.call('update_customer', fields, Number(Session.get('activeTab')), function(error, result){
      if(result){
        console.log(result);
        $('#modal_for_address_change').modal('hide');
        loadingButton.button("reset");
        Bert.alert("We have updated your address, thanks.", "success");
      } else{
        console.log(error);
        loadingButton.button("reset");
        Bert.alert("That didn't work. Please try again. If it still doesn't work, " +
          "then please let us know, we'll check into this error." + error, "danger");
      }
    });
  },
  'click .previous': function(evt, tmpl){
    evt.preventDefault();
    evt.stopPropagation();
    if(Number(Session.get('dt_donations_cursor')> 9)){
      Session.set('dt_donations_cursor', Number(Session.get('dt_donations_cursor')-10));
    }
  },
  'click .next': function(evt, tmpl){
    evt.preventDefault();
    evt.stopPropagation();
    Session.set('dt_donations_cursor', Number(Session.get('dt_donations_cursor')+10));
  },
  'click .clickable_row': function(){
    var transaction_id = this.transaction_id;
    Router.go($(".clickable_row[data-dt-transaction-id='" + transaction_id + "']").data("href"));
  },
  'click #myTabs a': function () {
    Session.set('activeTab', this.id);
  }
});

Template.OtherUserProfile.onRendered(function() {

  if(!Meteor.users.findOne({_id: Session.get("params.userID")}).persona_info ||
    Meteor.users.findOne({_id: Session.get("params.userID")}).persona_info.length < 1 ||
    Meteor.users.findOne({_id: Session.get("params.userID")}).persona_info.length < Meteor.users.findOne({_id: Session.get("params.userID")}).persona_ids.length) {
    Meteor.call( 'update_user_document_by_adding_persona_details_for_each_persona_id', Session.get("params.userID"), function ( error, result ) {
      if( result ) {
        if(result === 'Not a DT user'){
          Session.set("NotDTUser", true);
          return;
        }
        console.log( result );
        Session.set("got_all_donations", true);
        // Hack here to reload the page. I'm not sure why the reactivity isn't
        // showing the new information, when the persona_info is pulled down
        // for now we just reload the page and the problem is resolved.
        /*Meteor.setTimeout(function() {
          Session.set( "showSingleUserDashboard", "_true" );
        }, 0);
        Session.set("showSingleUserDashboard", "_false");*/


      } else {
        console.log( error );
      }
    } );
  } else if(!Session.equals("got_all_donations", true)) {
    Meteor.call("get_all_donations_for_this_donor", Session.get("params.userID"), function (error, result) {
      if( result ) {
        console.log( result );
        Session.set("got_all_donations", true);
      } else {
        console.log( error );
      }
    });
  }

  Session.setDefault('dt_donations_cursor', 0);
  Session.set("showHistory", true);

  // Make sure the user can't enter anything, except what would go in a phone number field
  $("#phone").mask("(999)999-9999");

  // Setup parsley form validation
  $('#userAddressForm').parsley();

  $('[data-toggle="popover"]').popover({html: true});

  $('#myTabs li:first').addClass('active');

  //$("a[href='" + Session.get('activeTab') + "' ]").addClass('active');

  $('.tab-pane:first').addClass('active');

  Session.set('activeTab', $('.active a').attr('value'));
});