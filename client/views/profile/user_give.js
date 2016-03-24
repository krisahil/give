var giveTutorialSteps = [
  {
    template: Template.tutorial_give_step1,
    onLoad: function() {
      console.log("The tutorial has started!");
    },
    spot: ".quick-give-form"
  },
  {
    template: Template.tutorial_give_step2,
    spot: "#save_payment, #save_payment_question"
  },
  {
    template: Template.tutorial_give_step3,
    spot: ".donateWithDiv"
  },
  {
    template: Template.tutorial_give_step4
  }
];

Template.UserGive.helpers({
  paymentWithCard: function() {
    return Session.equals("UserPaymentMethod", "Card");
  },
  paymentWithCheck: function() {
    return Session.equals("UserPaymentMethod", "Check");
  },
  attributes_Input_Amount: function() {
    return {
      name: "amount",
      id: "amount",
      min: 1,
      required: true
    };
  },
  amountWidth: function() {
    if (Session.equals("paymentMethod", "Card") || Session.get("paymentMethod") && Session.get("paymentMethod").slice(0,3) === 'car'){
      return 'form-group col-md-4 col-sm-4 col-xs-12';
    } else if (Session.equals("paymentMethod", "Check")) {
      return 'form-group';
    }
    return 'form-group';
  },
  savedDevice: function() {
    return Session.equals("savedDevice", "Card");
  },
  amount: function() {
    return Session.get('params.amount');
  },
  options: {
    id: "giveTutorial",
    steps: giveTutorialSteps,
    onFinish: function() {
      Meteor.setTimeout( function() {
        Session.set('tutorialEnabled', false);
      }, 1000);
    }
  }
});

Template.UserGive.events({
  'submit form': function(e) {
    // prevent the default reaction to submitting this form
    e.preventDefault();
    // Stop propagation prevents the form from being submitted more than once.
    e.stopPropagation();
    console.log("Got here");

    $("[name='submitQuickGive']").button('loading');
    Session.set("loading", true);

    $(window).off('beforeunload');

    App.updateTotal();

    if (Session.get("savedDevice", "Check") || Session.get("savedDevice", "Card")) {
      let usingDevice = Devices.findOne({_id: Session.get("paymentMethod")});
      let customer = Customers.findOne({_id: usingDevice.customer});
      App.process_give_form(true, customer._id);
    } else {
      App.process_give_form(true);
    }
  },
  'keyup, change #amount': _.debounce(function() {
    return App.updateTotal();
  }, 300),
    // disable mousewheel on a input number field when in focus
    // (to prevent Chromium browsers change of the value when scrolling)
  'focus #amount': function(e) {
    $('#amount').on('mousewheel.disableScroll', function(e) {
      e.preventDefault();
    });
  },
  'blur #amount': function(e) {
    $('#amount').on('mousewheel.disableScroll', function(e) {
      e.preventDefault();
    });
    return App.updateTotal();
  },
  'change #coverTheFees': function() {
    return App.updateTotal();
  },
  'change [name=donateWith]': function() {
    var selectedValue = $("#donateWith").val();
    Session.set("paymentMethod", selectedValue);
    if (selectedValue === 'Check') {
      Session.set("savedDevice", false);
      App.updateTotal();
      $("#show_total").hide();
    } else if (selectedValue === 'Card') {
      Session.set("savedDevice", false);
      App.updateTotal();
    } else if (selectedValue.slice(0,3) === 'car') {
      Session.set("savedDevice", 'Card');
    } else {
      Session.set("savedDevice", 'Check');
    }
  },
  // keypress input detection for autofilling form with test data
  'keypress input': function(e) {
    if (e.which === 17) { //17 is ctrl + q
      App.fillForm();
    }
  }
});

Template.UserGive.onRendered(function () {
  if(Roles.userIsInRole(Meteor.userId(), 'no-dt-person')) {
    Router.go("Dashboard");
  }

  $('[data-toggle="popover"]').popover();

  // setup modal for entering give toward information
  if (Session.equals('params.donateTo', 'WriteIn') && !(Session.equals('showWriteIn', 'no'))) {
    $('#modal_for_write_in').modal({
      show: true,
      backdrop: 'static'
    });
  }

  if (Session.get("params.enteredWriteInValue")) {
    $('#giftDesignationText').show();
  }
  // setup modal for entering serve1000 church information
  var campaignSession = Session.get('params.campaign');

  // Regex for "Serve 1000 - "
  var re = /^Serve\s1000/;

  if (re.exec(campaignSession) && !(Session.equals('showserve1000', 'no')) &&
    !Session.get("params.note")) {
    $('#modal_for_serve1000').modal({
      show: true,
      backdrop: 'static'
    });
  }

});

Template.UserGive.onDestroyed( function() {
  $(window).unbind('beforeunload');
});
