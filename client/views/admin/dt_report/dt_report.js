/*****************************************************************************/
/* DtReport: Event Handlers */
/*****************************************************************************/
Template.DtReport.events({
  'click #get-dt-data': function (e) {
    e.preventDefault();
    console.log("Got to click event");

    var getDataButton   = $("#get-dt-data").button('loading');
    Meteor.call("GetDTData", moment().subtract($('#numberOfDays' ).val(), 'days').format('MMM+DD+YYYY'), moment().format('MMM+DD+YYYY'), function ( error, result ) {
      if(!error) {
        getDataButton.button("reset");

        // output this to the site
        // put this in a place where a javascript get request could pull in this number
        // from Squarespace

        //TODO: two functions should exist for updating this number
        //first: one for updating short term.
        //this function should store a date of last "quick-data-pull"
        //and then only pull data since that pull
        //or just process the split each time a gift is given (to CS), make it part of that flow
        //second: pull 30 days of history, in case Gayla makes a change to a previous donation


        console.dir(result);
        Bert.alert("Got the DT split Data successfully.", "success");
      } else {
        getDataButton.button("reset");
        console.dir(error);
        Bert.alert("That didn't work...", "danger");
      }
    });

  },
  'click #show-dt-split': function ( e ) {
    var showDataButton   = $("#show-dt-split").button('loading');
    // use these to total the groups a-c for sub-results base on 1 month.

    Meteor.call("ShowDTSplits", function ( error, result ) {
      if(!error) {
        showDataButton.button("reset");

        console.dir(result);

        Bert.alert("Got the DT split Data successfully.", "success");
      } else {
        showDataButton.button("reset");
        console.dir(error);
        Bert.alert("That didn't work...", "danger");
      }
    });
  }
});

/*****************************************************************************/
/* DtReport: Helpers */
/*****************************************************************************/
Template.DtReport.helpers({
  memoType: function () {
    //TODO: how to spit out the different memo types here
    //return DT_splits.find({memo: 'annual'});
  },
  totalFunds: function ( ) {

  },
  groupResult: function () {

  },
  kidsServed: function () {

  },
  totalOfGroups: function () {
    /*var totalAmount = 0.0;
    $("#splitsTable td.kidsServed").each ( function(){
      var currentAmount = parseFloat ( $(this).text());
      // if your td text contains $ symbol at the beginning you can do like this
      //var currentAmount = parseFloat ( $(this).text().substring(1));
      totalAmount += currentAmount;
    });

    return totalAmount;*/

  }
});