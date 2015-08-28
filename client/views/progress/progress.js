Template.Progress.helpers({
  maxProgress: function() {
   return 999;
  }
});

Template.Progress.onRendered(function () {
  var clock = $('.serve1000-counter').FlipClock(100, {
    clockFace: 'Counter',
    autoStart: false
  });
  if(Session.get('params.note')) {
    //var progressbar = $('progress'),
      var max = 1000,
      time = (500/max)*5,
      value = 0;
    clock.setTime(0);

    var loading = function() {
      value += 1;
      //addValue = progressbar.val(value);

      //$('.progress-value').html(value + ' Children Served');
      clock.increment();

      if (value === 411) {
        clearInterval(animate);
      }
    };

    var animate = setInterval(function() {
      loading();
    }, time);
  }



  /*setTimeout(function() {
    setInterval(function() {
      clock.increment();
    }, 1000);
  });*/
});