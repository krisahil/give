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
  let config = Config.findOne({
    'OrgInfo.web.domain_name': Meteor.settings.public.org_domain
  });
  
  if (config && config.OrgInfo && config.OrgInfo.emails) {
    let orgName = config && config.OrgInfo && config.OrgInfo.name;
    let supportEmail = config.OrgInfo.emails.support;

    let emailSendMethod = config.OrgInfo.emails.emailSendMethod;

    let enrollAccountEmailName = config.OrgInfo.emails.emailSendMethod;

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
      const mandrillEnrollAccountEmailName = config.OrgInfo.emails.enrollmentName;
      const mandrillResetPasswordEmailName = config.OrgInfo.emails.resetPasswordName;

      Accounts.emailTemplates.enrollAccount.html = function(user, url) {
        var result;
        try {
          result = Mandrill.templates.render({
            template_name: mandrillEnrollAccountEmailName,
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

    // TODO: this method isn't in use yet, need to figure out how to use the built-in SMTP method
    // with Meteor's MAIL_URL ENV variable requirement
    if (emailSendMethod === 'smtp') {
      const EnrollAccountEmailName = 'emails/enrollAccountEmail.html';

      // TODO: need to export this template and import to a file
      const ResetPasswordEmailName = 'emails/resetPasswordEmail.html';

      let emailData = {
        logoURL: config.OrgInfo.logoURL,
        orgName: config.OrgInfo.name,
        replayEmail: supportEmail,
        phoneNumber: config.OrgInfo.phone
      };

      Accounts.emailTemplates.enrollAccount.html = function(user, url) {
        console.log(EnrollAccountEmailName);
        let result;
        emailData.subject = Accounts.emailTemplates.enrollAccount.subject;
        emailData.enrollmentURL = url;
        /*try {*/
        SSR.compileTemplate( 'enrollAccountEmail', Assets.getText( EnrollAccountEmailName ) );
        /*} catch (error) {
         console.error('Error while rendering local email template', error);
         }*/
        return SSR.render( 'enrollAccountEmail', emailData );
      };

      Accounts.emailTemplates.resetPassword.html = function(user, url) {
        let result;
        emailData.subject = Accounts.emailTemplates.resetPassword.subject;
        emailData.resetPasswordURL = url;
        try {

        } catch (error) {
          console.error('Error while rendering Mandrill template', error);
        }
        return result.data.html;
      };
    }
  }  
}
