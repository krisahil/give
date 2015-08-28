/*****************************************************************************/
/* Modals: Event Handlers and Helpersss .js*/
/*****************************************************************************/
Template.Modals.helpers({
  contact_address: function () {
    return Meteor.settings.public.contact_address;
  },
  support_address: function () {
    return Meteor.settings.public.support_address;
  },
  churchSources: function () {
    return [
      {
        "name": "New Community Christian Church",
        "city": "Salina, KS"
      },
      {
        "name": "The Heights Church",
        "city": "Spokane, WA"
      },
      {
        "name": "Topeka Bible Church",
        "city": "Topeka, KS"
      },
      {
        "name": "Fountain Springs Church",
        "city": "Rapid City, SD"
      },
      {
        "name": "Gracepoint Church",
        "city": "Topeka, KS"
      },
      {
        "name": "Gracepoint Church North",
        "city": "Topeka, KS"
      },
      {
        "name": "Western Hills Church",
        "city": "Topeka, KS"
      },
      {
        "name": "Fellowship Bible Church",
        "city": "Topeka, KS"
      },
      {
        "name": "Church On The Hill",
        "city": "Dundee, FL"
      },
      {
       "name": "Ridgepoint Church Winter",
       "city": "Haven, FL"
      },
      {
        "name": "A Mailer"
      },
      {
        "name": "Other"
      }
    ]
  }
});

Template.Modals.onRendered( function() {
  $('select').select2({dropdownCssClass: 'dropdown-inverse'});
  $("#options").select2('destroy');

  $('#options').chosen({width: "95%"});

  $('#modal_for_serve1000').on('hidden.bs.modal', function () {
    var clock = $('.serve1000-counter').FlipClock(000, {
      clockFace: 'Counter',
      autoStart: false
    });
    if(Session.get('params.note')) {
      //var progressbar = $('progress'),
      var max = 1000,
        time = (500 / max) * 5,
        value = 0;
      clock.setTime( 0 );

      var loading = function () {
        value += 1;
        //addValue = progressbar.val(value);

        //$('.progress-value').html(value + ' Children Served');
        clock.increment();

        if( value === 411 ) {
          clearInterval( animate );
        }
      };

      var animate = setInterval( function () {
        loading();
      }, time );
    }
  });

});
