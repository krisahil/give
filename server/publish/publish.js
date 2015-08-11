/*****************************************************************************/
/* Publish Functions
/*****************************************************************************/

Meteor.publish('receipt_donations', function (input) {
	//Check the input that came from the client
	check(input, String);
	return Donations.find({_id: input}, {fields: {
		sessionId: 0,
		viewable: 0,
		created_at: 0,
		order: 0
	}});
});

Meteor.publish('receipt_customers', function (input) {
	//Check the input that came from the client
	check(input, String);
	return Customers.find({_id: input},
        {
            fields: {
                _id: 1,
                email: 1,
                metadata: 1
            }
        }
    );
});

Meteor.publish('receipt_charges', function (input) {
	//Check the input that came from the client
	check(input, String);

	return Charges.find({_id: input},
        {
            fields:
            {
                _id: 1,
                metadata: 1,
                created: 1,
                status: 1,
                amount: 1,
                'source.bank_name': 1,
                'source.brand': 1,
                'source.last4': 1,
                'source.object': 1,
                'payment_source.bank_name': 1,
                'payment_source.last4': 1,
                'payment_source.object': 1
            }
        }
    );
});

//TODO: These functions are from the old dashboard, need to replicate in the new one
/*Meteor.publish('give_report', function (start_date, finish_date) {
	//Check the input that came from the client
	check(start_date, String);
	check(finish_date, String);

	//check to see that the user is the admin user
	if(this.userId === Meteor.settings.admin_user){
		start_date = moment(Date.parse(start_date)).format('YYYY-MM-DD').slice(0,10);
		finish_date = moment(Date.parse(finish_date)).format('YYYY-MM-DD').slice(0,10);

		return Donate.find( { 'transactions.created_at' : { $gte: start_date, $lte : finish_date } }, { 'transactions' : true } );

	}else{
		return '';
	}

});
*/

/*
Meteor.publish('card_expiring', function () {
	//check to see that the user is the admin user
    if (Roles.userIsInRole(this.userId, ['admin'])) {

        var today = new Date();
        var future_date = new Date(new Date(today).setMonth(today.getMonth()+3));
        return Devices.find( { $and : [ {expires : {$lte : future_date }}, { object : 'card' }] } );

    } else {

        // user not authorized. do not publish
        this.stop();
        return;

    }
});
*/

Meteor.publish("userDonations", function () {
	if (this.userId) {
        var donations = Meteor.users.findOne({_id: this.userId}).donations;
        return Donations.find({'_id': { $in: donations}});
	} else {
		this.ready();
	}
});

Meteor.publish("subscription", function (subscription_id) {
    //Check the subscription_id that came from the client
    check(subscription_id, String);

	if (this.userId) {
        return Subscriptions.find({'_id': subscription_id});
	} else {
		this.ready();
	}
});

Meteor.publish("devices", function () {

    var customers = Customers.find({'metadata.user_id': this.userId});
    var customer_ids = [];

    customers.forEach(function(element) {
        customer_ids.push(element.id);
    });
	if (this.userId) {
        return Devices.find({$and: [{'customer': {$in: customer_ids}}, {'metadata.saved': 'true'}]});
	} else {
		this.ready();
	}
});

Meteor.publish("customer", function (customer) {
    //Check the subscription_id that came from the client
    check(customer, String);

	if (this.userId && Customers.find({_id: customer}, {'metadata.user_id': this.userId})) {

        return Customers.find({_id: customer});
	} else {
        this.stop();
        return;
	}
});

Meteor.publish("userStripeData", function() {
    if (this.userId) {
        var customers = Customers.find({'metadata.user_id': this.userId});
        var customers_ids = [];

        customers.forEach(function(element) {
            customers_ids.push(element.id);
        });
        var charges = Charges.find({'customer': {$in: customers_ids}});
        var donations = Donations.find({'customer_id': {$in: customers_ids}});
        var user = Meteor.users.find({_id: this.userId});
        return[customers, charges, user, donations];
    }
});

Meteor.publish("userStripeDataWithSubscriptions", function () {
    if (this.userId) {
        var customers = Customers.find({'metadata.user_id': this.userId});
        var customer_ids = [];
        var subscription_ids = [];

        customers.forEach(function(element) {
            customer_ids.push(element.id);
        });
        var charges = Charges.find({'customer': {$in: customer_ids}});
        var subscriptions = Subscriptions.find({$and: [{'customer': {$in: customer_ids}}, {'metadata.replaced': {$ne: true}}]});
        var user = Meteor.users.find({_id: this.userId});
        var devices = Devices.find({$and: [{'customer': {$in: customer_ids}}, {'metadata.saved': 'true'}]});
        return[customers, charges, subscriptions, user, devices];
    } else {
		this.ready();
	}
});

Meteor.publish("user_date_and_subscriptions_with_only_4", function () {
    if (this.userId) {
        console.log("Started publish function, user_date_and_subscriptions_with_only_4");
        var customers = Customers.find({'metadata.user_id': this.userId});
        var customer_ids = [];
        var subscription_ids = [];

        customers.forEach(function(element) {
            customer_ids.push(element.id);
        });
        var charges = Charges.find({'customer': {$in: customer_ids}});
        var subscriptions = Subscriptions.find({$and: [{'customer': {$in: customer_ids}}, {'metadata.replaced': {$ne: true}}]});
        var user = Meteor.users.find({_id: this.userId});
        var devices = Devices.find({$and: [{'customer': {$in: customer_ids}}, {'metadata.saved': 'true'}]});
        return[customers, charges, subscriptions, user, devices];
    } else {
		this.ready();
	}
});

Meteor.publish("publish_for_admin_give_form", function () {
    if (Roles.userIsInRole(this.userId, ['admin'])) {

        var customers = Customers.find({});
        var devices = Devices.find({});
        return[customers, devices];

    } else {

        // user not authorized. do not publish
        this.stop();
        return;

    }
});

Meteor.publish("userSubscriptions", function () {
    if (this.userId) {
        var customers = Customers.find({'metadata.user_id': this.userId});
        var subscriptions = [];
        customers.forEach(function(element) {
            console.log(element.id);
            subscriptions.push(Subscriptions.find({customer: element.id}));
        });
        return subscriptions;
    }else {
		this.ready();
	}
});

Meteor.publish("userDT", function (page) {
	if (this.userId) {
        if(Meteor.users.findOne({_id: this.userId}).persona_id) {
            var persona_ids = Meteor.users.findOne({_id: this.userId}).persona_id;
            console.log(persona_ids);
            return DT_donations.find({persona_id: {$in: persona_ids}});
        } else {
            var persona_ids = [];
            var persona_info = Meteor.users.findOne({_id: this.userId}).persona_info;
            persona_info.forEach(function (value) {
                persona_ids.push(value.id);
            });
            console.log(persona_ids);
            return DT_donations.find( { persona_id: { $in: persona_ids } } );
        }
	} else {
		this.ready();
	}
});

Meteor.publish("userDTFunds", function () {
    if (this.userId) {
        return DT_funds.find();
    } else {
        this.ready();
    }
});

Meteor.publish("DTSources", function () {
    return DT_sources.find();
});

Meteor.publish("OTRDTSources2015", function () {
    return DT_sources.find({'name': {$regex : /^OTR\s-\s2015\s-\s/}});
});


Meteor.publish("MultiConfig", function () {
  return MultiConfig.find();
});

/*
Meteor.publish("userGivingFocus", function () {
	//var donation_ids = Meteor.users.findOne({_id: this.userId}).donations;
	//var donations = Donations.find({'_id': { $in: donation_ids}});
	var sub = this;
	var pipeline = ([{$group : {  _id: '$donateTo', total : {$sum : "$total_amount"}, count: { $sum: 1 }}},
		{$sort: {total: -1}},
		{$project : { '_id' : 0, 'donateTo' : '$_id', 'total' : '$total', 'count' : '$count'}},
		{$limit: 1} ]);

	var result = Donations.aggregate(pipeline);
	console.dir(result);

	*/
/*self = this;
	var aggregated_donations = Donations.aggregate([
		{$group : {  _id: this.donateTo, total : {$sum : "$total_amount"}, count: { $sum: 1 }}},
		{$sort: {total: -1}},
		{$project : { '_id' : 0, 'donateTo' : '$_id', 'total' : '$total', 'count' : '$count'}},
		{$limit: 1} ]).result[0]
	console.dir(aggregated_donations);*//*

	if (this.userId) {
		var giving_id = Client_collection_giving.insert({donateTo: result[0].donateTo, total: result[0].total, count: result[0].count });
		return Client_collection_giving.find(giving_id);
	} else {
		this.ready();
	}
});*/
