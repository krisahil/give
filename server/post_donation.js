_.extend(Utils, {
    post_donation_operation: function (customer_id, charge_id) {
        // If this is the dev environment I don't want it to affect DT live account.
        /*if(Meteor.settings.dev){
            return;
        }*/
        logger.info("Started post_donation_operation.");

        if(DT_donations.findOne({transaction_id: charge_id})){
            logger.info("There is already a DT donation with that charge_id in the collection");
            return;
        } else {
            // TODO: Check the connection to DT before starting, if it isn't good then schedule this to happen in an hour Meteor.setTimeout({ function here }, 3600000);
            // Don't see how to do this yet

            // create an email_address variable to be reused below
            var email_address = Customers.findOne(customer_id) && Customers.findOne(customer_id).email;

            // check that there was a customer record and that record had an email address
            if(email_address) {
                //create user
                var user_id = Utils.create_user(email_address, customer_id);

                //check dt for user, persona_ids will be an array of 0 to many persona_ids
                var persona_ids = Utils.check_for_dt_user(email_address);

                //create dt user since one wasn't found in DT
                if (persona_ids == '') {
                    //Call DT create function
                    var single_persona_id = Utils.insert_donation_and_donor_into_dt(customer_id, user_id, charge_id);

                    // the persona_ids is expected to be an array
                    persona_ids = [single_persona_id];

                    // Send me an email letting me know a new user was created in DT.
                    Utils.send_dt_new_dt_account_added(email_address, user_id, single_persona_id);
                } else {
                    Utils.insert_donation_into_dt(customer_id, user_id, persona_ids, charge_id);
                }

                Utils.update_stripe_customer_user(customer_id, user_id, email_address);

                // Get all of the donations related to the persona_id that was either just created or that was just used when
                // the user gave
                Utils.get_all_dt_donations(persona_ids);

                // forEach of the persona ids stored in the array run the insert_persona_id_into_user function
                persona_ids.forEach(function(element){
                    Utils.insert_persona_id_into_user(user_id, element);
                });
            } else {
                logger.error("Didn't find the customer record, exiting.");
                throw new Meteor.Error("Email doesn't exist", "Customer didn't have an email address", "Customers.findOne(customer_id) && Customers.findOne(customer_id).email from post_donation.js didn't find an email");
            }
        }
    },
    create_user: function (email, customer_id) {
        logger.info("Started create_user.");

        //Check to see if the user exists
        var user_id = Meteor.users.findOne({'emails.address': email});

        if(!user_id){
            // No user found with that email address

            // setup name variable
            var customer_cursor = Customers.findOne(customer_id);
            if(!customer_cursor.metadata.country){
                logger.error("No Country");
            }

            var fname = customer_cursor && customer_cursor.metadata.fname;
            var lname = customer_cursor && customer_cursor.metadata.lname;
            var profile = {
                fname: fname,
                lname: lname,
                address: {
                    address_line1: customer_cursor.metadata.address_line1,
                    address_line2: customer_cursor.metadata.address_line2,
                    city: customer_cursor.metadata.city,
                    state: customer_cursor.metadata.state,
                    postal_code: customer_cursor.metadata.postal_code,
                    country: customer_cursor.metadata.country
                },
                phone: customer_cursor.metadata.phone,
                business_name: customer_cursor.metadata.business_name
            };

            // Create a new user
            user_id = Accounts.createUser({email: email});

            // Add some details to the new user account
            Meteor.users.update(user_id, {$set: {
                    'profile': profile,
                    'primary_customer_id': customer_id
                }
            });

            // Send an enrollment Email to the new user
            Accounts.sendEnrollmentEmail(user_id);
        } else {
            logger.info("Found a user with the provided email address, didn't create a user.");
        }
        return user_id;
    },
    check_for_dt_user: function (email){
        /*try {*/
        //This function is used to get all of the persona_id s from DT if they exist or return false if none do
        logger.info("Started check_for_dt_user");

        var personResult;
        personResult = HTTP.get(Meteor.settings.donor_tools_site + "/people.json?search=" + email, {
            auth: Meteor.settings.donor_tools_user + ':' + Meteor.settings.donor_tools_password
        });

        if(personResult.data == ''){
            return [];
        } else {
            var personaIDs = [];
            personResult.data.forEach(function (element) {
                personaIDs.push(element.persona.id)
            });
            return personaIDs;
        }

        /*} catch (e) {
         console.log(e);
         //e._id = AllErrors.insert(e.response);
         var error = (e.response);
         throw new Meteor.Error(error, e._id);
         }*/
    },
    get_fund_id: function (donateTo) {
        logger.info("Started get_fund_id");
        // Take the text of donateTo and associate that with a fund id
        // don't delete any cases below, simply add new ones. If the name
        // changes on new gifts it may still be there on old gifts.

        // If a fund id changes you'll need to go into every case that fits that fund id and update the id
        switch(donateTo) {
            case "BaseCamp":
                return 63656;
                break;
            case "Basecamp":
                return 63656;
                break;
            case "Basecamp - Operations Expenses":
                return 63656;
                break;
            case "Urgent Operational Needs":
                return 63656;
                break;
            case "BaseCamp - Brett Durbin":
                return 60463;
                break;
            case "Basecamp - Brett Durbin":
                return 60463;
                break;
            case "Brett Durbin":
                return 60463;
                break;
            case "BaseCamp - Jon DeMeo":
                return 60464;
                break;
            case "Basecamp - Jon DeMeo":
                return 60464;
                break;
            case "Jon DeMeo":
                return 60464;
                break;
            case "BaseCamp - Shelley Setchell":
                return 60465;
                break;
            case "Basecamp - Shelley Setchell":
                return 60465;
                break;
            case "Shelley Setchell":
                return 60465;
                break;
            case "BaseCamp - John Kazaklis":
                return 60480;
                break;
            case "Basecamp - John Kazaklis":
                return 60480;
                break;
            case "John Kazaklis":
                return 60480;
                break;
            case "BaseCamp - Chris Mammoliti":
                return 63662;
                break;
            case "Basecamp - Chris Mammoliti":
                return 63662;
                break;
            case "Chris Mammoliti":
                return 63662;
                break;
            case "BaseCamp - Timm Collins":
                return 63665;
                break;
            case "Basecamp - Timm Collins":
                return 63665;
                break;
            case "Timm Collins":
                return 63665;
                break;
            case "BaseCamp - Isaac Tarwater":
                return 63682;
                break;
            case "Basecamp - Isaac Tarwater":
                return 63682;
                break;
            case "Isaac Tarwater":
                return 63682;
                break;
            case "BaseCamp - Joshua Bechard":
                return 63683;
                break;
            case "Basecamp - Joshua Bechard":
                return 63683;
                break;
            case "Joshua Bechard":
                return 63683;
                break;
            case "BaseCamp - James Hishmeh":
                return 65262;
                break;
            case "Basecamp - James Hishmeh":
                return 65262;
                break;
            case "James Hishmeh":
                return 65262;
                break;
            case "BaseCamp - Willie Brooks":
                return 65263;
                break;
            case "Basecamp - Willie Brooks":
                return 65263;
                break;
            case "Willie Brooks":
                return 65263;
                break;
            case "Basecamp - Ethan Pope":
                return 67051;
                break;
            case "Ethan Pope":
                return 67051;
                break;
            case "Basecamp - Lindsey Keller":
                return 67052;
                break;
            case "Lindsey Keller":
                return 67052;
                break;
            case "Int'l Field Projects - Honduras":
                return 60489;
                break;
            case "International Field Projects - Honduras":
                return 60489;
                break;
            case "Urgent Field Needs":
                return 63659;
                break;
            case "Int'l Field Projects - Where Needed Most":
                return 63659;
                break;
            case "International Field Projects - Where Most Needed":
                return 63659;
                break;
            case "Int'l Field Projects - Bolivia":
                return 67281;
                break;
            case "International Field Projects - Bolivia":
                return 67281;
                break;
            case "Int'l Field Projects - DR":
                return 60491;
                break;
            case "DR Urgent":
                return 60491;
                break;
            case "International Field Projects - Dominican Republic":
                return 60491;
                break;
            case "Int'l Field Projects - Kenya":
                return 67124;
                break;
            case "International Field Projects - Kenya":
                return 67124;
                break;
            case "Philippines Urgent":
                return 63689;
                break;
            case "Int'l Field Projects - Philippines":
                return 63689;
                break;
            case "International Field Projects - Philippines":
                return 63689;
                break;
            case "Comm Spon - Where Most Needed":
                return 67273;
                break;
            case "Community Sponsorship - Where Most Needed":
                return 67273;
                break;
            case "Comm Spon - Cochabamba, Bolivia":
                return 64197;
                break;
            case "Community Sponsorship - Bolivia - Cochabamba":
                return 64197;
                break;
            case "Comm Spon - Santiago, DR":
                return 63667;
                break;
            case "Community Sponsorship - Santiago":
                return 63667;
                break;
            case "Community Sponsorship - Dominican Republic - Santiago":
                return 63667;
                break;
            case "Santiago, DR - Community Sponsorship":
                return 63667;
                break;
            case "Honduras Community Sponsorship":
                return 63695;
                break;
            case "Comm Spon - Tegucigalpa, Honduras":
                return 63695;
                break;
            case "Community Sponsorship - Honduras - Tegucigalpa":
                return 63695;
                break;
            case "Comm Spon - Dandora, Kenya":
                return 67274;
                break;
            case "Community Sponsorship - Kenya - Dandora":
                return 67274;
                break;
            case "Comm Spon - Payatas, Philippines":
                return 67276;
                break;
            case "Community Sponsorship - Philippines - Payatas":
                return 67276;
                break;
            case "Comm Spon - San Mateo, Philippines":
                return 67282;
                break;
            case "Community Sponsorship - Philippines - San Mateo":
                return 67282;
                break;
            case "Comm Spon - Sant-Isabela, Philippines":
                return 67277;
                break;
            case "Community Sponsorship - Philippines - Santiago City/Isabella":
                return 67277;
                break;
            case "Comm Spon - Smokey Mtn, Philippines":
                return 64590;
                break;
            case "Community Sponsorship - Philippines - Smokey Mountain":
                return 64590;
                break;
            case "Tanza, Philippines - Community Sponsorship":
                return 63692;
                break;
            case "Comm Spon - Tanza, Philippines":
                return 63692;
                break;
            case "Community Sponsorship - Philippines - Tanza":
                return 63692;
                break;
            case "Honduras Urgent":
                return 60489;
                break;
            case "Where Most Needed":
                return 63661;
                break;
        }
    },
    insert_donation_and_donor_into_dt: function (customer_id, user_id, charge_id){
        /*try {*/
        logger.info("Started insert_donation_and_donor_into_dt");

        var customer =  Customers.findOne(customer_id);
        var charge =    Charges.findOne(charge_id);

        var source_id, business_name, payment_status, received_on;

        if (customer && customer.metadata.business_name){
            business_name = customer.metadata.business_name;
            source_id = 42776;
        }else{
            business_name = '';
            source_id = 42754;
        }

        var recognition_name;
        if(business_name){
            recognition_name = business_name;
        } else {
            recognition_name = customer.metadata.fname + " " + customer.metadata.lname;
        }

        payment_status = charge.status;
        received_on = moment(new Date(charge.created * 1000)).format("YYYY/MM/DD hh:mma");

        var dt_fund, invoice_cursor, donateTo;
        if(charge_id.slice(0,2) === 'ch' || charge_id.slice(0,2) === 'py'){
            invoice_cursor = Invoices.findOne({_id: charge.invoice});
            console.log("LOOOK HERERER LOEIRJEORJELIRELR III *****************???????????????");
            console.log(charge.invoice);
            console.dir(invoice_cursor.metadata);
            if(invoice_cursor && invoice_cursor.lines && invoice_cursor.lines.data[0] && invoice_cursor.lines.data[0].metadata && invoice_cursor.lines.data[0].metadata.donateTo){
                donateTo = invoice_cursor.lines.data[0].metadata.donateTo;

            } else{
                donateTo = charge && charge.metadata && charge.metadata.donateTo;
            }
        } else{
            // TODO: this area is to be used in case we start excepting bitcoin or other payment methods that return something other than a ch_ event object id
        }
        dt_fund = Utils.get_fund_id(donateTo);

        // fund_id 65663 is the No-Match-Found fund used to help reconcile
        // write-in gifts and those not matching a fund in DT
        var fund_id, memo;
        if(!dt_fund) {
            fund_id = Meteor.settings.donor_tools_default_fund_id;
            memo = Meteor.settings.dev + donateTo;
        } else {
            fund_id = dt_fund;
            memo = Meteor.settings.dev;
        }

        var newDonationResult;
        newDonationResult = HTTP.post(Meteor.settings.donor_tools_site + '/donations.json', {
            data: {
                "donation": {
                    "splits": [{
                        "amount_in_cents": charge.amount,
                        "fund_id": fund_id,
                        "memo": memo
                    }],
                    "donation_type_id": Meteor.settings.donor_tools_gift_type,
                    "received_on": received_on,
                    "source_id": source_id,
                    "payment_status": payment_status,
                    "transaction_id": charge_id,
                    "find_or_create_person": {
                        "company_name": business_name,
                        "full_name": customer.metadata.fname + " " + customer.metadata.lname,
                        "email_address": customer.metadata.email,
                        "street_address": customer.metadata.address_line1 + " \n" + customer.metadata.address_line2,
                        "city": customer.metadata.city,
                        "state": customer.metadata.state,
                        "postal_code": customer.metadata.postal_code,
                        "phone_number": customer.metadata.phone,
                        "web_address": Meteor.absoluteUrl("dashboard/users?userID=" + user_id),
                        "salutation_formal": customer.metadata.fname + " " + customer.metadata.lname,
                        "recognition_name": recognition_name
                    }
                }
            },
            auth: Meteor.settings.donor_tools_user + ':' + Meteor.settings.donor_tools_password
        });

        if(newDonationResult && newDonationResult.data && newDonationResult.data.donation && newDonationResult.data.donation.persona_id){
            return newDonationResult.data.donation.persona_id;
        } else {
            logger.error("The persona ID wasn't returned from DT, or something else happened with the connection to DT.");
            throw new Meteor.Error("Couldn't get the persona_id for some reason");
        }

        /*}
         catch (e) {
         console.log(e);
         //e._id = AllErrors.insert(e.response);
         var error = (e.response);
         throw new Meteor.Error(error, e._id);
         }*/
    },
    separate_donations: function(serverResponse){
        logger.info("Inside separate_donations");

        //Pull each donation from the array and send them to be inserted
        serverResponse.forEach(function (element) {
            Utils.insert_each_dt_donation(element.donation);
        });
    },
    insert_each_dt_donation: function(donation){
        logger.info("Inside insert_each_dt_donation with " + donation.id);

        //Insert each donation into the DT_donations collection
        donation._id = donation.id;
        //logger.info(donation._id);
        DT_donations.upsert({_id: donation._id}, donation);
    },
    separate_funds: function(fundResults){
        logger.info("Inside separate_funds");

        //Pull each donation from the array and send them to be inserted
        fundResults.forEach(function (element) {
            Utils.insert_each_dt_fund(element.fund);
            console.log(element);
        });
    },
    insert_each_dt_fund: function(fund){
        logger.info("Inside insert_each_dt_fund with " + fund.id);

        //Insert each donation into the DT_funds collection
        fund._id = fund.id;
        DT_funds.upsert({_id: fund._id}, fund);
    },
    get_all_dt_donations: function(persona_ids) {
        try {
            logger.info("Started get_all_dt_donations");

            if(persona_ids == '') {return;}
            persona_ids.forEach(function(id){
                var responseData;
                responseData = HTTP.get(Meteor.settings.donor_tools_site + "/people/" + id + '/donations.json?per_page=1000', {
                    auth: Meteor.settings.donor_tools_user + ':' + Meteor.settings.donor_tools_password
                });

                //Call the function to separate the donation array received from DT into individual donation
                Utils.separate_donations(responseData.data);
            });

        } catch (e) {
            console.log(e);
            //e._id = AllErrors.insert(e.response);
            var error = (e.response);
            throw new Meteor.Error(error, e._id);
        }
    },
    send_dt_search_email: function (email, name, id, personaIDs){

        //TODO: figure out if you want this function, discard if you don't
        //This email allows the recipient to quickly check DT for the user by searching for their email
        //If there were any persona_ids from DT then this email will include one link to each of the persona_ids
        //that matched the email address provided.
        //Clicking the link will take the admin user to the DonorTools page where they can confirm
        //that they would like to connect the meteor user with that DT persona_id by submitting the
        //DT Persona Insert form

        logger.info("Started send_dt_search_email");
        var html;
        if(personaIDs != ''){
            html = "<h1>DT account not found</h1><p><a href='https://trashmountain.donortools.com/personas?search=" + name + "&go=true'>Search DT for this person</a></p>";
            personaIDs.forEach(function (persona_id) {
                html += "<p><a href='https://trashmountain.com/give/donorTools?id=" + id + "&persona_id=" + persona_id + "&email=" + email + "&donation_id=" + donation_id + "'>Insert after finding or creating in DT</a></p>";
            });
        } else
            html = "<h1>DT account not found</h1><p><a href='https://trashmountain.donortools.com/personas?search=" + name + "&go=true'>Search DT for this person</a></p>" +
            "<p><a href='"+
            Meteor.absoluteUrl("donorTools?id=" + id + "&persona_id=&email=" + email + "&donation_id=" + donation_id ) +
            ">Insert after finding or creating in DT</a></p>";

        //Send email to reconcile DT personas

        Email.send({
            from: 'support@trashmountain.com',
            to: 'josh@trashmountain.com',
            subject: "DT account not found.",
            html: html
        });
    },
    insert_persona_id_into_user: function(user_id, persona_id) {
        //Insert the donor tools persona id into the user record
        logger.info("Started insert_persona_id_into_user");
        Meteor.users.update({_id: user_id}, {$addToSet: {'persona_id': parseInt(persona_id)}});
    },
    insert_donation_into_dt: function (customer_id, user_id, persona_ids, charge_id){
        /*try {*/
        logger.info("Started insert_donation_into_dt");

        //TODO: still need to fix the below for any time when the charge isn't being passed here, like for scheduled gifts
        if(Audit_trail.findOne({charge_id: charge_id}) && Audit_trail.findOne({charge_id: charge_id}).dt_donation_created){
            logger.info("Already inserted the donation into DT.");
            return;
        } else {
            Audit_trail.upsert({_id: charge_id}, {$set: {dt_donation_created: true}});
        }

        var customer = Customers.findOne(customer_id);
        var charge = Charges.findOne(charge_id);

        var dt_fund, donateTo, invoice_cursor;


        if(charge_id.slice(0,2) === 'ch' || charge_id.slice(0,2) === 'py') {
            if (charge.invoice) {
                invoice_cursor = Invoices.findOne({_id: charge.invoice});
                console.log("LOOOK HERERER LOEIRJEORJELIRELR III *****************???????????????");
                console.log(charge.invoice);
                console.dir(invoice_cursor.metadata);
                /*if (Invoices.findOne({_id: charge.invoice})) {
                    donateTo = Invoices.findOne({_id: charge.invoice}).metadata.donateTo;
                } else {
                    var invoice = Utils.get_invoice(charge.invoice);
                    donateTo = invoice.metadata.donateTo;
                }*/
                if(invoice_cursor && invoice_cursor.lines && invoice_cursor.lines.data[0] && invoice_cursor.lines.data[0].metadata && invoice_cursor.lines.data[0].metadata.donateTo){
                    donateTo = invoice_cursor.lines.data[0].metadata.donateTo;
                } else{
                    donateTo = charge && charge.metadata && charge.metadata.donateTo;
                }
            } else {
                donateTo = charge.metadata.donateTo;
            }
        } else{
            // TODO: this area is to be used in case we start excepting bitcoin or other payment methods that return something other than a ch_ event object id
        }


        dt_fund = Utils.get_fund_id(donateTo);

        //fund_id 65663 is the No-Match-Found fund used to help reconcile
        // write-in gifts and those not matching a fund in DT
        var fund_id, memo;
        if(!dt_fund) {
            fund_id = Meteor.settings.donor_tools_default_fund_id;
            memo = Meteor.settings.dev + donateTo;
        } else {
            fund_id = dt_fund;
            memo = Meteor.settings.dev;
        }
        var source_id;

        if (customer && customer.business_name){
            source_id = 42776;
        }else{
            source_id = 42754;
        }
        logger.info("FIRST PERSONA ID ** " + persona_ids && persona_ids[0]);
        var persona_id = persona_ids && persona_ids[0];

        var newDonationResult;
        newDonationResult = HTTP.post(Meteor.settings.donor_tools_site + '/donations.json', {
            data: {
                "donation": {
                    "persona_id": persona_id,
                    "splits": [{
                        "amount_in_cents": charge.amount,
                        "fund_id": fund_id,
                        "memo": memo
                    }],
                    "donation_type_id": Meteor.settings.donor_tools_gift_type,
                    "received_on": moment(new Date(charge.created * 1000)).format("YYYY/MM/DD hh:mma"),
                    "source_id": source_id,
                    "payment_status": charge.status,
                    "transaction_id": charge_id
                }
            },
            auth: Meteor.settings.donor_tools_user + ':' + Meteor.settings.donor_tools_password
        });

        if(newDonationResult && newDonationResult.data && newDonationResult.data.donation && newDonationResult.data.donation.persona_id){
            // Send the id of this new DT donation to the function which will update the charge to add that meta text.
            Utils.update_charge_with_dt_donation_id(charge_id, newDonationResult.data.donation.id);

            return newDonationResult.data.donation.persona_id;
        } else {
            logger.error("The persona ID wasn't returned from DT, or something else happened with the connection to DT.");
            throw new Meteor.Error("Couldn't get the persona_id for some reason");
        }

        /*}
         catch (e) {
         console.log(e);
         //e._id = AllErrors.insert(e.response);
         var error = (e.response);
         throw new Meteor.Error(error, e._id);
         }*/
    },
    send_dt_new_dt_account_added: function (email, user_id, personaID){

        logger.info("Started send_dt_new_persona_added_to_meteor_user");

        //Create the HTML content for the email.
        //Create the link to go to the new person that was just created.
        var html = "<h1>DT account created</h1><p>" +
            "Details: <br>Email: " + email + "<br>ID: " + user_id + "<br>Link: <a href='https://trashmountain.donortools.com/people/" + personaID +"'>" + personaID + "</a></p>";

        //Send email

        Email.send({
            from: 'support@trashmountain.com',
            to: 'josh@trashmountain.com',
            subject: "DT Account inserted.",
            html: html
        });
    },
    update_charge_with_dt_donation_id: function(charge_id, dt_donation_id){
        logger.info("Started update_charge_with_dt_donation_id");

        var stripeUpdateCharge = new Future();


        Stripe.charges.update(
            charge_id,
            {
                metadata: {dt_donation_id: dt_donation_id}
            },
            function (error, charge) {
                if (error) {
                    //console.dir(error);
                    stripeUpdateCharge.return(error);
                } else {
                    stripeUpdateCharge.return(charge);
                }
            }
        );

        stripeUpdateCharge = stripeUpdateCharge.wait();

        if (!stripeUpdateCharge.object) {
            throw new Meteor.Error(stripeUpdateCharge.rawType, stripeUpdateCharge.message);
        }

        console.dir(stripeUpdateCharge);

        return stripeUpdateCharge;
    },
    update_dt_status: function (charge_id, status, interval) {
        logger.info("Started update_dt_status");
        console.log("Interval: " + interval);
        console.log("Charge_id: " + charge_id);

        // Check to see if the donor tools donation has been inserted yet. Return if it hasn't
        Meteor.setTimeout(function(){
            var dt_donation = DT_donations.findOne({transaction_id: charge_id});

            if(dt_donation){
                console.log(dt_donation.id);
                var charge_cursor = Charges.findOne(charge_id);
                var get_dt_donation = HTTP.get(Meteor.settings.donor_tools_site + '/donations/' + dt_donation.id + '.json', {
                    auth: Meteor.settings.donor_tools_user + ':' + Meteor.settings.donor_tools_password
                });
                console.dir(get_dt_donation.data.donation);

                get_dt_donation.data.donation.payment_status = charge_cursor.status;
                if(charge_cursor.status === 'failed'){
                    get_dt_donation.data.donation.donation_type_id = 3921;
                }

                var update_donation = HTTP.call("PUT", Meteor.settings.donor_tools_site + '/donations/'+ dt_donation.id + '.json',
                    {
                        data: {"donation": get_dt_donation.data.donation},
                        auth: Meteor.settings.donor_tools_user + ':' + Meteor.settings.donor_tools_password
                    },
                    function (error, result) {
                        if (!error) {
                            return result;
                        } else {
                            if(!interval || interval < 10){
                                console.log(error + '\nFailed...retrying');
                                Meteor.setTimeout(function(){
                                    console.log(interval);
                                    Utils.update_dt_status(charge_id, status, interval+=1);
                                },60000);
                            } else{
                                logger.warn("Retried for 10 minutes, still could not connect.");
                            }
                        }
                    });

                DT_donations.update(dt_donation, {$set: {'payment_status': charge_cursor.status}});

            } else {
                // There may not actually be a problem here, just want a warning in case there is.
                logger.warn("There is no DT_donation found, can't update its status");
                return;
            }
        }, 20000);
    },
    audit_dt_donation: function (charge_id, customer_id, status){
        logger.info("Started audit_dt_donation");
        logger.info("Charge_id: " + charge_id);

        Audit_trail.upsert({_id: charge_id}, {$set: {dt_donation_created: true}});
        Audit_trail.upsert({_id: charge_id}, {$addToSet: {status: {dt_donation_status_updated_to: status, time: moment().format("MMM DD, YYYY hh:mma")}}});
        Utils.update_dt_status(charge_id, status, 1);
        Utils.post_donation_operation(customer_id, charge_id);
    }
});