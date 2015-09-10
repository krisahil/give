Template.Progress.helpers({
  maxProgress: function() {
   return 999;
  }
});

Template.Progress.onRendered(function () {
  var currentServed = 425;

  Meteor.call("ShowDTSplits", function (err, result){
    if(!err) {
      // Going with a static number
      // currentServed = result.toFixed(0);
      console.log("Got a result from the server: " + result);
    } else {
      console.log("Error in meteor call");
    }
  });
  if(Session.get('params.note')) {

    var clock = $('.serve1000-counter').FlipClock(000, {
      clockFace: 'Counter',
      autoStart: false
    });

    var max = 1000,
      time = (2500 / max) * 5,
      value = 0;
    clock.setTime( 0 );

    var loading = function () {
      value += 1;

      clock.increment();

      if( value >= currentServed ) {
        clearInterval( animate );
      }
    };

    var animate = setInterval( function () {
      loading();
    }, time );

  }
});