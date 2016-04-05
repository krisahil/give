function checkDependantStates() {
  if (AutoForm.getFieldValue("Settings.ach_verification_type", "updateSettingsSection") === 'manual') {
    $('[name="Settings.doNotAllowOneTimeACH"]').bootstrapSwitch('toggleDisabled', true, true);
    $('[name="Settings.collectBankAccountType"]').bootstrapSwitch('toggleDisabled', true, true);
    $('[name="Settings.forceACHDay"]').prop('disabled', false);
  } else {
    $('[name="Settings.doNotAllowOneTimeACH"]').bootstrapSwitch('state', false);
    $('[name="Settings.doNotAllowOneTimeACH"]').bootstrapSwitch('disabled', true);
    $('[name="Settings.collectBankAccountType"]').bootstrapSwitch('state', false);
    $('[name="Settings.collectBankAccountType"]').bootstrapSwitch('disabled', true);
    $('[name="Settings.forceACHDay"]').val('any');
    $('[name="Settings.forceACHDay"]').prop('disabled', true);
  }
  let config = Config.findOne({
    'OrgInfo.web.domain_name': Meteor.settings.public.org_domain
  });

}

AutoForm.hooks({
  'updateInfoSection': {
    onSuccess: function () {
      Bert.alert({
        message: "Good work",
        type: 'success',
        icon: 'fa-smile-o',
        style: 'growl-bottom-right'
      });

      Meteor.call("afterUpdateInfoSection", function(err, res) {
        if(!err) console.log(res);
      });
      
      Router.go("Dashboard");
    },
    onError: function(formType, error) {
      console.error(error);
      Bert.alert({
        message: "Looks like you might be missing some required fields.",
        type: 'danger',
        icon: 'fa-frown-o',
        style: 'growl-bottom-right'
      });
    }
  },
  'updateSettingsSection': {
    onSuccess: function() {
      Bert.alert({
        message: "Great, thanks",
        type: 'success',
        icon: 'fa-smile-o',
        style: 'growl-bottom-right'
      });
      Router.go("Dashboard");
    },
    onError: function(formType, error) {
      console.error(error);
      Bert.alert({
        message: "Looks like you might be missing some required fields or you need to change something.",
        type: 'danger',
        icon: 'fa-frown-o',
        style: 'growl-bottom-right'
      });
    }
  }
});

Template.OrgInfo.onCreated(function () {
  this.formType = new ReactiveVar('insert');
});
Template.OrgInfo.onRendered(function () {
  $("[name='OrgInfo.phone']").mask("(999) 999-9999");
  $("#updateInfoSection").parsley();
});

Template.OrgInfo.helpers({
  configDoc: function () {
    let config = Config.findOne({
      'OrgInfo.web.domain_name': Meteor.settings.public.org_domain
    });
    if (config) {
      Template.instance().formType.set('update');
      return config;
    }
    return;
  },
  formType: function() {
    var formType = Template.instance().formType.get();
    return formType;
  }
});

Template.Settings.onRendered(function () {
  $("[name='Settings.ach_verification_type']").attr('required', true);
  $("[name='Settings.DonorTools.url']").attr('required', true);
  $("#updateSettingsSection").parsley();
  $("[data-toggle='switch']").bootstrapSwitch();
});

Template.Settings.helpers({
  configDoc: function () {
    let org_info = Config.findOne({
      'OrgInfo.web.domain_name': Meteor.settings.public.org_domain
    });
    if (org_info) {
      return org_info;
    }
    return;
  }
});

Template.Settings.events({
  // check to see if the ACH verification type is set to manual
  // if it is then change the dependant values by removing their disabled state
  'change [name="Settings.ach_verification_type"]': function(e) {
    checkDependantStates();
  }
});

Template.Settings.onRendered(function () {
  checkDependantStates();
});
