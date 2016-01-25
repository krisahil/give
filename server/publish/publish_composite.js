Meteor.publishComposite('transactions', function (transfer_id) {
  check(transfer_id, Match.Optional(String));
  if (Roles.userIsInRole(this.userId, 'admin') || Roles.userIsInRole(this.userId, 'reports')) {
    return {
      find:     function () {
        // Find posts made by user. Note arguments for callback function
        // being used in query.
        return Transactions.find( {
          $and: [{ transfer_id: transfer_id }, { type: { $ne: 'transfer' } }]
        } );
      },
      children: [
        {
          find:     function ( transactions ) {
            // Find post author. Even though we only want to return
            // one record here, we use "find" instead of "findOne"
            // since this function should return a cursor.
            return Charges.find(
              { _id: transactions.source },
              {
                limit:  1,
                fields: {
                  metadata: 1,
                  customer: 1,
                  created: 1,
                  payment_source: 1,
                  source: 1,
                  refunded: 1
                }
              } );
          },
          children: [
            {
              find: function ( charges ) {
                // Find user that authored comment.
                return Customers.find(
                  { _id: charges.customer },
                  {
                    limit:  1,
                    fields: {
                      email:    1,
                      metadata: 1
                    }
                  } );
              }
            },
            {
              find: function ( charges ) {
                // Find user that authored comment.
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

Meteor.publishComposite('expiring_cards', function () {

  // Publish the nearly expired or expired card data to the admin dashboard
  if (Roles.userIsInRole(this.userId, 'admin') || Roles.userIsInRole(this.userId, 'reports')) {
    return {
      find:     function () {
        // Find posts made by user. Note arguments for callback function
        // being used in query.
        return Subscriptions.find( { status: "active" } );
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
                  sources:        1
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