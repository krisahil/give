/* DonationForm: Event Handlers and Helpers */
/*****************************************************************************/

Template.DonationForm.events({
    'submit form': function(e) {
        //prevent the default reaction to submitting this form
        e.preventDefault();
        // Stop propagation prevents the form from being submitted more than once.
        e.stopPropagation();

        if($("#is_recurring").val() === ''){
            $("#s2id_is_recurring").children().addClass("redText");
            $.fn.scrollView = function () {
                return this.each(function () {
                    $('html, body').animate({
                        scrollTop: $(this).offset().top
                    }, 1000);
                });
            };
            $('#spinContainer').scrollView();
            return;
        }

        var opts = {color: '#FFF', length: 60, width: 10, lines: 8};
        var target = document.getElementById('spinContainer');
        spinnerObject = new Spinner(opts).spin(target);

        if($('#donateWith').val() === 'Card'){
            if(!Stripe.card.validateExpiry($('#expiry_month').val(), $('#expiry_year').val())){
                var new_error = {reason: "The card expiration date you gave is either today or a day in the past.", error: "Expiration Date"}
                App.handleErrors(new_error);
                return;
            } else if(!Stripe.card.validateCardNumber($('#card_number').val())){
                var new_error = {reason: "The card number doesn't look right, please double check the number.", error: "Card Number Problem"}
                App.handleErrors(new_error);
                return;
            }
        }

        $.fn.scrollView = function () {
            return this.each(function () {
                $('html, body').animate({
                    scrollTop: $(this).offset().top
                }, 1000);
            });
        };
        $('#spinContainer').scrollView();
        $("#spinDiv").show();

        $(window).off('beforeunload');

        App.updateTotal();

        App.process_give_form();

    },
    'change #is_recurring': function() {
        if ($("#is_recurring").val() !== 'one_time') {
            Session.set('recurring', true);
            $('#calendarSection').show();
            $("#s2id_is_recurring").children().removeClass("redText");
        } else {
            Session.set('recurring', false);
            $('#calendarSection').hide();
            $("#s2id_is_recurring").children().removeClass("redText");
        }
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
        var selectedValue = $("[name=donateWith]").val();
        Session.set("paymentMethod", selectedValue);
        if(Session.equals("paymentMethod", "Check")){
            App.updateTotal();
            $("#show_total").hide();
        }
    },
    'change #donateTo': function() {
        if($('#donateTo').val() !== 'WriteIn') {
            $('#giftDesignationText').hide();
        } else {
            Session.set('showWriteIn', 'yes');
            Session.set('params.donateTo', 'WriteIn');
            //setup modal for entering give toward information
            $('#modal_for_write_in').modal({
                show: true,
                backdrop: 'static'
            }, function(e) {
            });
        }
    },
    // keypress input detection for autofilling form with test data
    'keypress input': function(e) {
        if (e.which === 17) { //17 is ctrl + q
            App.fillForm('main');
        }
    },
    'focus, blur #cvv': function(e) {
        $('#cvv').on('mousewheel.disableScroll', function(e) {
            e.preventDefault();
        });
    },
    'focus, blur #card_number': function(e) {
        $('#card_number').on('mousewheel.disableScroll', function(e) {
            e.preventDefault();
        });
    },
    'click #write_in_save': function (e) {
        $('#modal_for_write_in').modal('hide');
        function removeParam(key, sourceURL) {
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
        var goHere = removeParam('enteredWriteInValue', window.location.href);
        console.log(goHere);
        Session.set('showWriteIn', 'no');
        var goHere = goHere + '&enteredWriteInValue=' + $('#writeIn').val();
        Router.go(goHere);
        $('#giftDesignationText').show();
    },
    'blur #donation_form input': function (e){
        // TODO: remove this area and use iron-router instead.
        // http://stackoverflow.com/questions/24367914/aborting-navigation-with-meteor-iron-router
        if(document.URL !== "http://127.0.0.1:3000/give/user"){
            $(window).on('beforeunload', function(){
                return "It looks like you have input you haven't submitted."
            });
        }
    },
    'click #userProfileButton': function (e){
        //prevent the default reaction to submitting this form
        e.preventDefault();
        // Stop propagation prevents the form from being submitted more than once.
        e.stopPropagation();
        Router.go('user.profile');
    }

});
Template.DonationForm.helpers({
    paymentQuestionIcon: function(){
        if(Session.equals('paymentMethod', 'Check')){
            return "<i class='makeRightOfInput fa fa-question-circle' id='accountTypeQuestion' data-toggle='popover' " +
                "data-trigger='hover focus' data-container='body' data-content='There are usually 3 sets of "+
                "numbers at the bottom of a check. The short check number, the 9 digit routing number and the" +
                "account number.'>" +
                "</i>";
        } else {
            return "<i class='makeRightOfInput fa fa-question-circle' id='accountTypeQuestion' data-toggle='popover' " +
                "data-trigger='hover focus' data-container='body' data-content='" +
                "Visa®, Mastercard®, and Discover® cardholders: " +
                "Turn your card over and look at the signature box. You should see either the entire 16-digit credit " +
                "card number or just the last four digits followed by a special 3-digit code. This 3-digit code is " +
                "your CVV number / Card Security Code.  " +
                "American Express® cardholders: " +
                "Look for the 4-digit code printed on the front of your card just above and to the right of your " +
                "main credit card number. This 4-digit code is your Card Identification Number (CID). The CID is the " +
                "four-digit code printed just above the Account Number.'" +
                "</i>";
        }

    },
    paymentWithCard: function() {
        return Session.equals("paymentMethod", "Card");
    },
    coverTheFeesChecked: function() {
        return this.coverTheFees ? 'checked' : '';
    },
    attributes_Input_Amount: function() {
        return {
            name: "amount",
            id: "amount",
            min: 1,
            required: true
        };
    },
    errorCategory: function() {
        return 'Error Category';
    },
    errorDescription: function() {
        return 'Error Description';
    },
    amount: function() {
        return Session.get('params.amount');
    },
    writeInValue: function () {
        return Session.get('params.enteredWriteInValue');
    },
    dt_source: function () {
        return Session.get('params.dt_source');
    },
    today: function () {
        return moment().format('D MMM, YYYY');
    },
    amountWidth: function() {
        if(Session.equals("paymentMethod", "Card")){
            return 'form-group col-md-4 col-sm-4 col-xs-12';
        } else{
            return 'form-group';
        }
    },
    showTotal: function() {
       return Session.equals("coverTheFees", true);
    },
    checkedFeeWidth: function(){
        if(Session.equals("coverTheFees", true)){
            return "form-group";
        } else return "form-group";
    }
});
/*****************************************************************************/
/* DonationForm: Lifecycle Hooks */
/*****************************************************************************/
Template.DonationForm.destroyed = function() {

};
Template.DonationForm.rendered = function() {
    // Setup parsley form validation
    $('#donation_form').parsley();

    //Set the checkboxes to unchecked
    $(':checkbox').radiocheck('uncheck');

    $('[data-toggle="popover"]').popover({html: true});

    // show the datepicker if the frequency is monthly when the page loads
    if(Session.equals('params.recurring', 'monthly')){
        $('#calendarSection').show();
    }
    //setup modal for entering give toward information
    if (Session.equals('params.donateTo', 'WriteIn') && !(Session.equals('showWriteIn', 'no'))) {
        $('#modal_for_write_in').modal({
            show: true,
            backdrop: 'static'
        });
    }

    var datepickerSelector = $('#start_date');
    datepickerSelector.datepicker({
        showOtherMonths: true,
        selectOtherMonths: true,
        dateFormat: 'd MM, yy',
        minDate: 0,
        maxDate: +32
    }).prev('.input-group-btn').on('click', function (e) {
        e && e.preventDefault();
        datepickerSelector.focus();
    });
    $.extend($.datepicker, { _checkOffset: function (inst,offset,isFixed) { return offset; } });

    // Now let's align datepicker with the prepend button
    datepickerSelector.datepicker('widget').css({ 'margin-left': -datepickerSelector.prev('.input-group-btn').find('.btn').outerWidth() + 5 });


};
Template.checkPaymentInformation.helpers({
    attributes_Input_AccountNumber: function() {
        return {
            type: "text",
            id: "account_number",
            placeholder: "Bank Account Number",
            required: true
        };
    },
    attributes_Input_RoutingNumber: function() {
        return {
            type: "text",
            id: "routing_number",
            placeholder: "Routing numbers are 9 digits long",
            required: true
        };
    }
});
//Check Payment Template mods
Template.checkPaymentInformation.rendered = function() {
    $('[data-toggle="popover"]').popover();
    $("#routing_number").mask("999999999");

    $('select').select2({dropdownCssClass: 'dropdown-inverse'});
};
//Card Payment Template mods
Template.cardPaymentInformation.rendered = function() {
    $('[data-toggle="popover"]').popover();
    $('select').select2({dropdownCssClass: 'dropdown-inverse'});

    if (Session.get('params.exp_month')) {
        $("#expiry_month").val(Session.get('params.exp_month'));
    }

    if (Session.get('params.exp_year')) {
        $("#expiry_year").val(Session.get('params.exp_year'));
    }
};