_.extend(Evts,{
	controller: function(body) {
		var type = Object.keys(body.events[0].entity)[0];
		logger.info("Type is equal to: " + type);
		if(type === "debits"){
			logger.info("Inside controller and debits area");
			var status 		=			body.events[0].entity[type][0].status;
			var id 			= 			body.events[0].entity.debits[0].id;
			var amount 		=			body.events[0].entity.debits[0].amount;
			var billy 		= 			body.events[0].entity.debits[0].meta['billy.transaction_guid'] !== undefined;
			var subscription_guid;
			var trans_guid;
			var invoice_guid;
			if (billy) {
				invoice_guid = 				Evts.get_invoice_guid(body.events[0].entity[type][0].description);
				var subscription_guid = 	Evts.getBillySubscriptionGUID(invoice_guid);
				trans_guid = 				body.events[0].entity.debits[0].meta['billy.transaction_guid'];
				console.log("trans_guid: " + trans_guid);
			}

			var select_type = 	body.events[0].type;
			select_type 	=	Evts.select_type(select_type);

			logger.info("Received an event of type: " + select_type);

			//Send to the appropriate function based on the type received from Balanced
			var run_event = Evts[select_type](id, billy, trans_guid, subscription_guid, invoice_guid, status, amount, body);
 		} else{
            logger.info("************* Received an event and didn't do anything with it.");
        }
	},
	debit_created: function(id, billy, trans_guid, subscription_guid, invoice_guid, status, amount, body){
		logger.info("Inside debit_created with debit ID: " + id);
		logger.info("Checking to see if this debit ID exists in the collection");
		var check_for_existing_debit = Evts.check_for_debit(id, 'debit_created', body, billy, trans_guid, subscription_guid);
		var send_email = Utils.send_donation_email(billy, id, trans_guid, subscription_guid, amount, 'created');
	},
	debit_failed: function(id, billy, trans_guid, subscription_guid, invoice_guid, status, amount, body){
		if(billy){
			//Utils.send_donation_email(billy, id, subscription_guid, amount, 'failed');
			// TODO: need to get this working, not sure how to test this though. Also, it usually fails many times, so only send one email.
		}
		//Evts.update_email_collection(id, 'failed'); //also, this doesn't go here, need to send the update from within Mandrill
		//Utils.failed_collection_update(billy, 'debits', id, null, body);
		//TODO: need to figure out what needs to be done here (if anything)
	},
	debit_succeeded: function(id, billy, trans_guid, subscription_guid, invoice_guid, status, amount, body){
		var stored_amount;
		if(Debits.findOne(id)){
			stored_amount = Debits.findOne(id).amount;
            console.log("stored_amount = " + stored_amount + " event amount = " + amount);
			if(stored_amount === amount) {
				if(amount >= 50000){
					Utils.send_donation_email(billy, id, trans_guid, subscription_guid, amount, 'large_gift');
				}
				Utils.send_donation_email(billy, id, trans_guid, subscription_guid, amount, 'succeeded');
				Utils.credit_order(billy, id);
				if(billy){
					Evts.addTrans_Invoice(trans_guid, subscription_guid, invoice_guid);
				}
			} else{
				logger.error("The amount from the received event and the amount of the debit do not match!");
			}
		} else{
			logger.info("Didn't find the Debit, starting the setTimeout to wait for the initial creation event to be processed.")
			Meteor.setTimeout(function(){
				if(!Debits.findOne({_id: id})){
					logger.error("Still couldn't find the Debit, which seems to indicate that the debit.created event didn't create this Debit.");
					logger.error("It might be that there was no subscription to be found, and so the Debit couldn't be created.");
					logger.error("Check for this subscription in Billy: " + subscription_guid);
					return;
				}
				stored_amount = Debits.findOne(id).amount;
				if(stored_amount === amount) {
					if(amount >= 50000){
						Utils.send_donation_email(billy, id, trans_guid, subscription_guid, amount, 'large_gift');
					}
					Utils.send_donation_email(billy, id, trans_guid, subscription_guid, amount, 'succeeded');
					Utils.credit_order(billy, id);
					if(billy){
						Evts.addTrans_Invoice(trans_guid, subscription_guid, invoice_guid);
					}
				} else{
					logger.error("The amount from the received event and the amount of the debit do not match!");
				}
			}, 30000);
		}
	},
	select_type: function(type) {
		return (type).replace(/\./g, '_');
	},
	get_donate_with: function(customer_cursor, source){
		var donateWith;
		if(source.slice(0,2) === 'CC'){
			var card = _.findWhere(customer_cursor.cards, {id: source});
			return card.brand + ", ending in " + card.number.slice(-4);
		} else if (source.slice(0,2) === 'BA'){
			var bank_account = _.findWhere(customer_cursor.bank_accounts, {id: source});
			return bank_account.bank_name +  ", ending in " + bank_account.account_number.slice(-4);
		}
	},
	update_email_collection: function (id, type) {
		if(type === 'created'){
			Emails.update({balanced_debit_id: id}, {
				$set: {
					'created.sent': true,
					'created.time': new Date()
				}},
				{
					upsert: true
				}
			);
		} else if (type === 'succeeded') {
			Emails.update({balanced_debit_id: id}, {
				$set: {
					'succeeded.sent': true,
					'succeeded.time': new Date()
				}},
				{
					upsert: true
				}
			);
		} else if (type === 'large_gift') {
			Emails.update({balanced_debit_id: id}, {
				$set: {
					'large_gift.sent': true,
					'large_gift.time': new Date()
				}},
				{
					upsert: true
				}
			);
		}
	},
	check_for_debit: function (id, type, body, billy, trans_guid, subscription_guid) {
		console.log("Inside of check_for_debit");
		if (Debits.findOne({_id: id})) {
			logger.info("Found this debit id in the Debits colleciton, proceeding normally with the debit_created operations");
			return 1;
		} else if(billy){
			console.log("Subscription guid is " + subscription_guid);
			var insert_debit = {};

			if(Donations.findOne({'subscriptions.guid': subscription_guid})){
				logger.info("Found this donation subscription_guid in the Donations colleciton");
				insert_debit.donation_id = Donations.findOne({'subscriptions.guid': subscription_guid})._id;
				insert_debit.transaction_guid = trans_guid;
				delete insert_debit.meta;
				insert_debit._id = id;

				//Insert object into debits collection and get the _id
				Debits.insert(insert_debit);
			}else {
				Convert.start_conversion(id, type, body, billy, trans_guid, subscription_guid);
			}
		} else {
			var insert_this_debit = body.events[0].entity.debits[0];
			insert_this_debit._id = id;
			insert_this_debit.transaction_guid = trans_guid;
			var insert_body = Debits.insert(insert_this_debit);
			return insert_body;
		}
	},
	get_invoice_guid: function(description) {
		logger.info("Started get_invoice_guid");
		return (("" + description).replace(/[\s-]+$/, '').split(/[\s-]/).pop());
	},
	getBillySubscriptionGUID: function(invoiceID){
		logger.info("Inside getBillySubscriptionGUID");

		var invoice = HTTP.get("https://billy.balancedpayments.com/v1/invoices/" + invoiceID, {
			auth: Meteor.settings.billy_key + ':'
		});

		var subscription_guid = invoice.data.subscription_guid;
		logger.info("Got the subscription_guid: " + subscription_guid);

		return subscription_guid;
	},
	addTrans_Invoice: function(trans_guid, subscription_guid, invoice_guid){
		//TODO: check for existence first
		var invoice = Evts.getInvoice(invoice_guid);
		Donations.update({'subscriptions.guid': subscription_guid}, {
			$push: {
				'invoices': invoice
			}
		});
		var transaction = Evts.getTrans(trans_guid);
		Donations.update({'subscriptions.guid': subscription_guid}, {
			$push: {
				'transactions': transaction
			}
		});
	},
	getTrans: function(transaction_guid){
		var transaction = HTTP.get("https://billy.balancedpayments.com/v1/transactions/" + transaction_guid, {
			auth: Meteor.settings.billy_key + ':'
		}).data;
		return transaction;
	},
	getInvoice: function(invoice_guid){
		var invoice = HTTP.get("https://billy.balancedpayments.com/v1/invoices/" + invoice_guid, {
			auth: Meteor.settings.billy_key + ':'
		}).data;
		return invoice;
	}
});