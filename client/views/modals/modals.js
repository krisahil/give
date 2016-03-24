function removeParam(key, sourceURL) {
  // check that the query string contains a '?', if it doesn't then the router
  // will try to take the user to a different page.
  if (Session.get("params.donateTo"))
    if (sourceURL.split("?").length < 2) {
      sourceURL = sourceURL + '?placeholder=';
    }
  console.log(key, sourceURL);
  var rtn = sourceURL.split("?")[0],
    param,
    params_arr = [],
    queryString = (sourceURL.indexOf("?") !== -1) ? sourceURL.split("?")[1] : "";
  if (queryString !== "") {
    params_arr = queryString.split("&");
    for (var i = params_arr.length - 1; i >= 0; i -= 1) {
      param = params_arr[i].split("=")[0];
      if (param === key) {
        params_arr.splice(i, 1);
      }
    }
    rtn = rtn + "?" + params_arr.join("&");
  }
  return rtn;
}

Template.Modals.events({
  'click #write_in_save': function() {
    $('#modal_for_write_in').modal('hide');

    removeParam('enteredWriteInValue', window.location.href);
    var goHere = removeParam('donateTo', window.location.href);
    console.log(goHere);
    Session.set('showWriteIn', 'no');
    goHere = goHere + '&enteredWriteInValue=' + $('#writeIn').val() + '&donateTo=WriteIn';
    Router.go(goHere);
    $('#giftDesignationText').show();
    $('[name="donateTo"]').val("WriteIn");
  }
});

Template.Modals.helpers({
  contact_address: function() {
    return Meteor.settings.public.contact_address;
  },
  support_address: function() {
    return Meteor.settings.public.support_address;
  },
  churchSources: function() {
    return [
      {
        "name": "Fellowship Bible Church",
        "city": "Topeka, KS"
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
        "name": "Journey Church",
        "city": "Topeka, KS"
      },
      {
        "name": "Western Hills Church",
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
    ];
  }
});

Template.Modals.onRendered( function() {
  $('select').select2({dropdownCssClass: 'dropdown-inverse'});
  $("#options").select2('destroy');

  $('#options').chosen({width: "95%"});

  $('#modal_for_serve1000').on('hidden.bs.modal', function() {
    var currentServed = 577;
    Meteor.call("ShowDTSplits", function(err, result) {
      if(!err) {
        // Going with a static number
        // currentServed = result.toFixed(0);
        console.log("Got a result from the server: " + result);
      } else {
        console.log("Error in meteor call");
      }
    });
    var clock = $('.serve1000-counter').FlipClock('000', {
      clockFace: 'Counter',
      autoStart: false
    });

    var max = 1000,
      time = (2500 / max) * 5,
      value = 0;
    clock.setTime( 0 );

    var loading = function() {
      value += 1;

      clock.increment();

      if ( value >= currentServed ) {
        clearInterval( animate );
      }
    };

    var animate = setInterval( function () {
      loading();
    }, time );

  });
});
