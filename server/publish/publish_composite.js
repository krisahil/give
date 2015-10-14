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
                  customer: 1
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
            }
          ]
        }
      ]
    }
  } else {
    this.ready();
  }
});