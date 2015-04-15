/*****************************************************************************/
/* Client App Namespace  */
/*****************************************************************************/
_.extend(App, {
    process_give_form: function(quick_form){
        var form = {};
        if(quick_form){
            var user_cursor = Meteor.user();
            var business_name;
            if(user_cursor.profile.business_name){
                business_name = user_cursor.profile.business_name;
            } else {
                business_name = '';
            }

            form = {
                "paymentInformation": {
                    "amount": parseInt(($('#amount').val().replace(/[^\d\.\-\ ]/g, '')) * 100),
                    "total_amount": parseInt(($('#total_amount').val() * 100).toFixed(0)),
                    "donateTo": $("#donateTo").val(),
                    "writeIn": $("#enteredWriteInValue").val(),
                    "donateWith": $('#donateWith').val(),
                    "is_recurring": $('#is_recurring').val(),
                    "coverTheFees": $('#coverTheFees').is(":checked"),
                    "created_at": moment().format('MM/DD/YYYY, hh:mm'),
                    "start_date": moment(new Date($('#start_date').val())).format('X'),
                    "saved": $('#save_payment').is(":checked")
                },
                "customer": {
                    "fname": user_cursor.profile.fname,
                    "lname": user_cursor.profile.lname,
                    "org": business_name,
                    "email_address": user_cursor.emails[0].address,
                    "phone_number": user_cursor.profile.phone,
                    "address_line1": user_cursor.profile.address.address_line1,
                    "address_line2": user_cursor.profile.address.address_line2,
                    "region": user_cursor.profile.address.state,
                    "city": user_cursor.profile.address.city,
                    "postal_code": user_cursor.profile.address.postal_code,
                    "country": user_cursor.profile.address.country
                },
                "URL": document.URL,
                sessionId: Meteor.default_connection._lastSessionId
            };
        } else{
            form = {
                "paymentInformation": {
                    "amount": parseInt(($('#amount').val().replace(/[^\d\.\-\ ]/g, '')) * 100),
                    "total_amount": parseInt(($('#total_amount').val() * 100).toFixed(0)),
                    "donateTo": $("#donateTo").val(),
                    "writeIn": $("#enteredWriteInValue").val(),
                    "donateWith": $("#donateWith").val(),
                    "is_recurring": $('#is_recurring').val(),
                    "coverTheFees": $('#coverTheFees').is(":checked"),
                    "created_at": moment().format('MM/DD/YYYY, hh:mm'),
                    "start_date": moment(new Date($('#start_date').val())).format('X'),
                    "saved": $('#save_payment').is(":checked")
                },
                "customer": {
                    "fname": $('#fname').val(),
                    "lname": $('#lname').val(),
                    "org": $('#org').val(),
                    "email_address": $('#email_address').val(),
                    "phone_number": $('#phone').val(),
                    "address_line1": $('#address_line1').val(),
                    "address_line2": $('#address_line2').val(),
                    "region": $('#region').val(),
                    "city": $('#city').val(),
                    "postal_code": $('#postal_code').val(),
                    "country": $('#country').val(),
                    "created_at": moment().format('MM/DD/YYYY, hh:mma')
                },
                "URL": document.URL,
                sessionId: Meteor.default_connection._lastSessionId
            };
        }


        form.paymentInformation.later = (!moment(new Date($('#start_date').val())).isSame(Date.now(), 'day'));
        if(!form.paymentInformation.later){
            form.paymentInformation.start_date = 'today';
        }

        if (form.paymentInformation.total_amount !== form.paymentInformation.amount) {
            form.paymentInformation.fees = (form.paymentInformation.total_amount - form.paymentInformation.amount);
        }

        if (form.paymentInformation.donateWith === "Card") {
            form.paymentInformation.type = "card";
            form.customer.created_at =  moment().format('MM/DD/YYYY, hh:mma');
            var card_info = {};
            if(quick_form){
                card_info = {
                    name: user_cursor.profile.fname + ' ' + user_cursor.profile.lname,
                    number: $('#card_number').val(),
                    cvc: $('#cvv').val(),
                    exp_month: $('#expiry_month').val(),
                    exp_year: $('#expiry_year').val(),
                    address_line1: user_cursor.profile.address.address_line1,
                    address_line2: user_cursor.profile.address.address_line2,
                    address_city: user_cursor.profile.address.city,
                    address_state: user_cursor.profile.address.state,
                    address_country: user_cursor.profile.address.country,
                    address_zip: user_cursor.profile.address.postal_code
                };
            } else{
                card_info = {
                    name: $('#fname').val() + ' ' + $('#lname').val(),
                    number: $('#card_number').val(),
                    cvc: $('#cvv').val(),
                    exp_month: $('#expiry_month').val(),
                    exp_year: $('#expiry_year').val(),
                    address_line1: $('#address_line1').val(),
                    address_line2: $('#address_line2').val(),
                    address_city: $('#city').val(),
                    address_state: $('#region').val(),
                    address_zip: $('#postal_code').val(),
                    address_country: $('#country').val()
                };
            }

            App.process_card(card_info, form);

        } else if(form.paymentInformation.donateWith === "Check") {
            form.paymentInformation.type = "check";
            form.customer.created_at =  moment().format('MM/DD/YYYY, hh:mma');
            var bank_info = {};
            if(quick_form){
                bank_info = {
                    name: user_cursor.profile.fname + ' ' + user_cursor.profile.lname,
                    account_number: $('#account_number').val(),
                    routing_number: $('#routing_number').val(),
                    address_line1: user_cursor.profile.address.address_line1,
                    address_line2: user_cursor.profile.address.address_line2,
                    address_city: user_cursor.profile.address.city,
                    address_state: user_cursor.profile.address.state,
                    address_zip: user_cursor.profile.address.postal_code,
                    country: user_cursor.profile.address.country
                };
            } else{
                bank_info = {
                    name: $('#fname').val() + ' ' + $('#lname').val(),
                    account_number: $('#account_number').val(),
                    routing_number: $('#routing_number').val(),
                    address_line1: $('#address_line1').val(),
                    address_line2: $('#address_line2').val(),
                    address_city: $('#city').val(),
                    address_state: $('#region').val(),
                    address_zip: $('#postal_code').val(),
                    country: $('#country').val()
                };
            }
            App.process_bank(bank_info, form);
        } else{
            //TODO: process the gift with a saved device
            console.log("Process with saved device");
            form.paymentInformation.saved = true;
            var payment = {id: form.paymentInformation.donateWith};
            if(form.paymentInformation.donateWith.slice(0,3) === 'car'){
                form.paymentInformation.type = 'card';
            } else if(form.paymentInformation.donateWith.slice(0,3) === 'ban'){
                form.paymentInformation.type = 'check';
            }
            form.paymentInformation.source_id = form.paymentInformation.donateWith;
            form.customer.id = Devices.findOne({_id: form.paymentInformation.donateWith}).customer;
            var created_at = Customers.findOne({_id: form.customer.id}).created;

            form.customer.created_at = moment(created_at*1000).format('MM/DD/YYYY, hh:mma');
            App.handleCalls(payment, form);
        }
    },
    //This is the callback for the client side tokenization of cards and bank_accounts.
    handleCalls: function(payment, form) {
        // payment is the token returned from Stripe
        console.dir(payment);
        form.paymentInformation.token_id = payment.id;
        Meteor.call('stripeDonation', form, function (error, result) {
            if (error) {
                //App.handleErrors is used to check the returned error and the display a user friendly message about what happened that caused
                //the error.
                App.handleErrors(error);
                //run App.updateTotal so that when the user resubmits the form the total_amount field won't be blank.
                App.updateTotal();
            } else {
                console.dir(result);
                if ( result.error ) {
                    var send_error = {code: result.error, message: result.message};
                    App.handleErrors(send_error);
                    //run App.updateTotal so that when the user resubmits the form the total_amount field won't be blank.
                    App.updateTotal();
                } else if(result.charge === 'scheduled'){
                    // Send the user to the scheduled page and include the frequency and the amount in the url for displaying to them
                    Router.go('/scheduled/?frequency=' + form.paymentInformation.is_recurring + '&amount=' + form.paymentInformation.amount/100 + '&start_date=' + form.paymentInformation.start_date );
                }else{
                    Router.go('/thanks?c=' + result.c + "&don=" + result.don + "&charge=" + result.charge);
                }
            }
        });
    },
    // this function is used to update the displayed total
    // since we can take payment with card fees added in this is needed to update the
    // amount that is shown to the user and passed as total_amount through the form
    //display error modal if there is an error while initially submitting data from the form.
    handleErrors: function(error) {
        spinner.stop();
        $("#spinDiv").hide();
        console.dir(error);

        var gatherInfo = {};
        Session.set("loaded", true);
        if(error.type === "invalid_request_error"){
            gatherInfo.browser = navigator.userAgent;

            $('#modal_for_initial_donation_error').modal({show: true});
            $(".modal-dialog").css("z-index", "1500");
            $('#errorCategory').html(error.type);
            $('#errorDescription').html(error.message);
            return;
        }
        if(error.message === "Your card's security code is invalid."){

            gatherInfo.browser = navigator.userAgent;

            $('#modal_for_initial_donation_error').modal({show: true});
            $(".modal-dialog").css("z-index", "1500");
            $('#errorCategory').html(error.error);
            $('#errorDescription').html(error.reason);
            return;
        } else{
            $('#modal_for_initial_donation_error').modal({show: true});
            $(".modal-dialog").css("z-index", "1500");
            $('#errorCategory').html(error.error);
            $('#errorDescription').html(error.reason);
            return;
        }
    },
    process_card: function (card_info, form){
        Stripe.card.createToken(card_info,  function(status, response){
            if (response.error) {
                //error logic here
                App.handleErrors(response.error);
            } else {
                // Call your backend
                if(form){
                    console.log(form.paymentInformation.start_date);
                    form.paymentInformation.source_id = response.card.id;
                    console.dir(response);
                    App.handleCalls(response, form);
                } else{
                    console.dir(response);
                    return response;
                }
            }
        });
    },
    process_bank: function (bank_info, form){
        Stripe.bankAccount.createToken(bank_info,  function(status, response){
            if (response.error) {
                //error logic here
                App.handleErrors(response.error);
            } else {
                // Call your backend
                if(form){
                    console.log(form.paymentInformation.start_date);
                    form.paymentInformation.source_id = response.bank_account.id;
                    console.dir(response);
                    App.handleCalls(response, form);
                } else{
                    console.dir(response);
                    return response;
                }
            }
        });
    },
    updateTotal: function () {
        var data = Session.get('paymentMethod');
        var donationAmount = $('#amount').val();
        donationAmount = donationAmount.replace(/[^\d\.\-\ ]/g, '');
        donationAmount = donationAmount.replace(/^0+/, '');
        if (data === 'Check') {
            if ($.isNumeric(donationAmount)) {
                $("#total_amount").val(donationAmount);
                $("#show_total").hide();
                $("#total_amount_display").text("$" + donationAmount).css({
                    'color': '#34495e'
                });
                return Session.set("total_amount", $("#total_amount").val());
            } else {
                return $("#total_amount_display").text("Please enter a number in the amount field.").css({
                    'color': 'red'
                });
            }
        } else {
            if (donationAmount < 1 && $.isNumeric(donationAmount)) {
                return $("#total_amount_display").text("Amount cannot be lower than $1.").css({
                    'color': 'red'
                });
            } else {
                if ($.isNumeric(donationAmount)) {
                    if ($('#coverTheFees').prop('checked')) {
                        $("#show_total").show();
                        Session.set("coverTheFees", true);
                        var fee = (donationAmount * 0.029 + 0.30).toFixed(2);
                        var roundedAmount = (+donationAmount + (+fee)).toFixed(2);
                        $("#total_amount_display").text(" + $" + fee + " = $" + roundedAmount).css({
                            'color': '#34495e'
                        });
                        $("#total_amount").val(roundedAmount);
                        return Session.set("amount", roundedAmount);
                    } else {
                        Session.set("coverTheFees", false);
                        $("#total_amount").val(donationAmount);
                        $("#show_total").hide();
                        return $("#total_amount_display").text("").css({
                            'color': '#34495e'
                        });
                    }
                } else {
                    return $("#total_amount_display").text("Please enter a number in the amount field").css({
                        'color': 'red'
                    });
                }
            }
        }
    },
    fillForm: function(form) {
        if(form === 'main'){
            if (Session.get("paymentMethod") === "Check") {
                $('#routing_number').val("111000025"); // Invalid test =  fail after initial screen =  valid test = 111000025
                $('#account_number').val("000123456789"); // Invalid test =  fail after initial screen =  valid test = 000123456789
            } else {
                $('#card_number').val("4242424242424242");
                //Succeeded = 4242424242424242 Failed = 4242111111111111 AMEX = 378282246310005
                // Fail after connection to customer succeeds = 4000000000000341
                $('#expiry_month option').prop('selected', false).filter('[value=12]').prop('selected', true);
                $('select#expiry_month').change();
                $('#expiry_year option').prop('selected', false).filter('[value=2015]').prop('selected', true);
                $('select#expiry_year').change();
                $('#cvv').val("123"); //CVV mismatch = 200
            }
            $('#fname').val("John");
            $('#lname').val("Doe");
            $('#org').val("");
            $('#email_address').val("josh@trashmountain.org");
            $('#email_address_verify').val('josh@trashmountain.org');
            $('#phone').val("(785) 246-6845");
            $('#address_line1').val("Address Line 1");
            $('#address_line2').val("Address Line 2");
            $('#city').val("Topeka");
            $('#region').val("KS");
            $('#postal_code').val("66618");
            $('#amount').val("1.03");
        } else{
            if (Session.get("paymentMethod") === "Check") {
                $('#routing_number').val("111000025"); // Invalid test =  fail after initial screen =  valid test = 111000025
                $('#account_number').val("000123456789"); // Invalid test =  fail after initial screen =  valid test = 000123456789
            } else {
                $('#card_number').val("4242424242424242"); //Succeeded = 4242424242424242 Failed = 4242111111111111 AMEX = 378282246310005
                $('#expiry_month option').prop('selected', false).filter('[value=12]').prop('selected', true);
                $('select#expiry_month').change();
                $('#expiry_year option').prop('selected', false).filter('[value=2015]').prop('selected', true);
                $('select#expiry_year').change();
                $('#cvv').val("123"); //CVV mismatch = 200
            }
            $('#amount').val("1.03");
        }
    }
});

App.helpers = {
};

_.each(App.helpers, function (helper, key) {
  UI.registerHelper(key, helper);
});

UI.registerHelper('formatTime', function(context, options) {
  if(context)
    return moment(context).format('MM/DD/YYYY, hh:mm');
});

UI.registerHelper('shortIt', function(stringToShorten, maxCharsAmount){
  if(stringToShorten.length <= maxCharsAmount){
    return stringToShorten;
  }
  return stringToShorten.substring(0, maxCharsAmount);
});

UI.registerHelper('twoDecimalPlaces', function(stringToAddDecimal){
  return parseFloat(Math.round(stringToAddDecimal) / 100).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
});

UI.registerHelper('formatDate', function(context, options) {
    if(context)
        return moment(context).format('MMM DD, YYYY');
});

UI.registerHelper('logged_in', function(context) {
    if(Meteor.user()){
        switch(context){
            case "fname":
                return Meteor.user().profile.fname;
                break;
            case "lname":
                return Meteor.user().profile.lname;
                break;
            case "email":
                return Meteor.user().emails[0].address;
                break;
            case "line1":
                return Meteor.user().profile.address.line1;
                break;
            case "line2":
                return Meteor.user().profile.address.line2;
                break;
            case "city":
                return Meteor.user().profile.address.city;
                break;
            case "state":
                return Meteor.user().profile.address.state;
                break;
            case "postal_code":
                return Meteor.user().profile.address.postal_code;
                break;
            case "phone":
                return Meteor.user().profile.phone;
                break;
            case "business_name":
                if(Meteor.user().profile.business_name){
                    return  Meteor.user().profile.business_name;
                }
                break;
            default:
                return;
        }
    }
    else{
        return;
    }
});

/*
 * Epoch to String
 * Convert a UNIX epoch string to human readable time.
 */

UI.registerHelper('epochToString', function(timestamp){
    if (timestamp){
        var length = timestamp.toString().length;
        if ( length == 10 ) {
            return moment.unix(timestamp).format("MMMM Do, YYYY");
        } else {
            return moment.unix(timestamp / 1000).format("MMMM Do, YYYY");
        }
    }
});

/*
 * If Equals
 * Take the two passed values and compare them, returning true if they're equal
 * and false if they're not.
 */

UI.registerHelper('equals', function(c1,c2){
    // If case1 is equal to case2, return true, else false.
    return c1 == c2 ? true : false;
});

/*
 * Cents to Dollars
 * Take the passed value in cents and convert it to USD.
 */

UI.registerHelper('centsToDollars', function(cents){
    return "$" + cents / 100;
});

/*
 * Percentage
 * Take the two passed values, divide them, and multiply by 100 to return percentage.
 */

UI.registerHelper('percentage', function(v1,v2){
    return ( parseInt(v1) / parseInt(v2) ) * 100 + "%";
});

/*
 * Capitalize
 * Take the passed string and capitalize it. Helpful for when we're pulling
 * data out of the database that's stored in lowercase.
 */

UI.registerHelper('capitalize', function(string){
    if (string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
});

/*
 * Limit String
 * Return the proper string based on the number of lists.
 */

UI.registerHelper('limitString', function(limit){
    return limit > 1 ? limit + " lists" : limit + " list";
});

/*
 * Plan
 * Get the current subscription data for our user. We set this up as a UI helper
 * because we'll need to reference this information more than once.
 */

UI.registerHelper('plan', function(){
    // Get the current user.
    var user = Meteor.userId(),
        plan = Session.get('currentUserPlan_' + user);
    // If we have a user, call to checkUserPlan on the server to determine
    // their current plan. We do this so that we don't have to publish the user's
    // subscription data to the client.
    if ( user ) {
        Meteor.call('checkUserPlan', user, function(error, response){
            if (error) {
                alert(error.reason);
            } else {
                // Get the response from the server and set it equal to the user's
                // unique session variable (this will be either true or false).
                Session.set('currentUserPlan_' + user, response);
            }
        });
    }
    // Return the result of the method being called.
    return plan;
});

/*
 * Current Route
 * Return an active class if the currentRoute session variable name
 * (set in the appropriate file in /client/routes/) is equal to the name passed
 * to the helper in the template.
 */

UI.registerHelper('currentRoute', function(route){
    return Session.equals('currentRoute', route) ? 'active' : '';
});

UI.registerHelper('MeteorUser', function(){
    if(Meteor.user()){
        return true;
    } else{
        return false;
    }
});