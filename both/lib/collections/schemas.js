MultiConfig.attachSchema(new SimpleSchema({
  "Organization_info": {
    type: Object,
    autoform: {
      afFieldInput: {
        class: 'slim-borders'
      }
    }
  },
  "Organization_info.is_501c3": {
    type: Boolean,
      label: "Are you a 501(c)3 non-profit organization?",
      autoform: {
      type: "boolean-radios",
        trueLabel: "Yes, We are.",
        falseLabel: "No, we aren't",
        value: false
    }
  },
  "Organization_info.name":          {
      type:  String,
      label: "Name",
      max:   200
    },
  "Organization_info.phone":          {
      type:  String,
      label: "Phone",
      max:   200
    },
  "Organization_info.city":          {
      type:  String,
      label: "City",
      max:   200
    },
  "Organization_info.state": {
    type: String,
    allowedValues: ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"],
    autoform: {
      afFieldInput: {
        firstOption: "(Select a State)"
      }
    }
  },
  "Organization_info.zip":          {
      type:  String,
      label: "Zip",
      max:   15
    },
  "Organization_info.mission_statement":          {
      type:  String,
      label: "Mission Statement",
      max:   200
    },
  "Organization_info.ein":          {
      type:  String,
      label: "EIN",
      max:   20
    },
  "Organization_info.date_founded": {
        type:     Date,
        label:    "Founding date",
        optional: true
      }
}));
