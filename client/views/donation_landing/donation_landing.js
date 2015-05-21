Template.DonationLanding.helpers({

});

Template.DonationLanding.events({
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
                $('[name="donateTo"]').val($('#GiveTo').val());
                $('[name="donateWith"]').val('Card');
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
        if (placeholder_value === '#depends-on-Missionary' && $('#depends-on-Missionary').val() == "") {
            $('#depends-on-Missionary > .dd-select').addClass("red-border");
            alert("Please select a missionary");
            return false;
        } else {
            if (placeholder_value === '') {
                $('[name="donateTo"]').val($('#GiveTo').val());
                $('[name="donateWith"]').val('Check');
            } else {
                $('[name="donateTo"]').val($(placeholder_value).val());
                $('[name="donateWith"]').val('Check');
            }
            Router.go('/?'+$("#landing_form").serialize());
        }
    }
});

Template.DonationLanding.rendered = function () {
    //Dropdown plugin data for GiveTo
    var GiveTo = [{
        text: "Wherever It's Needed Most",
        value: "WhereMostNeeded",
        selected: true,
        description: ""
    }, {
        text: "TMP's Operations Expenses",
        value: "Operations",
        selected: false,
        description: ""
    }, {
        text: "TMP Missionary",
        value: "Missionary",
        selected: false,
        description: ""
    }, {
        text: "International Field Projects",
        value: "FieldProjects",
        selected: false,
        description: ""
    }, {
        text: "Community Sponsorship",
        value: "CommunitySponsorship",
        selected: false,
        description: ""
    }, {
        text: "I want to write in a different designation, or give to a trip participant.",
        value: "WriteIn",
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
        imageSrc: "https://trashmountain.com/system/wp-content/uploads/2013/09/TMP-Staff-Brett-Durbin-BW.jpg"
    }, {
        text: "Chris Mammoliti",
        value: "ChrisMammoliti",
        selected: false,
        description: "Aquaponics Director",
        imageSrc: "https://trashmountain.com/system/wp-content/uploads/2013/09/TMP-Staff-Chris-Mammoliti-BW.jpg"
    }, {
        text: "Isaac Tarwater",
        value: "IsaacTarwater",
        selected: false,
        description: "Aquaponics",
        imageSrc: "https://trashmountain.com/system/wp-content/uploads/2013/09/TMP-Staff-Isaac-Tarwater-BW.jpg"
    }, {
        text: "James Hishmeh",
        value: "JamesHishmeh",
        selected: false,
        description: "Special Projects Intern",
        imageSrc: "https://trashmountain.com/system/wp-content/uploads/2014/12/james_bw.jpg"
    }, {
        text: "John Kazaklis",
        value: "JohnKazaklis",
        selected: false,
        description: "Missions Director for Asia",
        imageSrc: "https://trashmountain.com/system/wp-content/uploads/2013/09/TMP-Staff-John-Kazaklis-BW.jpg"
    }, {
        text: "Lindsey Keller",
        value: "LindseyKeller",
        selected: false,
        description: "Intern",
        imageSrc: "https://trashmountain.com/system/wp-content/uploads/2015/04/tmp_lindsey_small.jpg"
    }, {
        text: "Ethan Pope",
        value: "EthanPope",
        selected: false,
        description: "Intern",
        imageSrc: ""
    }, {
        text: "Jon DeMeo",
        value: "JonDeMeo",
        selected: false,
        description: "Director of Operations",
        imageSrc: "https://trashmountain.com/system/wp-content/uploads/2013/09/TMP-Staff-Jon-DeMeo-BW.jpg"
    }, {
        text: "Joshua Bechard",
        value: "JoshuaBechard",
        selected: false,
        description: "Technology Director",
        imageSrc: "https://trashmountain.com/system/wp-content/uploads/2013/09/TMP-Staff-Joshua-Bechard-BW.jpg"
    }, {
        text: "Shelley Setchell",
        value: "ShelleySetchell",
        selected: false,
        description: "Missions Director for Latin America",
        imageSrc: "https://trashmountain.com/system/wp-content/uploads/2013/09/TMP-Staff-Shelley-Setchell-BW.jpg"
    }, {
        text: "Timm Collins",
        value: "TimmCollins",
        selected: false,
        description: "Chief Operating Officer & Discipleship Director",
        imageSrc: "https://trashmountain.com/system/wp-content/uploads/2013/09/TMP-Staff-Timm-Collins-BW.jpg"
    }, {
        text: "Willie Brooks",
        value: "WillieBrooks",
        selected: false,
        description: "International Program Director",
        imageSrc: "https://trashmountain.com/system/wp-content/uploads/2014/12/willie_bw.jpg"
    }];
    $('#GiveTo').ddslick({
        width: 260,
        height: "300px",
        onSelected: function(selectedData) {
            //callback function: do something with selectedData;
            console.log(selectedData.selectedData.value);
            $('#GiveTo').val(selectedData.selectedData.value);
            switch (selectedData.selectedData.value) {
                case "Missionary":
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
                case "FieldProjects":
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
                case "CommunitySponsorship":
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
                case "Operations":
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

                    $('#placeholder_donate_input').val('');
                    break;
                case "WhereMostNeeded":
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
                case "WriteIn":
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
                    break;
                default:

                    break;
            }
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
};
