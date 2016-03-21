AutoForm.hooks({
  'updateInfoSection': {
    onSuccess: function (operation, result, template) {
      Bert.alert({
        message: "Good work",
        type: 'success',
        icon: 'fa-smile-o'
      });
    },
    onError: function(operation, error, template) {
      Bert.alert({
        message: "Looks like you might be missing some required fields.",
        type: 'danger',
        icon: 'fa-frown-o'
      });
    }
  },
  'updateStripeSection': {
    onSuccess: function (operation, result, template) {
      Bert.alert({
        message: "Great, thanks",
        type: 'success',
        icon: 'fa-smile-o'
      });
    },

    onError: function(operation, error, template) {
      Bert.alert({
        message: error,
        type: 'danger',
        icon: 'fa-frown-o'
      });
    }
  },
  'updateDonorToolsSection': {
    onSuccess: function (operation, result, template) {
      Bert.alert({
        message: "Got it, thanks",
        type: 'success',
        icon: 'fa-smile-o'
      });
    },

    onError: function(operation, error, template) {
      Bert.alert({
        message: error,
        type: 'danger',
        icon: 'fa-frown-o'
      });
    }
  }
});

Template.OrgInfo.helpers({
  configDoc: function () {
    let org_info = Config.findOne({
      'organization_info.web.domain_name': Meteor.settings.public.org_domain
    });
    console.log(org_info);
    if (org_info) {
      Template.instance().formType.set('update');
      return org_info;
    }
    return;
  },
  formType: function() {
    var formType = Template.instance().formType.get();
    return formType;
  }
});

Template.OrgInfo.onRendered(function () {
  $("[name='organization_info.phone']").mask("(999) 999-9999");
});

Template.OrgInfo.onCreated(function () {
  this.formType = new ReactiveVar( 'insert' );
});