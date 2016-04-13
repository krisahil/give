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

Template.DonationLanding.helpers({
  imageSrc: function () {
    if (Uploads.findOne({fundId: this.id})) {
      return Uploads.findOne({fundId: this.id}).baseUrl + Uploads.findOne({fundId: this.id}).name;
    }
    return;
  },
  givingOptions: function() {
    let config = ConfigDoc();
    let givingOptions =  config && config.Giving && config.Giving.options;
    return _.sortBy(givingOptions, 'position');
  },
  donationGroups: function() {
    let config = ConfigDoc();
    let givingOptions =  config && config.Giving && config.Giving.options;

    let groups = _.filter( givingOptions, function(item) {
      return item && item.groupId;
    });
    let donationGroups = groups.map(function(group) {
      group.children = _.filter(givingOptions, function(item) {
        return group.groupId === item.currentGroup;
      });
      return group;
    });
    return donationGroups;
  },
  configId: function() {
    let config = ConfigDoc();

    if( config && config._id ) {
      var givingOptions = config.Giving.options;

      if( givingOptions && givingOptions.length > 0 ) {

        let groups = _.filter( givingOptions, function ( item ) {
          return item && item.groupId;
        } );

        // Setup the DD-Slick version of the individual select elements
        Meteor.setTimeout( function () {
          groups.forEach( function ( item ) {
            let itemName = '#dd-' + item.groupId;
            $( itemName ).ddslick( {
              onSelected: function ( selectedData ) {
                console.log("value: " + selectedData.selectedData.value);
                $("[name='donateTo']").val( selectedData.selectedData.value );
              }
            } );
            $( itemName ).hide();
          } );

          if( $( "#mainDD" ) ) {
            $( "#mainDD" ).ddslick( {
              onSelected: _.debounce( function ( selectedData ) {
                $( "#dd-" + selectedData.selectedData.value ).show();

                groups.forEach( function ( item ) {
                  let itemName = '#dd-' + item.groupId;
                  if( selectedData.selectedData.value !== item.groupId ) {
                    $( itemName ).prop( 'disabled', true );
                    $( itemName ).hide();
                  } else {
                    $("[name='donateTo']").val( $( itemName ).find( ":input" ).val() );
                  }
                } );
              }, 300 )
            } );
          }
        }, 0 );
      }
        return config._id;
      }
    return;
  }
});

Template.DonationLanding.onCreated(function () {
  let self = this;
  self.autorun(function() {
    self.subscribe("uploaded");
  });
});
