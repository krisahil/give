AccountsTemplates.configure({
  forbidClientAccountCreation: true,
  enablePasswordChange: true,
  showForgotPasswordLink: true,
  onLogoutHook: function() {
    Router.go('donation.landing');
  },
  texts: {
    pwdLink_link: "Don't Know Your Password?"
  }
});

AccountsTemplates.removeField('password');
AccountsTemplates.addField({
  _id: 'password',
  type: 'password',
  placeholder: {
    enrollAccount: "At least six characters"
  },
  required: true,
  minLength: 6,
  re: /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/,
  errStr: 'At least 1 digit, 1 lowercase and 1 uppercase'
});

// Routes
AccountsTemplates.configureRoute('changePwd', {
  name: 'changePwd',
  path: '/change-password',
  redirect: 'user.profile'
});
AccountsTemplates.configureRoute('enrollAccount', {
  name: 'enrollAccount',
  path: '/enroll-account',
  redirect: 'user.profile'
});
AccountsTemplates.configureRoute('resetPwd', {
  name: 'resetPwd',
  path: '/reset-password',
  redirect: 'user.profile'
});
AccountsTemplates.configureRoute('signIn', {
  name: 'signIn',
  path: '/sign-in',
  redirect: 'user.profile'
});
AccountsTemplates.configureRoute('forgotPwd', {
  name: 'forgotPwd',
  path: '/forgot-password',
  redirect: '/sign-in'
});
AccountsTemplates.configureRoute('verifyEmail', {
  name: 'verifyEmail',
  path: '/verify-email',
  redirect: 'user.profile'
});

if (Meteor.isServer) {
  let config = Config.findOne( {
    'OrgInfo.web.domain_name': Meteor.settings.public.org_domain
  });

  if (config && config.Services && config.Services.Email &&
    config.Services.Email.emailSendMethod) {
    let orgName = config && config.OrgInfo && config.OrgInfo.name;
    let supportEmail = config.OrgInfo.emails.support;

    let emailSendMethod = config.Services.Email.emailSendMethod;

    Accounts.emailTemplates.siteName = orgName;
    Accounts.emailTemplates.from = orgName + "<" + supportEmail + ">";

    // Configure verifyEmail subject
    Accounts.emailTemplates.verifyEmail.subject = function() {
      return "Verify Your Email Address";
    };

    // Configures "reset-password account" email link
    Accounts.urls.resetPassword = function(token) {
      return Meteor.absoluteUrl("reset-password/" + token);
    };
    Accounts.emailTemplates.resetPassword.subject = function() {
      return "Reset Your Password.";
    };

    // Configures "enroll-account" email link
    Accounts.urls.enrollAccounts = function(token) {
      return Meteor.absoluteUrl("enroll-account/" + token);
    };
    Accounts.emailTemplates.enrollAccount.subject = function() {
      return "You have an account.";
    };

    if (emailSendMethod === 'Mandrill') {
      const mandrillEnrollAccountEmailName = config.Services.Email.enrollmentName;
      const mandrillResetPasswordEmailName = config.Services.Email.resetPasswordName;

      Accounts.emailTemplates.enrollAccount.html = function(user, url) {
        var data_slug;
        try {
          data_slug = {
            template_name: mandrillEnrollAccountEmailName,
            template_content: [{}],
            "message": {
              "global_merge_vars": [
                {
                  name:    'Enrollment_URL',
                  content: url
                },
                {
                  name:    'DEV',
                  content: Meteor.settings.dev
                }
              ]
            }
          };
        } catch (error) {
          logger.error('Error while rendering Mandrill template', error);
        }

        // Add all the standard merge_vars and standard fields for emails
        let dataSlugWithImageVars = Utils.setupImages(data_slug);
        let dataSlugWithOrgInfoFields = Utils.addOrgInfoFields(dataSlugWithImageVars);
        dataSlugWithOrgInfoFields.merge_vars = dataSlugWithOrgInfoFields.message.global_merge_vars;
        logger.info(dataSlugWithOrgInfoFields);

        if (config && config.Services && config.Services.Email &&
          config.Services.Email.emailSendMethod) {
          if( config.Services.Email.emailSendMethod === "Mandrill" ) {
            let waitForConfig = Utils.configMandrill();
            var result = Mandrill.templates.render(dataSlugWithOrgInfoFields);
          }
        }

        logger.info(result);
        return result.data.html;
      };

      Accounts.emailTemplates.resetPassword.html = function(user, url) {
        var result;
        try {
          result = Mandrill.templates.render({
            template_name: mandrillResetPasswordEmailName,
            template_content: [
              {
                name: 'Enrollment_URL',
                content: url
              },
              {
                name: 'DEV',
                content: Meteor.settings.dev
              }
            ],
            merge_vars: [
              {
                name: 'Enrollment_URL',
                content: url
              },
              {
                name: 'DEV',
                content: Meteor.settings.dev
              }
            ]
          });
        } catch (error) {
          console.error('Error while rendering Mandrill template', error);
        }
        return result.data.html;
      };
    }
  }
}
