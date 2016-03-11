_.extend(Utils, {
  update_dt_account: function(form, dt_persona_id){
        logger.info("Inside update_dt_account.");

        // get the persona record from Donor Tools
        var get_dt_persona = HTTP.get(Meteor.settings.public.donor_tools_site + '/people/' + dt_persona_id + '.json', {
            auth: Meteor.settings.donor_tools_user + ':' + Meteor.settings.donor_tools_password
        });

        // Store the relevant object
        var persona = get_dt_persona.data.persona;

        // Get the IDs needed to update the object
        var address_id = get_dt_persona.data.persona.addresses[0].id;
        var phone_id = get_dt_persona.data.persona.phone_numbers[0].id;

        // Reinitialize a blank persona record
        persona = {};

        // Shape the data the way it needs to go into the persona record
        var street_address = form.address.address_line1 + " \n" + form.address.address_line2;
        persona.addresses = [];
        persona.addresses[0] = {
            "id": address_id,
            "city": form.address.city,
            "state": form.address.state,
            "street_address": street_address,
            "postal_code": form.address.postal_code
        };
        persona.phone_numbers = [];
        persona.phone_numbers[0] = {
            "id": phone_id,
            phone_number: form.phone
        };


        var update_persona = HTTP.call("PUT", Meteor.settings.public.donor_tools_site + '/people/'+ dt_persona_id + '.json',
            {
                data: {"persona": persona},
                auth: Meteor.settings.donor_tools_user + ':' + Meteor.settings.donor_tools_password
            });

        var insertedPersonaInfo = Meteor.users.update({_id: Meteor.userId(), 'persona_info.id': dt_persona_id},
            {
                $set:
                {
                    'persona_info.$': update_persona.data.persona
                }
            });
    },
  getFundHistory: function (fundId, dateStart, dateEnd) {
    logger.info("Got to getFundHistory with fund_id: " + fundId);

    var totalPages = 3;
    for(i = 1; i <= totalPages; i++){
      var dataResults;
      dataResults = HTTP.get(Meteor.settings.public.donor_tools_site + '/splits.json?basis=cash&fund_id=' + fundId + '&range[from]=' +
        dateStart + '&range[to]=' + dateEnd + '&page=' + i + '&per_page=1000', {
        auth: Meteor.settings.donor_tools_user + ':' + Meteor.settings.donor_tools_password
      });
      Utils.store_splits(dataResults.data);
      totalPages = dataResults.headers['pagination-total-pages'];
    }
    console.dir(dataResults);
  },
  store_splits: function (donations) {
    donations.forEach( function ( split ) {
      //console.log(split.split);
      DT_splits.upsert({_id: split.split.id}, {$set: split.split});
    });

  },
  update_dt_donation_status: function ( event_object ) {
    logger.info("Started update_dt_donation_status");

    let transaction_id, get_dt_donation, update_donation, dt_donation_id;

    transaction_id = event_object.data.object.id;

    get_dt_donation = HTTP.get(Meteor.settings.public.donor_tools_site + '/donations.json?transaction_id=' + transaction_id, {
      auth: Meteor.settings.donor_tools_user + ':' + Meteor.settings.donor_tools_password
    });
    console.log(get_dt_donation.data[0].donation);
    dt_donation_id = get_dt_donation.data[0].donation.id;

    if(get_dt_donation.data[0].donation.payment_status === event_object.data.object.status &&
      !event_object.data.object.refunded) {
      return;
    }

    if(event_object.data.object.refunded){
      get_dt_donation.data[0].donation.payment_status = 'refunded';
    } else {
      get_dt_donation.data[0].donation.payment_status = event_object.data.object.status;
    }

    if(event_object.data.object.status === 'failed'){
      // 3921 is the failed type in Donor Tools
      get_dt_donation.data[0].donation.donation_type_id = 3921;
    }

    update_donation = HTTP.call("PUT", Meteor.settings.public.donor_tools_site + '/donations/'+ dt_donation_id + '.json',
      {
        data: {"donation": get_dt_donation.data[0].donation},
        auth: Meteor.settings.donor_tools_user + ':' + Meteor.settings.donor_tools_password
      });

    console.dir(update_donation);
    DT_donations.upsert( {_id: dt_donation_id}, update_donation.data.donation );
  },
  find_dt_persona_flow: function (email, customer_id) {
    logger.info("Started find_dt_persona_flow");

    let personResult, matched_id, metadata, orgMatch, personMatch;

    // Get all the ids that contain this email address.
    personResult = HTTP.get(Meteor.settings.public.donor_tools_site + "/people.json?search=" + email + "&fields=email_address", {
      auth: Meteor.settings.donor_tools_user + ':' + Meteor.settings.donor_tools_password
    });

    // TODO: What if the user's name and all their detail is correct, but they give a new
    // email address that doesn't exist in DT?
    // In this case we'll return null; Do we want to?

    if(personResult){
      metadata = Customers.findOne( { _id: customer_id } ).metadata;
      // Step 1b
      if( metadata.business_name ) {
        orgMatch = _.find( personResult.data, function ( value ) {
          return value.persona.company_name
        } );
        if( orgMatch ) {
          // Does the company name in DT match the company name provided by the user?'
          if( orgMatch.persona.company_name.toLowerCase() === metadata.business_name.toLowerCase() ) {
            // Return value.id as the DT ID that has matched what the user inputted
            matched_id = orgMatch.persona.id;
            // return the matched DT persona id
            return matched_id;
          } else {
            // Create new company in DT, since this one didn't match what they gave us
            return null;
          }

        } else {
          // Create new company in DT, since this one (or these) didn't match what they gave us
          return null;
        }
      } else {
        orgMatch = _.find( personResult.data, function ( value ) {
          return !value.persona.company_name
        } );

        if( orgMatch ) {
          personMatch = _.find( personResult.data, function ( el ) {

            if( el.persona.names.some( function ( value ) {
                if( value.first_name.toLowerCase() === metadata.fname.toLowerCase() && value.last_name.toLowerCase() === metadata.lname.toLowerCase() ) {
                  console.log(value);
                  // returning true here tells the function that this is the record inside which the correct name is found
                  return true;
                }
              } ) ) {
              // Looked through all of the name arrays inside of all of the persona's and there was a match
              return true;
            }
          } );
          // return the matched DT persona id if it exists, else return null since there was no name match here.
          if(personMatch) {
            return personMatch.persona.id;
          } else {
            return null;
          }

        } else {
          // Create new person in DT, since this one (or these) didn't match what they gave us
          return null;
        }
      }
    } else {
      // Step 1a
      // Return null for no email matches
      return null;
    }
  },
  'work_with_the_stripe_charge_to_update_dt_donations': function (charge_id) {
    // TODO: remove this function too, not using it

    var audit_item = Audit_trail.findOne({_id: charge_id});

    if (!persona_result || !persona_result.persona_info || persona_result.persona_info === '' || matchedId === null) {
      //Call DT create function
      if(audit_item && audit_item.status && audit_item.status.dt_donation_inserted){
        return;
      } else {
        inserted_now = Audit_trail.update({_id: charge_id}, {$set: {status: {dt_donation_inserted: true, dt_donation_inserted_time: moment().format("MMM DD, YYYY hh:mma")}}});
        var single_persona_id = Utils.insert_donation_and_donor_into_dt(customer_id, user_id, charge_id);
        persona_result = Utils.check_for_dt_user(email_address, single_persona_id, true);
        //return {persona_ids: personaData.persona_ids, persona_info: personaData.persona_info, matched_id: 'not used'};


        // Send me an email letting me know a new user was created in DT.
        Utils.send_new_dt_account_added_email_to_support_email_contact(email_address, user_id, single_persona_id);
      }
    } else {
      if(audit_item && audit_item.status && audit_item.status.dt_donation_inserted){
        return;
      } else {
        inserted_now = Audit_trail.update({_id: charge_id}, {$set: {status: {dt_donation_inserted: true, dt_donation_inserted_time: moment().format("MMM DD, YYYY hh:mma")}}});

        Utils.insert_donation_into_dt(customer_id, user_id, persona_result.persona_info, charge_id, persona_id);
      }
    }

    // Get all of the donations related to the persona_id that was either just created or that was just used when
    // the user gave
    Utils.get_all_dt_donations(persona_result.persona_ids);

    Utils.for_each_persona_insert(persona_result.persona_info, user_id);

    //TODO: Get persona info here, only an id right now.
    //Meteor.users.update(user_id, {$set: {'persona_info': persona_result}});

  },
  check_for_dt_user: function ( email, checkThisDTID, use_id, customer_id ){
    console.log(email);

    // TODO: remove use_id part of this, I'm not using it
    try {
      // This function is used to get all of the persona_id (there might be many)
      // from DT if they exist or return false if none do
      logger.info( "Started check_for_dt_user" );
      logger.info( "ID: ", checkThisDTID );

      let personResult, matched_id, getPersonasAndMatchedId, personaMatchData, personaData;
      if( use_id ){
        console.log("Using found ID");
        personResult = HTTP.get(Meteor.settings.public.donor_tools_site + "/people/" + checkThisDTID + ".json", {
          auth: Meteor.settings.donor_tools_user + ':' + Meteor.settings.donor_tools_password
        });
        personaData = Utils.split_dt_persona_info( email, personResult );
        return {persona_ids: personaData.persona_ids, persona_info: personaData.persona_info, matched_id: 'not used'};
      } else {
        console.log("Inside the no id section");
        if(Audit_trail.findOne( {_id: customer_id} ) && Audit_trail.findOne( {_id: customer_id} ).flow_checked ) {

          console.log("Checked for and found a audit record for this customer creation flow, skipping the account creation.");
          return;

        } else {
          console.log("Checked for and didn't find an audit record for this customer creation flow.");

          Audit_trail.upsert({_id: customer_id}, {$set: {flow_checked: true}});
          getPersonasAndMatchedId = Utils.find_dt_persona_flow(email, customer_id);
          console.dir(getPersonasAndMatchedId);
          personaMatchData = getPersonasAndMatchedId.personResult;
          matched_id = getPersonasAndMatchedId.matched_id;

          personaData = Utils.split_dt_persona_info( email, personaMatchData );
        }

        return {persona_ids: personaData.persona_ids, persona_info: personaData.persona_info, matched_id: matched_id};

      }

    } catch ( e ) {
      logger.error( e );
      var error = ( e.response );
      throw new Meteor.Error( error, e._id );
    }
  },
  'find_dt_account_or_make_a_new_one': function (customer, user_id) {

    var dt_persona_match_id;
    if(Audit_trail.findOne( {_id: customer.id} ) && Audit_trail.findOne( {_id: customer.id} ).flow_checked ) {

      console.log("Checked for and found a audit record for this customer creation flow, skipping the account creation.");
      return;

    } else {
      logger.info( "Checked for and didn't find an audit record for this customer." );
      Audit_trail.upsert( { _id: customer.id }, { $set: { flow_checked: true } } );

      // Run the necessary checks to find which DT account this customer should
      // be associated with (if any)
      dt_persona_match_id = Utils.find_dt_persona_flow( customer.email, customer.id );
      console.log(dt_persona_match_id);

      if( !dt_persona_match_id ) {
        // Create a new Donor Tools account and assign the id to the dt_persona_match_id let
        dt_persona_match_id = Utils.create_dt_account(customer, user_id);

        // Send an email to the support users telling them that a new DT account was added
        Utils.send_new_dt_account_added_email_to_support_email_contact( customer.email, user_id, dt_persona_match_id );
      }

      logger.info( "The donor Tools ID for this customer is ", dt_persona_match_id );
      return dt_persona_match_id;

    }
  },
  'create_dt_account': function ( customer, user_id ){
    console.log("Started create_dt_account");

    let metadata, newDTPerson, recognition_name, address_line2, is_company;


    if(!customer.metadata) {
      logger.info("No metadata included with this customer object, setting it by " +
        "finding the document inside the customer's collection");
      metadata = Customers.findOne( { _id: customer.id } ).metadata;
    } else {
      metadata = customer.metadata;
    }
    if(metadata.business_name){
      recognition_name = metadata.business_name;
      is_company = true;
    } else {
      recognition_name = metadata.fname + " " + metadata.lname;
      is_company = false;
    }

    if(metadata.address_line2){
      address_line2 = metadata.address_line2;
    } else {
      address_line2 = '';
    }



    newDTPerson = HTTP.post(Meteor.settings.public.donor_tools_site + '/people.json', {
      "data": {
        "persona": {
          "company_name":      metadata.business_name,
          "is_company":        is_company,
          "names":             [
            {
              "first_name": metadata.fname,
              "last_name":  metadata.lname
            }
          ],
          "email_addresses":   [
            {
              "email_address": metadata.email
            }
          ],
          "street_address":    metadata.address_line1 + " \n" + address_line2,
          "city":              metadata.city,
          "state":             metadata.state,
          "postal_code":       metadata.postal_code,
          "phone_numbers":     [
            {
              "phone_number": metadata.phone
            }
          ],
          "web_addresses":     [
            {
              "web_address": Meteor.absoluteUrl( "dashboard/users?userID=" + user_id )
            }
          ],
          "salutation_formal": metadata.fname + " " + metadata.lname,
          "recognition_name":  recognition_name
        }
      },
      auth: Meteor.settings.donor_tools_user + ':' + Meteor.settings.donor_tools_password
    });


    return newDTPerson.data.persona.id;
  },
  'insert_gift_into_donor_tools': function ( charge_id, customer_id ) {
    logger.info("Started insert_gift_into_donor_tools");

    console.log("Charge_id: ", charge_id, " Customer_id: ", customer_id);
    let chargeCursor, dt_fund, donateTo, invoice_cursor,
      fund_id, memo, source_id, newDonationResult, metadata;

    chargeCursor =  Charges.findOne({_id: charge_id});

    const customerCursor =  Customers.findOne({_id: customer_id});

    if( Audit_trail.findOne( { _id: chargeCursor._id } ) && Audit_trail.findOne( { _id: chargeCursor._id } ).dt_donation_inserted ){
      logger.info("Already inserted the donation into DT.");

      // TODO: update the DT donation from here?
      return;
    } else {
      Audit_trail.upsert({_id: chargeCursor._id}, {$set: {dt_donation_inserted: true}});
    }


    if(charge_id.slice(0,2) === 'ch' || charge_id.slice(0,2) === 'py') {
      if (chargeCursor.invoice) {
        invoice_cursor = Invoices.findOne({_id: chargeCursor.invoice});
        if(invoice_cursor &&
          invoice_cursor.lines &&
          invoice_cursor.lines.data[0] &&
          invoice_cursor.lines.data[0].metadata &&
          invoice_cursor.lines.data[0].metadata.donateTo){
          metadata = invoice_cursor.lines.data[0].metadata;
        } else{
          metadata = chargeCursor.metadata;
        }
      } else {
        metadata = chargeCursor.metadata;
      }
    } else{
      // TODO: this area is to be used in case we start excepting bitcoin or
      // other payment methods that return something other than a ch_  or py_
      // event object id
    }

    donateTo = metadata.donateTo;

    if(donateTo){
      dt_fund = Utils.get_fund_id( donateTo );
      console.log(dt_fund);
    }
    else {
      dt_fund = null;
    }

    // fund_id 65663 is the No-Match-Found fund used to help reconcile
    // write-in gifts and those not matching a fund in DT
    if( !dt_fund ) {
      fund_id = Meteor.settings.donor_tools_default_fund_id;
      memo = Meteor.settings.dev +
        metadata &&
        metadata.frequency &&
        metadata.frequency.charAt(0).toUpperCase() +
        metadata.frequency.slice(1) + " " + donateTo;

    } else {
      fund_id = dt_fund;
      memo = Meteor.settings.dev + metadata &&
      metadata.frequency &&
      metadata.frequency.charAt(0).toUpperCase() +
      metadata.frequency.slice(1);
      if( metadata && metadata.note ){
        memo = memo + " " + metadata.note;
      }
    }
    if(!memo){
      logger.error(charge_id, customer_id);
      logger.error(metadata);
      logger.error("Something went wrong above, it looks like there is no metadata on this object.");
    }

    if ( customerCursor && customerCursor.metadata && customerCursor.metadata.business_name ){
      source_id = 42776;
    }
    if( metadata && metadata.dt_source ){
      source_id = metadata.dt_source;
    } else {
      source_id = 42754;
    }

    console.log("Persona ID is: ", customerCursor.metadata.dt_persona_id);

      try {
        logger.info( "Started checking for this person in DT" );
        let checkPerson;
        checkPerson = HTTP.get( Meteor.settings.public.donor_tools_site + '/people/' +
          customerCursor.metadata.dt_persona_id + '.json', {
          auth: Meteor.settings.donor_tools_user + ':' + Meteor.settings.donor_tools_password
        } );
        console.log( checkPerson.data );
      } catch( e ) {
        logger.info( "------No Person with the DT ID of " +
          customerCursor.metadata.dt_persona_id + " found in DT--------" );
        Utils.send_failed_to_add_to_dt_email_to_support( customerCursor.metadata.dt_persona_id, charge_id );
        throw new Meteor.Error( e );
      }

    newDonationResult = HTTP.post(Meteor.settings.public.donor_tools_site + '/donations.json', {
      data: {
        "donation": {
          "persona_id": customerCursor.metadata.dt_persona_id,
          "splits": [{
            "amount_in_cents": chargeCursor.amount,
            "fund_id": fund_id,
            "memo": memo
          }],
          "donation_type_id": Meteor.settings.donor_tools_gift_type,
          "received_on": moment(new Date(chargeCursor.created * 1000)).format("YYYY/MM/DD hh:mma"),
          "source_id": source_id,
          "payment_status": chargeCursor.status,
          "transaction_id": charge_id
        }
      },
      auth: Meteor.settings.donor_tools_user + ':' + Meteor.settings.donor_tools_password
    });

    newDonationResult.data.donation._id = newDonationResult.data.donation.id;
    DT_donations.upsert({_id: newDonationResult.data.donation.id}, newDonationResult.data.donation );


    if(newDonationResult && newDonationResult.data && newDonationResult.data.donation && newDonationResult.data.donation.persona_id){
      // Send the id of this new DT donation to the function which will update the charge to add that meta text.
      Utils.update_charge_with_dt_donation_id(charge_id, newDonationResult.data.donation.id);

      // Get all of the donations related to the persona_id that was either just created or that was just used when
      // the user gave
      Utils.get_all_dt_donations([customerCursor.metadata.dt_persona_id]);

      return newDonationResult.data.donation.persona_id;
    } else {
      logger.error("The persona ID wasn't returned from DT, or something else happened with the connection to DT.");
      throw new Meteor.Error("Couldn't get the persona_id for some reason");
    }
  }
});