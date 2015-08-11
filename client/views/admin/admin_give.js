
Template.AdminGive.onRendered(function () {

    if($('#donateWith option').length > 2){
        $('#donateWith').val($('#donateWith option').eq(2).val());
        if($('#donateWith').val().slice(0,3) === 'car'){
            Session.set("savedDevice", "Card");
            Session.set("paymentMethod", $('#donateWith option').eq(2).val());
        } else if($('#donateWith').val().slice(0,3) === 'ban'){
            Session.set("savedDevice", "Check");
            Session.set("paymentMethod", $('#donateWith option').eq(2).val());
        }
    } else if(Session.get('params.donateWith')){
        Session.set("paymentMethod", Session.get('params.donateWith'));
    }

    if($('#donateWith').val() === 'Card'){
        Session.set("paymentMethod", "Card");
    } else if($('#donateWith').val() === 'Check'){
        Session.set("paymentMethod", "Check");
    }
    // Setup parsley form validation
    $('#quick_give').parsley();

    $("#spinDiv").hide();

    _.each(_.uniq(_.pluck($("select[name='donateWith'] > option")
        .get(), 'text')), function(name) { $("select[name='donateWith'] > option:contains(" + name + ")")
        .not(":first").remove(); });

    $('#donateWith').change();

});

Template.AdminGive.helpers({
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
            type: "digits",
            min: 1,
            required: true
        };
    },
    amountWidth: function() {
        if(Session.equals("paymentMethod", "Card") || Session.get("paymentMethod") && Session.get("paymentMethod").slice(0,3) === 'car'){
            return 'form-group col-md-4 col-sm-4 col-xs-12';
        } else if(Session.equals("paymentMethod", "Check")){
            return 'form-group';
        } else{
            return 'form-group';
        }
    },
    savedDevice: function() {
        return Session.equals("savedDevice", "Card");
    },
    amount: function() {
        return Session.get('params.amount');
    }
});

Template.AdminGive.events({
    'submit form': function(e) {
        //prevent the default reaction to submitting this form
        e.preventDefault();
        // Stop propagation prevents the form from being submitted more than once.
        e.stopPropagation();

        var opts = {color: '#FFF', length: 60, width: 10, lines: 8};
        var target = document.getElementById('spinContainer');
        spinnerObject = new Spinner(opts).spin(target);

        $("#spinDiv").show();

        $(window).off('beforeunload');

        var customer = Devices.findOne({_id: $('#donateWith').val()}).customer;
        App.updateTotal();

        App.process_give_form(true, customer);
    },
    'keyup, change #amount': function() {
        return App.updateTotal();
    },
    // disable mousewheel on a input number field when in focus
    // (to prevent Chromium browsers change of the value when scrolling)
    'focus #amount': function(e, tmpl) {
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
        if(selectedValue === 'Check'){
            Session.set("savedDevice", false);
            App.updateTotal();
            $("#show_total").hide();
        } else if(selectedValue === 'Card'){
            Session.set("savedDevice", false);
            App.updateTotal();
        } else if(selectedValue.slice(0,3) === 'car'){
            Session.set("savedDevice", 'Card');
        } else{
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