Meteor.publishComposite('transactions', function (transfer_id) {
  check(transfer_id, Match.Optional(String));
  if (Roles.userIsInRole(this.userId, ['admin', 'dt-admin', 'reports'])) {
    return {
      find:     function () {
        return Transactions.find( {
          $and: [{ transfer_id: transfer_id }, { type: { $ne: 'transfer' } }]
        } );
      },
      children: [
        {
          find:     function ( transactions ) {
            if(transactions.source.slice(0,3) === 'pyr'){
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

Meteor.publishComposite('subscriptions_and_customers', function () {

  // Publish the nearly expired or expired card data to the admin dashboard
  if (Roles.userIsInRole(this.userId, ['admin', 'dt-admin', 'reports'])) {
    return {
      find:     function () {
        // Find posts made by user. Note arguments for callback function
        // being used in query.
        return Subscriptions.find( {
          $or: [
            { status: 'active' },
            { status: 'trialing' }
          ]
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
