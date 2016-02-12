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

Meteor.publish("userDonations", function () {
	if (this.userId) {
    var donations = Meteor.users.findOne({_id: this.userId}).donations;
    return Donations.find({'_id': { $in: donations}});
	} else {
    this.stop();
    return;
	}
});

Meteor.publish("subscription", function (subscription_id) {
  //Check the subscription_id that came from the client
  check(subscription_id, String);

	if (this.userId) {
    return Subscriptions.find({'_id': subscription_id});
	} else {
    this.stop();
    return;
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
    this.stop();
    return;
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
  } else {
    this.stop();
    return;
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
    this.stop();
    return;
	}
});

Meteor.publish("user_data_and_subscriptions_with_only_4", function () {
  if (this.userId) {
    console.log("Started publish function, user_data_and_subscriptions_with_only_4");
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
    this.stop();
    return;
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
  } else {
    this.stop();
    return;
	}
});

Meteor.publish("userDT", function (page) {
	if (this.userId) {
    if(Meteor.users.findOne({_id: this.userId}).persona_ids) {
      var persona_ids = Meteor.users.findOne({_id: this.userId}).persona_ids;
      console.log(persona_ids);
      return DT_donations.find({persona_id: {$in: persona_ids}});
    } else if(Meteor.users.findOne({_id: this.userId}).persona_id) {
      var persona_id = Meteor.users.findOne( { _id: this.userId } ).persona_id;
      console.log( persona_id );
      return DT_donations.find( { persona_id: { $in: persona_id } } );
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
    this.stop();
    return;
	}
});

Meteor.publish("userDTFunds", function () {
  if (this.userId) {
    return DT_funds.find({});
  } else {
    this.stop();
    return;
  }
});

Meteor.publish("DTSources", function () {
    return DT_sources.find();
});

Meteor.publish("Serve1000Sources2015", function () {
  return DT_sources.find({'name': {$regex : /^Serve\s1000\s-\s/}});
});


Meteor.publish("MultiConfig", function () {
  if (Roles.userIsInRole(this.userId, 'admin')) {
    return MultiConfig.find();
  } else {
    this.stop();
    return;
  }
});

Meteor.publish("DTSplits", function () {
  if (Roles.userIsInRole(this.userId, 'admin')) {
    return DT_splits.find();
  } else {
    this.stop();
    return;
  }
});

Meteor.publish("transfers", function (id) {
  check(id, Match.Optional(String));
  if (Roles.userIsInRole(this.userId, ['admin', 'dt-admin', 'reports'])) {
    if(id){
      return Transfers.find({_id: id});
    } else {
      return Transfers.find({}, { sort: { date: -1} } );
    }
  } else {
    this.stop();
    return;
  }
});


Meteor.publish("transfersRange", function (range) {
  check(range, {
    start:   Match.Optional( String ),
    end:   Match.Optional( String )
  });

  if (Roles.userIsInRole(this.userId, ['admin', 'dt-admin', 'reports'])) {

    if(range && range.start){
      let transferStart = Number(moment(new Date(range.start)).format('X'));
      let transferEnd = Number(moment(new Date(range.end)).format('X'));

      console.log(transferStart);
      console.log(transferEnd);

      return Transfers.find({$and: [{ date: { $lte: transferEnd } }, { date: { $gte: transferStart } }]}, {
        sort: { date: -1 }
      });
    } else {
      return Transfers.find({},
        { sort: { date: -1 } }
      );
    }
  } else {
    this.stop();
    return;
  }
});


Meteor.publish("adminSubscriptions", function (_id) {
  check(_id, Match.Optional(String));
  console.log("Got to adminSubscriptions sub");
  let subscriptions;

  if (Roles.userIsInRole(this.userId, ['admin', 'dt-admin'])) {
    if(_id) {
      subscriptions = Subscriptions.find({_id: _id}, {$or: [{status: 'active'}, {status: 'trialing'}]});
    } else {
      subscriptions = Subscriptions.find({$or: [{status: 'active'}, {status: 'trialing'}]});
    }
    return subscriptions;
  } else {
    this.stop();
    return;
  }
});
