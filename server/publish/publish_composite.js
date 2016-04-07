Meteor.publishComposite('transactions', function (transfer_id) {
  check(transfer_id, Match.Optional(String));
  if (Roles.userIsInRole(this.userId, ['admin', 'manager'])) {
    return {
      find:     function () {
        return Transactions.find( {
          $and: [{ transfer_id: transfer_id }, { type: { $ne: 'transfer' } }]
        } );
      },
      children: [
        {
          find:     function ( transactions ) {
            if(transactions.source.slice(0,3) === 'pyr' || transactions.source.slice(0,3) === 're_'){
              return Refunds.find(
                { _id: transactions.source },
                {
                  limit:  1,
                  fields: {
                    id: 1,
                    object: 1,
                    created: 1,
                    charge: 1,
                    'charge.id': 1,
                    'charge.metadata': 1,
                    'charge.customer': 1,
                    'charge.created': 1,
                    'charge.payment_source': 1,
                    'charge.source': 1,
                    'charge.refunded': 1,
                    'charge.refunds': 1,
                    description: 1
                  }
                } );
            } else {
              return Charges.find(
                { _id: transactions.source },
                {
                  limit:  1,
                  fields: {
                    id: 1,
                    object: 1,
                    metadata: 1,
                    customer: 1,
                    created: 1,
                    payment_source: 1,
                    source: 1,
                    refunded: 1,
                    refunds: 1,
                    status: 1
                  }
                } );
            }
          },
          children: [
            {
              find: function ( charges ) {
                if(charges.object === 'refund'){
                  let customer = Customers.find(
                    { _id: charges.charge.customer },
                    {
                      limit:  1,
                      fields: {
                        id: 1,
                        email:    1,
                        metadata: 1
                      }
                    } ).fetch();
                  return Customers.find(
                    { _id: charges.charge.customer },
                    {
                      limit:  1,
                      fields: {
                        id: 1,
                        email:    1,
                        metadata: 1
                      }
                    } );
                } else {
                  return Customers.find(
                    { _id: charges.customer },
                    {
                      limit:  1,
                      fields: {
                        id: 1,
                        email:    1,
                        metadata: 1
                      }
                    } );
                }
              }
            },
            {
              find: function ( charges ) {
                return DT_donations.find(
                  { transaction_id: charges._id },
                  {
                    limit:  1,
                    fields: {
                      persona_id:       1,
                      transaction_id:   1
                    }
                  } );
              }
            }
          ]
        }
      ]
    }
  } else {
    this.stop();
    return;
  }
});

Meteor.publishComposite('subscriptions_and_customers', function (searchValue) {
  check(searchValue, Match.Optional(String));

  // Publish the nearly expired or expired card data to the admin dashboard
  if (Roles.userIsInRole(this.userId, ['admin', 'manager'])) {
    console.log(searchValue);
    if(!searchValue){
      return;
    }

    return {
      find: function () {
        // Find posts made by user. Note arguments for callback function
        // being used in query.
        return Subscriptions.find( {
          $and: [{
            $or: [
              { status: 'active' },
              { status: 'trialing' },
              { status: 'past_due' }
            ]
          }, {
            $or: [
              {
                'metadata.fname': {
                $regex: searchValue, $options: 'i'
                }
              },
              {
                'metadata.lname': {
                  $regex: searchValue, $options: 'i'
                }
              },
              {
                'metadata.business_name': {
                  $regex:   searchValue,
                  $options: 'i'
                }
              },
              {
                'metadata.email': {
                  $regex:   searchValue,
                  $options: 'i'
                }
              }
            ]
          }]
        } );
      },
      children: [
        {
          find: function ( subscriptions ) {
            // Find post author. Even though we only want to return
            // one record here, we use "find" instead of "findOne"
            // since this function should return a cursor.
            return Customers.find(
              { _id: subscriptions.customer },
              {
                limit:  1,
                fields: {
                  metadata:       1,
                  default_source: 1,
                  default_source_type: 1,
                  sources: 1,
                  subscriptions: 1
                }
              } );
          }
        }
      ]
    }
  } else {
    this.stop();
    return;
  }
});

Meteor.publishComposite('ach', function () {

  // Publish the nearly expired or expired card data to the admin dashboard
  if (Roles.userIsInRole(this.userId, ['admin'])) {

    return {
      find: function () {
        return Donations.find({
          $and: [
            {
              method: "manualACH"
            }, {
              $or: [
                { status: 'pending' },
                { status: 'failed' }
              ]
            }
          ]
        });
      },
      children: [
        {
          find: function ( donations ) {
            // Find post author. Even though we only want to return
            // one record here, we use "find" instead of "findOne"
            // since this function should return a cursor.
            return Customers.find({ _id: donations.customer_id});
          }
        },
        {
          find: function ( donations ) {
            // Find post author. Even though we only want to return
            // one record here, we use "find" instead of "findOne"
            // since this function should return a cursor.
            return BankAccounts.find({ _id: donations.source_id});
          }
        }
      ]
    }
  } else {
    this.stop();
    return;
  }
});
