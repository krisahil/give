Template.GiveDropdownGroup.rendered = function() {
    $('select').select2({dropdownCssClass: 'dropdown-inverse'});

    // show the datepicker if the frequency is monthly when the page loads
    if(Session.equals('params.recurring', 'monthly')){
        $('#calendarSection').show();
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
}

Template.GiveDropdownGroup.helpers({
    give_home: function() {
        return true;
    },
    today: function() {
        return moment().format('D MMM, YYYY');
    },
    device: function(){
        return Devices.find();
    },
    brand: function(){
        if(this.brand){
            return this.brand;
        } else{
            return 'Bank Acct';
        }
    }
});

Template.GiveDropdownGroup.events({
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
    }
});