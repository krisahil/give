Template.Progress.helpers({
  maxProgress: function() {
   return 999;
  }
});

Template.Progress.onRendered(function () {
  if(Session.get('params.note')) {
    var progressbar = $('progress'),
      max = progressbar.attr('max'),
      time = (500/max)*5,
      value = progressbar.val();

    var loading = function() {
      value += 1;
      addValue = progressbar.val(value);

      $('.progress-value').html(value + ' Children Sponsored');

      if (value === 350) {
        clearInterval(animate);
      }
    };

    var animate = setInterval(function() {
      loading();
    }, time);
  }
});