/*****************************************************************************/
/* DonateIndex Publish Functions
/*****************************************************************************/

Meteor.publish('donate', function (input) {
	 return Donate.find({_id: input}, {fields: {
		 credit: 0,
		 order: 0,
		 sessionId: 0,
		 viewable: 0,
		 card_holds: 0,
		 created_at: 0,
		 'bank_account.fingerprint': 0,
		 'bank_account.href': 0,
		 'bank_account.id': 0,
		 'bank_account.routing_number': 0,
		 'bank_account.can_credit': 0,
		 'bank_account.can_debit': 0
	 }});
});

Meteor.publish('donate_list', function () {
	//check to see that the user is the admin user
	 if(this.userId === Meteor.settings.admin_user){
	 	return Donate.find({viewable: true});
	 }else{
	 	return '';
	 }
});

Meteor.publish('give_report', function (start_date, finish_date) {
	//check to see that the user is the admin user
	if(this.userId === Meteor.settings.admin_user){
		start_date = moment(Date.parse(start_date)).format('YYYY-MM-DD').slice(0,10);
		finish_date = moment(Date.parse(finish_date)).format('YYYY-MM-DD').slice(0,10);

		return Donate.find( { 'transactions.created_at' : { $gte: start_date, $lte : finish_date } }, { 'transactions' : true } );

	}else{
		return '';
	}

});

Meteor.publish('card_expiring', function () {
	//check to see that the user is the admin user
	if(this.userId === Meteor.settings.admin_user){
		var today = new Date();
		var future_date = new Date(new Date(today).setMonth(today.getMonth()+3));
		return Donate.find( { $and : [ {'card.expires' : {$lte : future_date }}, { isRecurring: true}] }, { card : true } );
	}else{
		return '';
	}
});
