Template.Progress.helpers({
  maxProgress: function() {
   return 999;
  }
});

Template.Progress.onRendered(function () {
  var progressbar = $('progress'),
    max = progressbar.attr('max'),
    time = (1000/max)*60,
    value = progressbar.val();

  var loading = function() {
    value += 1;
    addValue = progressbar.val(value);

    $('.progress-value').html(value + ' Children Sponsored');

    if (value === 400) {
      clearInterval(animate);
    }
  };

  var animate = setInterval(function() {
    loading();
  }, time);
});