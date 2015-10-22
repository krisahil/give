/*****************************************************************************/
/* StripeTransferDetails: Event Handlers */
/*****************************************************************************/
Template.StripeTransferDetails.events({
  'click .previous': function () {
    console.log("clicked previous with: " + this.id);
    Meteor.call("get_next_or_previous_transfer", this.id, 'starting_after', function (err, result) {
      if(err) {
        console.error(err);
        Bert.alert("Nothing older", "danger");
      } else {
        console.log(result);
        Router.go("/transfers/" + result);
      }
    });
  },
  'click .next': function () {
    console.log("clicked next with: " + this.id);
    Meteor.call("get_next_or_previous_transfer", this.id, 'ending_before', function (err, result) {
      if(err) {
        console.error(err);
        Bert.alert("Nothing newer", "danger");
      } else {
        console.log(result);
        Router.go("/transfers/" + result);
      }
    });
  }
});

/*****************************************************************************/
/* StripeReports: Helpers */
/*****************************************************************************/
Template.StripeTransferDetails.helpers({
  transfer: function () {
    return Transfers.findOne();
  },
  transactions: function () {
    return Transactions.find();
  },
  customers: function () {
    let charge = Charges.findOne({_id: this.source});
    return Customers.findOne({_id: charge.customer});
  },
  charges: function () {
    return Charges.findOne({_id: this.source});
  },
  name: function () {
    if(this.metadata.business_name){
      return this.metadata.business_name;
    } else {
      return this.metadata.fname + " " + this.metadata.lname;
    }
  },
  ach_or_card: function () {
    if(this.source && this.source.object === 'bank_account'){
      return "ACH";
    } else if(this.payment_source && this.payment_source.object === 'bank_account') {
      return "ACH";
    } else {
      return "Card"
    }
  },
  fees_covered: function () {
    if(this.metadata.coveredTheFees === 'false' || !this.metadata.coveredTheFees) {
      return '';
    } else {
      return 'checked';
    }
  },
  total_fees: function () {
    // TODO: need to probably write a method call that gets each of the charges associated with this transfer,
    // then totals them and sends that total back here. Or, you could do this when the
    // transfer is inserted into the collection and then put that total into the metadata of the transfer
    let transactions = Transactions.find().fetch();
    let total = 0;
    transactions.forEach(function (each_transactions){
      total += each_transactions.fee;
    });
    return total;
  },
  dt_source: function () {
    if(this.metadata.dt_source) {
      return DT_sources.findOne( { _id: this.metadata.dt_source } ).name;
    } else {
      return;
    }
  },
  retrieve_dt_names: function () {
    let self = this;
    if(!Session.get(this.metadata.dt_persona_id)) {
      var persona_id = DT_donations.findOne({'transaction_id': self._id}).persona_id;
        Meteor.call( "get_dt_name", persona_id, function ( err, result ) {
          if( err ) {
            console.error( err );
          } else {
            console.log( result );
            Session.set( self.metadata.dt_persona_id, result.recognition_name );
          }
        } )
    }
  },
  dt_names: function () {
    let persona_name = Session.get(this.metadata.dt_persona_id);
    if(persona_name){
      return persona_name;
    } else {
      return;
    }
  },
  transfer_date: function () {
    let timestamp = this.date;
    return moment.utc(timestamp, 'X').format("MMMM Do, YYYY");
  }
});

/*****************************************************************************/
/* StripeReports: Lifecycle Hooks */
/*****************************************************************************/
Template.StripeTransferDetails.onCreated(function () {
});

Template.StripeTransferDetails.onRendered(function () {
});

Template.StripeTransferDetails.onDestroyed(function () {
});
