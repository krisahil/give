[![Codacy Badge](https://www.codacy.com/project/badge/cd0a18c7433547279f5409d4ec3297c1)](https://www.codacy.com/app/c316/give)


An opinionated donation app for Non-profits using <a href="https://stripe.com">Stripe</a> 
written in <a href="http://meteor.com">Meteor</a>.


## About

Give is used by Non-Profits to take donations using Stripe. Which includes Credit/Debit Cards, ACH, 
[ coming soon -> Bitcoin, and Apple Pay ]. 

## Problems addressed

Non-profits want to allow anyone to give with or without an account. However, we also want to give them credit for doing so.
This is a problem. How do we track givers while letting them give without an account? The answer is; we do all the hard work.
First, we will end up with a lot of customers in Stripe since each time a person gives without logging in we can't know if they've given before.
Second, we want to do our best to make sure we don't have duplicates in our CMS, so we search backwards and forwards to see if we can find them there.

If we think this is a new person, we insert them into the CMS as a new person and send off an email to the support admin letting them know we just inserted a 
new person. Chances are we'll end up with newly inserted people who really shouldn't be new people at all. 
Users misspell things, they change their address and phone numbers and sometimes give under shortened version of their names. 
(and these are just a few reasons we'll still get duplicates)



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
    "bcc_address": "this email is bcc'd anytime a gift receipt, schedule or pending email is sent",
    "canceled_gift_address": "group email for notifying when a recurring gift is canceled",
    "contact_address": "general contact email address",
    "donor_tools_site": "Get a DonorTools site, there is a two week free trial. http://www.donortools.com. Then use the site name that is assigned to you. It should look like this https://your_name.donortools.com",
    "full_org_name": "For example, 'Trash Mountain Project, Inc.'",
    "heap_id": "If you want to use Heap to track your app analytics",
    "large_gift_address": "group email for notifying when gifts larger than $500 are given",
    "newStuffVersion": "e.g. '0.9' This is used to show the user new updates and then increment those updates.",
    "org_city": "Your org city",
    "org_domain": "Your org domain, for example 'trashmountain.com'",
    "org_donate_url": "Your org donate page URL, for example 'https://trashmountain.com/donate'",
    "org_ein": "Your org tax id/EIN",
    "org_homepage_url": "Your org home page URL, for example 'https://trashmountain.com'",
    "org_is_501c3": true,
    "org_mission_statement": "Developing Christ-centered environments for children and families living in trash dump communities wordldwide.",
    "org_name": "Your org name",
    "org_phone": "Your org phone number",
    "org_state": "Your org state",
    "org_state_short": "Your org state abbreviation, for instance 'KS' for Kansas",
    "org_street_address": "Your org street address, for example '1555 NW Gage BLVD",
    "org_subdomain": "For example 'give' is the subdomain in this address -> https://give.trashmountain.com",
    "org_zip": "Your org zip",
    "other_support_addresses": ["array of addresses only currently used for the new account added emails"],
    "stripe_publishable: "publishable Stripe Key",
    "stripe_ach_verification_procedure": "e.g. none, micro-deposit, plaid (micro-deposit and plaid are still being developed and do not currently work)"
    "support_address": "support email address",
  }
}
```


## More

These are the integrations built into Give already

Payment Processing, including recurring gifts - Stripe

Mandrill (MailChimp's transactional email service) - Transactional emails (used for receipting and failure notices)

DonorTools, a CRM for non-profits.

You will need an account with each of these providers in order to use Give. 
The accounts are free up to a point. Stripe doesn't charge you a monthly fee, 
only a fee per transaction (2.9% + .30 per transaction for credit/debit cards). 
ACH fees are $.25 per charge and there is no fee for transfers to your own bank account after charging the customer. 

## License

MIT
