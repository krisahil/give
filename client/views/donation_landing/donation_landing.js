Template.DonationLanding.helpers({

});

Template.DonationLanding.events({
    'click #where_most_needed_description': function (e) {
        e.preventDefault();
        console.log("Clicked where_most_needed_description");
        $('#GiveTo').ddslick('select', {index: '0' });
    },
    'click #operations_description': function (e) {
        e.preventDefault();
        console.log("Clicked operations_description");
        $('#GiveTo').ddslick('select', {index: '1' });
    },
    'click #missionary_description': function (e) {
        e.preventDefault();
        console.log("Clicked missionary_description");
        $('#GiveTo').ddslick('select', {index: '2' });
    },
    'click #field_projects_description': function (e) {
        e.preventDefault();
        console.log("Clicked field_projects_description");
        $('#GiveTo').ddslick('select', {index: '3' });
    },
    'click #community_sponsorship_description': function (e) {
        e.preventDefault();
        console.log("Clicked community_sponsorship_description");
        $('#GiveTo').ddslick('select', {index: '4' });
    },
    'click #trip_description': function (e) {
        e.preventDefault();
        console.log("Clicked trip_description");
        $('#GiveTo').ddslick('select', {index: '5' });
    },
    'click #other_ways_to_give': function (e) {
        e.preventDefault();
        $('#modal_for_other_ways_to_give').modal({
            show: true,
            backdrop: 'static'
        });
    },

    'click #cardButton': function(e) {
        e.preventDefault();
        console.log("You clicked the card button");
        var placeholder_value = $('#placeholder_donate_input').val();
        if (placeholder_value === '#depends-on-Missionary' && $('#depends-on-Missionary').val() === "") {
            $('#depends-on-Missionary > .dd-select').addClass("red-border");
            alert("Please select a missionary");
            return false;
        } else {
            if (placeholder_value === '') {
                $('[name="donateWith"]').val('Card');
                if($('#GiveTo').val() === '1'){
                    $('[name="donateTo"]').val('WhereMostNeeded');
                }
            } else {
                $('[name="donateTo"]').val($(placeholder_value).val());
                $('[name="donateWith"]').val('Card');
            }
            Router.go('/?'+$("#landing_form").serialize());
        }
    },
    'click #checkButton': function(e) {
        e.preventDefault();
        var placeholder_value = $('#placeholder_donate_input').val();
        if (placeholder_value === '#depends-on-Missionary' && $('#depends-on-Missionary').val() === "") {
            $('#depends-on-Missionary > .dd-select').addClass("red-border");
            alert("Please select a missionary");
            return false;
        } else {
            if (placeholder_value === '') {
                $('[name="donateWith"]').val('Check');
                if($('#GiveTo').val() === '1'){
                    $('[name="donateTo"]').val('WhereMostNeeded');
                }
            } else {
                $('[name="donateTo"]').val($(placeholder_value).val());
                $('[name="donateWith"]').val('Check');
            }
            Router.go('/?'+$("#landing_form").serialize());
        }
    }
});

Template.DonationLanding.onRendered(function () {
    //Dropdown plugin data for GiveTo
    var GiveTo = [{
        text: "Wherever It's Needed Most",
        value: '1',
        selected: true,
        description: ""
    }, {
        text: "TMP's Operations Expenses",
        value: '2',
        selected: false,
        description: ""
    }, {
        text: "TMP Missionary",
        value: '3',
        selected: false,
        description: ""
    }, {
        text: "International Field Projects",
        value: '4',
        selected: false,
        description: ""
    }, {
        text: "Community Sponsorship",
        value: '5',
        selected: false,
        description: ""
    }, {
        text: "I want to write in a different designation, or give to a trip participant.",
        value: '6',
        selected: false,
        description: ""
    }];
    //Dropdown plugin data
    var Missionary = [{
        text: "Choose a missionary",
        value: "",
        selected: true
    }, {
        text: "Brett Durbin",
        value: "BrettDurbin",
        selected: false,
        description: "Executive Director",
        imageSrc: "/images/team/Brett.jpg"
    }, {
        text: "Russ West",
        value: "RussellWest",
        selected: false,
        description: "Strategy Impact Officer",
        imageSrc: "/images/team/Russ.jpg"
    }, {
        text: "Chris Mammoliti",
        value: "ChrisMammoliti",
        selected: false,
        description: "Aquaponics Director",
        imageSrc: "/images/team/Chris.jpg"
    }, {
        text: "James Hishmeh",
        value: "JamesHishmeh",
        selected: false,
        description: "Special Projects Intern",
        imageSrc: "/images/team/James.jpg"
    }, {
        text: "John Kazaklis",
        value: "JohnKazaklis",
        selected: false,
        description: "Missions Director for Asia",
        imageSrc: "/images/team/John.jpg"
    }, {
        text: "Joshua Bechard",
        value: "JoshuaBechard",
        selected: false,
        description: "Technology Director",
        imageSrc: "/images/team/Josh.jpg"
    }, {
        text: "Lindsey Keller",
        value: "LindseyKeller",
        selected: false,
        description: "Intern",
        imageSrc: "/images/team/Lindsey.jpg"
    }, {
        text: "Shelley Setchell",
        value: "ShelleySetchell",
        selected: false,
        description: "Missions Director for Latin America",
        imageSrc: "/images/team/Shelley.jpg"
    }, {
        text: "Timm Collins",
        value: "TimmCollins",
        selected: false,
        description: "Chief Operating Officer & Discipleship Director",
        imageSrc: "/images/team/Timm.jpg"
    }, {
        text: "Willie Brooks",
        value: "WillieBrooks",
        selected: false,
        description: "International Program Director",
        imageSrc: "/images/team/Willie.jpg"
    }];
    $('#GiveTo').ddslick({
        width: 260,
        height: "300px",
        onSelected: function(selectedData) {
            switch (selectedData.selectedData.value) {
                case '1':
                    // WhereMostNeeded, ddslick value of 1
                    $("#depends-on-Missionary").prop('disabled', true);
                    $("#depends-on-field-projects").prop('disabled', true);
                    $("#depends-on-community-sponsorship").prop('disabled', true);

                    $("#depends-on-Missionary").hide();
                    $("#depends-on-field-projects").hide();
                    $("#depends-on-community-sponsorship").hide();

                    $("#depends-on-Missionary-label").hide();
                    $("#depends-on-field-projects-label").hide();
                    $("#depends-on-community-sponsorship-label").hide();

                    $('.giving-detail-area').removeClass('dim-area');
                    $('.giving-detail-area').removeClass('highlight-area');

                    $('#placeholder_donate_input').val('');
                    break;
                case '2':
                    // Operations, ddslick value of 2
                    $("#depends-on-Missionary").prop('disabled', true);
                    $("#depends-on-field-projects").prop('disabled', true);
                    $("#depends-on-community-sponsorship").prop('disabled', true);

                    $("#depends-on-Missionary").hide();
                    $("#depends-on-field-projects").hide();
                    $("#depends-on-community-sponsorship").hide();

                    $("#depends-on-Missionary-label").hide();
                    $("#depends-on-field-projects-label").hide();
                    $("#depends-on-community-sponsorship-label").hide();

                    $('.giving-detail-area').addClass('dim-area');
                    $('.giving-detail-area').removeClass('highlight-area');
                    $('#operations_description').addClass('highlight-area');
                    $('#operations_description').removeClass('dim-area');

                    $('[name="donateTo"]').val("Operations");

                    $('#placeholder_donate_input').val('');
                    break;
                case '3':
                    // Missionary, ddslick value of 3
                    $("#depends-on-Missionary").prop('disabled', true);
                    $("#depends-on-field-projects").prop('disabled', true);
                    $("#depends-on-community-sponsorship").prop('disabled', true);

                    $("#depends-on-Missionary").hide();
                    $("#depends-on-field-projects").hide();
                    $("#depends-on-community-sponsorship").hide();

                    $("#depends-on-Missionary-label").hide();
                    $("#depends-on-field-projects-label").hide();
                    $("#depends-on-community-sponsorship-label").hide();

                    $('.giving-detail-area').addClass('dim-area');
                    $('#missionary_description').removeClass('dim-area');

                    $('.giving-detail-area').removeClass('highlight-area');
                    $('#missionary_description').addClass('highlight-area');

                    $('[name="donateTo"]').val("BaseCampWhereverNeededMost");

                    $("#depends-on-Missionary").prop('disabled', false);
                    $("#depends-on-Missionary-label").show();
                    $("#depends-on-Missionary").show();

                    $('#placeholder_donate_input').val('#depends-on-Missionary');
                    break;
                case '4':
                    // Field Projects, ddslick value of 4
                    $("#depends-on-Missionary").prop('disabled', true);
                    $("#depends-on-field-projects").prop('disabled',true);
                    $("#depends-on-community-sponsorship").prop('disabled', true);

                    $("#depends-on-Missionary").hide();
                    $("#depends-on-field-projects").hide();
                    $("#depends-on-community-sponsorship").hide();

                    $("#depends-on-Missionary-label").hide();
                    $("#depends-on-field-projects-label").hide();
                    $("#depends-on-community-sponsorship-label").hide();

                    $('.giving-detail-area').addClass('dim-area');
                    $('#field_projects_description').removeClass('dim-area');

                    $('.giving-detail-area').removeClass('highlight-area');
                    $('#field_projects_description').addClass('highlight-area');


                    $("#depends-on-field-projects").prop('disabled', false);
                    $("#depends-on-Missionary").attr("name", "donateTo");

                    $("#depends-on-field-projects-label").show();
                    $("#depends-on-field-projects").show();

                    $('#placeholder_donate_input').val('#depends-on-field-projects');
                    break;
                case '5':
                    // Community Sponsorship, ddslick value of 5
                    $("#depends-on-Missionary").prop('disabled', true);
                    $("#depends-on-field-projects").prop('disabled', true);
                    $("#depends-on-community-sponsorship").prop('disabled', true);

                    $("#depends-on-Missionary").hide();
                    $("#depends-on-field-projects").hide();
                    $("#depends-on-community-sponsorship").hide();

                    $("#depends-on-Missionary-label").hide();
                    $("#depends-on-field-projects-label").hide();
                    $("#depends-on-community-sponsorship-label").hide();

                    $('.giving-detail-area').addClass('dim-area');
                    $('#community_sponsorship_description').removeClass('dim-area');

                    $('.giving-detail-area').removeClass('highlight-area');
                    $('#community_sponsorship_description').addClass('highlight-area');


                    $("#depends-on-community-sponsorship").prop('disabled', false);
                    $("#depends-on-community-sponsorship-label").show();
                    $("#depends-on-community-sponsorship").show();


                    $('#placeholder_donate_input').val('#depends-on-community-sponsorship');
                    break;
                case '6':
                    // WriteIn, ddslick value of 6
                    $("#depends-on-Missionary").removeAttr("name", "donateTo");
                    $("#depends-on-field-projects").removeAttr("name", "donateTo");
                    $("#depends-on-community-sponsorship").removeAttr("name", "donateTo");

                    $("#depends-on-Missionary").prop('disabled', true);
                    $("#depends-on-field-projects").prop('disabled', true);
                    $("#depends-on-community-sponsorship").prop('disabled', true);

                    $("#depends-on-Missionary").hide();
                    $("#depends-on-field-projects").hide();
                    $("#depends-on-community-sponsorship").hide();

                    $("#depends-on-Missionary-label").hide();
                    $("#depends-on-field-projects-label").hide();
                    $("#depends-on-community-sponsorship-label").hide();

                    $('.giving-detail-area').addClass('dim-area');
                    $('#trip_description').removeClass('dim-area');

                    $('.giving-detail-area').removeClass('highlight-area');
                    $('#trip_description').addClass('highlight-area');

                    $('#placeholder_donate_input').val('');
                    $('[name="donateTo"]').val("WriteIn");
                    break;
            }
            //callback function: do something with selectedData;
            console.log(selectedData.selectedData.value);
            $('#GiveTo').val(selectedData.selectedData.value);
        },
        data: GiveTo
    });
    $("#depends-on-Missionary").ddslick({
        width: 260,
        height: "300px",
        onSelected: function(selectedData) {
            //callback function: do something with selectedData;
            console.log(selectedData.selectedData.value);
            $('#depends-on-Missionary').val(selectedData.selectedData.value);
            $('[name="donateTo"]').val(selectedData.selectedData.value);
            $('#depends-on-Missionary > .dd-select').removeClass("red-border");
        },
        data: Missionary
    });
    $("#depends-on-field-projects").ddslick({
        width: 260,
        height: "300px",
        onSelected: function(selectedData) {
            //callback function: do something with selectedData;
            console.log(selectedData.selectedData.value);
            $('#depends-on-field-projects').val(selectedData.selectedData
                .value);
            $('[name="donateTo"]').val(selectedData.selectedData.value);
        },
    });
    $("#depends-on-community-sponsorship").ddslick({
        width: 260,
        height: "300px",
        onSelected: function(selectedData) {
            //callback function: do something with selectedData;
            console.log(selectedData.selectedData.value);
            $('#depends-on-community-sponsorship').val(selectedData.selectedData
                .value);
            $('[name="donateTo"]').val(selectedData.selectedData.value);
        },
    });


    $("#depends-on-Missionary").prop('disabled', true);
    $("#depends-on-field-projects").prop('disabled', true);
    $("#depends-on-community-sponsorship").prop('disabled', true);
    $("#depends-on-Missionary").hide();
    $("#depends-on-field-projects").hide();
    $("#depends-on-community-sponsorship").hide();
    $("#depends-on-Missionary-label").hide();
    $("#depends-on-field-projects-label").hide();
    $("#depends-on-community-sponsorship-label").hide();
});
