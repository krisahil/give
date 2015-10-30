[![Codacy Badge](https://www.codacy.com/project/badge/cd0a18c7433547279f5409d4ec3297c1)](https://www.codacy.com/app/c316/give)


A donation page for Non-profits using <a href="https://stripe.com">Stripe</a> written in <a href="http://meteor.com">Meteor</a>


## About

Give is used by Non-Profits to take donations using Stripe. Which includes Credit/Debit Cards, Bitcoin, Apple Pay and ACH. 


## Setup

At this point you will need a developer to use this software. Give is a working system, but it does take some knowledge of Meteor/Node.js to configure and make it useful for your organization. I'm working hard to make this something that any organization can use.

## Example

https://give.trashmountain.com/landing

This is a live giving page, which is being used by Trash Mountain Project. 

## Settings.json file

Here is an example settings.json file

```
{
  "dev": "****TEST****", //Remove this text. If you are using this settings.json file on the dev side include this text, if on the live side, leave it blank.
  "mandrillUsername": "Get a free Mandrill account http://mandrill.com/",
  "mandrillKey": "http://mandrill.com/",
  "kadiraAppId": "Get a free account here https://kadira.io/",
  "kadiraAppSecret": "https://kadira.io/",
  "admin_user": "user _id of any user that can use the dashboard as an admin",
  "donor_tools_site": "Get a DonorTools site, there is a two week free trial. http://www.donortools.com. Then use the site name that is assigned to you. It should look like this https://your_name.donortools.com",
  "donor_tools_user": "",
  "donor_tools_password": "",
  "donor_tools_gift_type": "use this to assign a type to any gifts given through the site",
  "donor_tools_default_fund_id": "If a match can't be found 'Give' will use this id",
  "stripe": {
    "secret": "Secrete Stripe key",
    "plan": {
      "yearly": "Stripe plan name associated with yearly (annual) gifts",
      "monthly": "Stripe plan name associated with monthly gifts",
      "weekly": "Stripe plan name associated with weekly gifts"
    }
  },
  "papertrail": {
    "port": "12344" // Used for sending logs to papertrailapp.com
  },
  "sikka": { //Remove this text, sikka is a firewall for Meteor (prevents DOS) https://atmospherejs.com/meteorhacks/sikka
    "rateLimits": {
      "perIp": "100"
    }
  },
  "public": {
    "URL": "giving page URL, you should use https://"
    "stripe": {
      "publishable": "publishable Stripe Key"
    },
    "contact_address": "general contact email address",
    "support_address": "support email address",
    "other_support_addresses": ["array of addresses only currently used for the new account added emails"],
    "canceled_gift_address": "group email for notifying when a recurring gift is canceled",
    "bcc_address": "this email is bcc'd anytime a gift receipt, schedule or pending email is sent",
    "large_gift_address": "group email for notifiying when gifts larger than $500 are given",
    "org_name": "Your org name",
    "org_street_address": "Your org street address, for example '1555 NW Gage BLVD",
    "org_city": "Your org city",
    "org_state": "Your org state",
    "org_state_short": "Your org state abbreviation, for instance 'KS' for Kansas",
    "org_zip": "Your org zip",
    "org_phone": "Your org phone number",
    "org_ein": "Your org tax id/EIN",
    "org_is_501c3": true,
    "org_homepage_url": "Your org home page URL, for example 'https://trashmountain.com'"
  }
}
```


## More

These are the integrations built into Give already

Payment Processing, including recurring gifts - Stripe

Mandrill (MailChimp's transactional email service) - Transactional emails (used for receipting and failure notices)

DonorTools, a CRM for non-profits.

You will need an account with each of these providers in order to use Give. The accounts are free up to a point. Stripe doesn't charge you a monthly fee, only a fee per transaction (2.9% + .30 per transaction). In order to use the ACH service you do need to escrow some money since ACH doesn't have the protections for the processor that credit cards do. ACH fees are $.25 per charge and there is no fee for transfers to your own bank account after charging the customer. 

## License

MIT
