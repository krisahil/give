Session.setDefault('dt_donations_cursor', 0);

Template.UserProfile.helpers({
    user: function () {
        return Meteor.user();
    },
    showHistory: function () {
        return Session.get("showHistory");
    },
    donation: function () {
        return Donations.find({}, {sort: {created_at: 1}});
    },
    donationItem: function(id){
        var donation_cursor;
        if( donation_cursor = Donations.findOne(id)){
            if(donation_cursor.donateTo){
                return donation_cursor.donateTo;
            }
            else return;
        }
        else return;
    },
    total_amount: function () {
        return this.total_amount / 100;
    },
    debits: function () {
        return Debits.find({}, {sort: {created_at: -1}});
    },
    given: function () {
        var debits = Debits.find();
        var total = 0;
        var count = 0;
        debits.forEach(function (cursor) {
            total = total + cursor.amount;
            count += 1;
        });
        return {total: total/100, count: count};
    },
    dt_gifts: function () {
        var donations = DT_donations.find({});
        var fullSplitList = [];
        var number_of_gifts = 0;
        var total_given = 0;
        donations.forEach(function (element){
            number_of_gifts++;
            element.splits.forEach(function (value){
                total_given += value.amount_in_cents;
                if(!_.contains(fullSplitList, value.fund_id)){
                    fullSplitList.push(value.fund_id)}
            });
        });
        return {categories: fullSplitList.length, number_of_gifts: number_of_gifts, total_given: total_given};
    },
    customer: function () {
        return Customers.findOne();
    },
    address_line2: function () {
        if(Meteor.user().profile.address.address_line2) {
            return '<span class="">' + Meteor.user().profile.address.address_line2 + '</span> <br>';
        } else return;
    },
    email: function () {
        if(Meteor.user().emails[0].address) {
            return Meteor.user().emails[0].address;
        } else return;
    },
    business_name: function () {
        if(Meteor.user().profile.business_name) {
            return '<h5>' + Meteor.user().profile.business_name + '</h5>';
        } else return;
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
        return DT_donations.find({}, {sort: {received_on: -1}, limit: 10, skip: page});
    },
    split: function () {
        return this.splits;
    },
    fundName: function() {
        if(DT_funds.findOne({_id: this.fund_id}) && DT_funds.findOne({_id: this.fund_id}).name){
            return DT_funds.findOne({_id: this.fund_id}).name;
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
        if(this.transaction_id){
            charge_id = this.transaction_id;
            customer_id = Charges.findOne({_id: charge_id}).customer;
            donation_id = Donations.findOne({customer_id: customer_id})._id;
            return '//thanks?c=' + customer_id + '&don=' + donation_id + '&charge=' + charge_id;
        }else{
            return;
        }
    },
    clickable_row: function() {
        if(this.transaction_id){
            return 'clickable_row';
        }
        else{
            return;
        }
    }

});

Template.UserProfile.events({
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
        var updateThis = {$set: fields};

        // Update the Meteor.user profile
        Meteor.users.update(Meteor.user()._id, {$set: {'profile.address': fields.address, 'profile.phone': fields.phone}});
        var customer_id = Meteor.users.findOne().primary_customer_id;
        var updateCustomer = Customers.update({_id: customer_id}, updateThis);
        if(updateCustomer === 1) {
            $('#modal_for_address_change').modal('hide')
        }
        Meteor.call('update_customer', updateThis.$set,  customer_id, DT_donations.findOne().persona_id, function(error, result){
           if(result){
               console.log(result);
           } else{
               console.log(error);
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
        Router.go($('.clickable_row').closest('tr').data("href"));
    }

});

Template.UserProfile.rendered = function(){
   Session.set("showHistory", true);

    // Make sure the user can't enter anything, except what would go in a phone number field
    $("#phone").mask("(999)999-9999");

    // Setup parsley form validation
    $('#userAddressForm').parsley();

    $('[data-toggle="popover"]').popover({html: true});

};

Template.UserNav.events({
    'click #nav-button-password': function(evt){
        evt.preventDefault();
        Router.go('changePwd');
    },
    'click #nav-button-profile': function(evt){
        evt.preventDefault();
        Router.go('user.profile');
    }
    ,
    'click #nav-button-subscriptions': function(evt){
        evt.preventDefault();
        Router.go('subscriptions');
    }
});


