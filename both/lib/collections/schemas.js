Schema = {};

Schema.DonorTools = new SimpleSchema({
  "url": {
    type: String,
    label: "URL",
    optional: true,
    autoform: {
      placeholder: "Your Donor Tools Website Address, something like this 'https://your_part_here.donortools.com'"
    }
  },
  "username": {
    type: String,
    label: "User (minimum privilege for this account is 'manager')",
    optional: true
  },
  "password": {
    type: String,
    label: "Password",
    optional: true
  }
});

Schema.Stripe = new SimpleSchema({
  "keys_publishable": {
    type: String,
    label: "Publishable Key",
    max: 32,
    optional: true
  },
  "keys_secret": {
    type: String,
    label: "Secret Key",
    max: 32,
    optional: true
  },
  "ach_verification_type": {
    type: String,
    label: "Which type of ACH verification do you prefer?",
    allowedValues: ["None","Micro-deposit","Plaid"],
    optional: true,
    autoform: {
      afFieldInput: {
        firstOption: "(Select a type)"
      }
    }
  }
});

Schema.MultiConfig = new SimpleSchema({
  "donationOptions": {
    type: Array,
    optional: true,
    blackbox: true,
    autoform: {
      omit: true
    }
  },
  "donationOptions.$": {
    type: Object,
    optional: true,
    blackbox: true,
    autoform: {
      omit: true
    }
  },
  "DonorTools": {
    type: Schema.DonorTools,
    optional: true
  },
  "Stripe": {
    type: Schema.Stripe,
    optional: true
  },
  "organization_info": {
    type: Object,
    optional: true,
    autoform: {
      afFieldInput: {
      class: 'slim-borders'
      }
    }
  },
  "organization_info.name": {
    type:  String,
    label: "Name",
    max:   100,
    optional: true
  },
  "organization_info.full_name": {
    type:  String,
    label: "Full Name (e.g., with ', Inc.' at the end)",
    max:   100,
    optional: true
  },
  "organization_info.phone": {
    type:  String,
    label: "Phone",
    optional: true
  },
  "organization_info.is_501c3": {
    type: Boolean,
    label: "Are you a 501(c)3 non-profit organization?",
    optional: true,
    autoform: {
      type: "boolean-radios",
      trueLabel: "Yes, We are.",
      falseLabel: "No, we aren't"
    }
  },
  "organization_info.ein": {
    type: String,
    label: "EIN",
    max: 10,
    optional: true
  },
  "organization_info.address": {
    type:  Object,
    label: "Address",
    optional: true
  },
  "organization_info.address.line_1": {
    type:  String,
    label: "Address Line 1",
    max:   100,
    optional: true
  },
  "organization_info.address.line_2": {
    type:  String,
    label: "Address Line 2",
    max:   100,
    optional: true
  },
  "organization_info.address.city": {
    type:  String,
    label: "City",
    max:   50,
    optional: true
  },
  "organization_info.address.state_short": {
    type: String,
    label: "State",
    allowedValues: ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"],
    optional: true,
    autoform: {
      afFieldInput: {
        firstOption: "(Select a State)"
      }
    }
  },
  "organization_info.address.zip": {
    type:  String,
    label: "Zip",
    max:   15,
    optional: true
  },
  "organization_info.mission_statement": {
    type: String,
    label: "Mission Statement",
    optional: true,
    autoform: {
      afFieldInput: {
        type: "textarea",
        rows: 5
      }
    }
  },
  "organization_info.date_founded": {
    type:     Date,
    label:    "Date Founded",
    optional: true,
    autoform: {
      type: "bootstrap-datepicker",
      datePickerOptions: {
        autoclose: true,
        endDate: new Date()
      }
    }
  },
  "organization_info.emails": {
    type:     Object,
    label:    "Emails used for below scenarios",
    optional: true
  },
  "organization_info.emails.bcc": {
    type: Array,
    label: "To be BCC'd on all outgoing emails",
    optional: true
  },
  "organization_info.emails.bcc.$": {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
    optional: true
  },
  "organization_info.emails.contact": {
    type: Array,
    label: "Main contact address",
    optional: true
  },
  "organization_info.emails.contact.$": {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
    optional: true
  },
  "organization_info.emails.canceled_gift": {
    type: Array,
    label: "Notify for any canceled gifts",
    optional: true
  },
  "organization_info.emails.canceled_gift.$": {
    type: String,
    label: "Notify for any canceled gifts",
    regEx: SimpleSchema.RegEx.Email,
    optional: true
  },
  "organization_info.emails.support": {
    type: Array,
    label: "Technical support address",
    optional: true
  },
  "organization_info.emails.support.$": {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
    optional: true
  },
  "organization_info.emails.other_support_addresses": {
    type: Array,
    label: "Any additional support address you would like to be CC'd",
    optional: true
  },
  "organization_info.emails.other_support_addresses.$": {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
    optional: true
  },
  "organization_info.emails.large_gift_threshold": {
    type: Number,
    optional: true,
    autoform: {
      placeholder: "At or above this number and the large gift email addresses will receive an email"
    }
  },
  "organization_info.emails.large_gift": {
    type: Array,
    label: "If a gift is at or above the large gift threshold, send a notice to these addresses.",
    optional: true
  },
  "organization_info.emails.large_gift.$": {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
    optional: true
  },
  "organization_info.web": {
    type: Object,
    label: "Your website addresses",
    optional: true
  },
  "organization_info.web.domain_name": {
    type: String,
    label: "Domain name",
    optional: true,
    autoform: {
      placeholder: "e.g. trashmountain.com"
    }
  },
  "organization_info.web.subdomain": {
    type: String,
    label: "The Subdomain you would like 'Give' to run at.",
    optional: true
  },
  "organization_info.web.donate_url": {
    type: String,
    label: "If you have an address you want to use to redirect to your 'Give' landing page.",
    optional: true,
    autoform: {
      placeholder: "e.g. https://trashmountain.com/donate"
    }
  },
  "organization_info.web.heap_analytics_id": {
    type: Number,
    label: "Heap analytics ID",
    max: 9999999999,
    optional: true
  }
});

Schema.UserProfile = new SimpleSchema({
  fname: {
    type: String,
    optional: true,
    label: 'First Name'
  },
  lname: {
    type: String,
    optional: true,
    label: 'Last Name'
  },
  address: {
    type: Object,
    optional: true
  },
  'address.address_line1': {
    type: String,
    optional: true,
    label: 'Address Line 1'
  },
  'address.address_line2': {
    type: String,
    optional: true,
    label: 'Address Line 2'
  },
  'address.city': {
    type: String,
    optional: true,
    label: 'City'
  },
  'address.state': {
    type: String,
    optional: true,
    label: 'State'
  },
  'address.country': {
    type: String,
    optional: true,
    label: 'Country'
  },
  'address.postal_code': {
    type: String,
    optional: true,
    regEx: SimpleSchema.RegEx.ZipCode,
    label: 'Postal Code'
  },
  business_name: {
    type: String,
    optional: true,
    label: 'Organization Name'
  },
  phone: {
    type: String,
    optional: true,
    label: 'Phone Number'
  },
  newStuffVersion: {
    type: String,
    optional: true,
    autoform: {
      afFieldInput: {
        type: "hidden"
      },
      afFormGroup: {
        label: false
      }
    }
  }
});

Schema.User = new SimpleSchema({
  createdAt: {
    type: Date,
    optional: false,
    autoform: {
      value: new Date(),
      type: "hidden"
    }
  },
  emails: {
    type: Array,
    autoform: {
      omit: true
    }
  },
  "emails.$": {
    type: Object,
    autoform: {
      afFieldInput: {
        type: "hidden"
      },
      afFormGroup: {
        label: false
      }
    }
  },
  "emails.$.address": {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
    autoform: {
      afFieldInput: {
        type: "hidden"
      },
      afFormGroup: {
        label: false
      }
    }
  },
  "emails.$.verified": {
    type: Boolean,
    autoform: {
      afFieldInput: {
        type: "hidden"
      },
      afFormGroup: {
        label: false
      }
    }
  },
  newUser: {
    type: Boolean,
    optional: true,
    autoform: {
      afFieldInput: {
        type: "hidden"
      },
      afFormGroup: {
        label: false
      }
    }
  },
  profile: {
    type: Schema.UserProfile,
    optional: true
  },
  // Make sure this services field is in your schema if you're using any of the accounts packages
  services: {
    type: Object,
    optional: true,
    blackbox: true,
    autoform: {
      omit: true
    }
  },
  state: {
    type: Object,
    optional: true,
    autoform: {
      omit: true,
      afFieldInput: {
        type: "hidden"
      },
      afFormGroup: {
        label: false
      }
    }
  },
  'state.status': {
    type: String,
    optional: true,
    autoform: {
      afFieldInput: {
        type: "hidden"
      },
      afFormGroup: {
        label: false
      }
    },
    defaultValue: 'invited'
  },
  'state.updatedOn': {
    type: Date,
    optional: true,
    autoform: {
      afFieldInput: {
        type: "hidden"
      },
      afFormGroup: {
        label: false
      }
    }
  },
  roles: {
    type: Array,
    optional: true
  },
  "roles.$": {
    type: String,
    optional: true
  },
  persona_ids: {
    type: Array,
    optional: true,
    autoform: {
      omit: true
    }
  },
  "persona_ids.$": {
    type: Number,
    optional: true,
    autoform: {
      afFieldInput: {
        type: "hidden"
      },
      afFormGroup: {
        label: false
      }
    }
  },
  persona_id: {
    type: Array,
    optional: true,
    autoform: {
      omit: true
    }
  },
  "persona_id.$": {
    type: Number,
    optional: true,
    autoform: {
      afFieldInput: {
        type: "hidden"
      },
      afFormGroup: {
        label: false
      }
    }
  },
  persona_info: {
    type: Array,
    optional: true,
    blackbox: true,
    autoform: {
      omit: true
    }
  },
  'persona_info.$': {
    type: Object,
    optional: true,
    blackbox: true,
    autoform: {
      omit: true
    }
  },
  primary_customer_id: {
    type: String,
    optional: true,
    autoform: {
      afFieldInput: {
        type: "hidden"
      },
      afFormGroup: {
        label: false
      }
    }
  }
});

Schema.CreateUserFormSchema = new SimpleSchema({
  email: {
    type: String,
    label: 'Email Address',
    regEx: SimpleSchema.RegEx.Email
  },
  profile: {
    type: Schema.UserProfile,
    optional: true
  },
  state: {
    type: Object,
    autoform: {
      afFieldInput: {
        type: "hidden"
      },
      afFormGroup: {
        label: false
      }
    }
  },
  "state.status": {
    type: String,
    autoform: {
      type: "select",
      options: function() {
          return [
            { label: "invited", value: "invited" }
          ]
        }
    },
    defaultValue: 'invited'
  },
  roles: {
    type: Array,
    optional: true,
    label: 'Roles: Hold down the Ctrl (windows) / Command (Mac) button to select multiple roles',
    autoform: {
      options: function () {
        return Meteor.roles.find().map( function ( r ) {
          return { label: r.name, value: r.name };
        } );
      }
    }
  },
  "roles.$": {
    type: String
  }
});

Schema.UpdateUserFormSchema = new SimpleSchema({
  emails: {
    type: Array,
    autoform: {
      omit: true
    }
  },
  "emails.$": {
    type: Object,
    autoform: {
      afFieldInput: {
        type: "hidden"
      },
      afFormGroup: {
        label: false
      }
    }
  },
  "emails.$.address": {
    type: String,
    regEx: SimpleSchema.RegEx.Email
  },
  "emails.$.verified": {
    type: Boolean,
    autoform: {
      afFieldInput: {
        type: "hidden"
      },
      afFormGroup: {
        label: false
      }
    }
  },
  profile: {
    type: Schema.UserProfile,
    optional: true
  },
  state: {
    type: Object,
    autoform: {
      afFieldInput: {
        type: "hidden"
      },
      afFormGroup: {
        label: false
      }
    }
  },
  'state.status': {
    type: String,
    autoform: {
      type: "select",
      options: function () {
        return [
          {label: "enabled", value: "enabled"},
          {label: "invited", value: "invited"},
          {label: "disabled", value: "disabled"}
        ];
      }
    }
  },
  roles: {
    type: Array,
    optional: true,
    label: 'Roles: Hold down the Ctrl (windows) / Command (Mac) button to select multiple roles',
    autoform: {
      options: function () {
        return Meteor.roles.find().map( function ( r ) {
          return { label: r.name, value: r.name };
        } );
      }
    }
  },
  "roles.$": {
    type: String
  }
});

Schema.DonorToolsForm = new SimpleSchema({
  "DonorTools": {
    type: Schema.DonorTools,
    optional: true
  }
});

Schema.StripeForm = new SimpleSchema({
  "Stripe": {
    type: Schema.Stripe,
    optional: true
  }
});

Meteor.users.attachSchema(Schema.User);

MultiConfig.attachSchema(Schema.MultiConfig);