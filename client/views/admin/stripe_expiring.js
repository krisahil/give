Template.StripeExpiring.helpers({
    customers: function () {
      let customers =  Customers.find();

      var returnThisValue = [];
      customers.forEach(function(entry) {
        if( entry.sources.data[0].object === 'card' ) {
          var today = new Date();
          var future_date = new Date( new Date( today ).setMonth( today.getMonth() + 3 ) );
          let expires = moment( new Date( entry.sources.data[0].exp_month + '/01/' + entry.sources.data[0].exp_year ) );
          if( expires <= future_date ) {
            returnThisValue.push( entry );
          }
        }
      });
      return returnThisValue;
    }
});

Template.StripeExpiring.onRendered(function () {
    $('.datatable').dataTable( {
        "columnDefs": [
            { className: "details-control", "targets": [ 0 ] }
        ],
        "bFilter": false
    });

    //order by the date field
    $('#mainTable').dataTable().api().order(2, 'asc').draw();
});
