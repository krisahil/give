_.extend(Utils, {
    update_dt_account: function(form, dt_persona_id){
        logger.info("Inside update_dt_account.");

        // get the persona record from Donor Tools
        var get_dt_persona = HTTP.get(Meteor.settings.donor_tools_site + '/people/' + dt_persona_id + '.json', {
            auth: Meteor.settings.donor_tools_user + ':' + Meteor.settings.donor_tools_password
        });

        // Store the relevant object
        var persona = get_dt_persona.data.persona;

        // Get the IDs needed to update the object
        var name_id = get_dt_persona.data.persona.names[0].id;
        var address_id = get_dt_persona.data.persona.addresses[0].id;
        var phone_id = get_dt_persona.data.persona.phone_numbers[0].id;
        var email_id = get_dt_persona.data.persona.email_addresses[0].id;
        var web_id = get_dt_persona.data.persona.web_addresses[0].id;

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


        var update_persona = HTTP.call("PUT", Meteor.settings.donor_tools_site + '/people/'+ dt_persona_id + '.json',
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

    }
});