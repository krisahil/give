AccountsTemplates.configure({
  forbidClientAccountCreation: true,
  enablePasswordChange: true,
  showForgotPasswordLink: true,
  onLogoutHook: function() {
    Router.go('donation.form');
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
  Accounts.emailTemplates.siteName = Meteor.settings.public.org_name;
  Accounts.emailTemplates.from = Meteor.settings.public.org_name + "<" + Meteor.settings.public.support_address + ">";
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

  Accounts.emailTemplates.enrollAccount.html = function(user, url) {
    var result;
    try {
      result = Mandrill.templates.render({
        template_name: 'you-have-an-account',
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
        template_name: 'tmp-reset-password',
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
