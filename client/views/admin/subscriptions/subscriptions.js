Template.AdminSubscriptions.events({
  'click .addingNewPerson': function ( e ){
    e.preventDefault();
    let addingNew = $(".addingNewPerson").data("add");
    Session.set("addingNew", addingNew);
  },
  'click .stop-button': function (e) {
    console.log("Clicked stop");
    let subscription_id = this._id;
    let customer_id = this.customer;

    $(e.currentTarget).button('Working');

    swal({
      title: "Are you sure?",
      text: "Please let us know why you are stopping this recurring gift.",
      type: "input",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "Yes, stop it!",
      cancelButtonText: "No",
      closeOnConfirm: false,
      closeOnCancel: false
    }, function(inputValue){

      if (inputValue === "") {
        inputValue = "Not specified - Admin cancelled";
      }

      if (inputValue === false){
        swal("Ok, we didn't do anything.",
          "success");
        $(e.currentTarget).button('reset');
      } else if (inputValue) {
        console.log("Got to before method call with input of " + inputValue);
        var opts = {color: '#FFF', length: 60, width: 10, lines: 8};
        var target = document.getElementById('spinContainer');
        spinnerObject = new Spinner(opts).spin(target);
        $("#spinDiv").show();
        Meteor.call("stripeCancelSubscription", customer_id, subscription_id, inputValue, function(error, response){
          if (error){
            confirm.button("reset");
            Bert.alert(error.message, "danger");
            spinnerObject.stop();
            $("#spinDiv").hide();
            $(e.currentTarget).button('reset');
          } else {
            // If we're resubscribed, go ahead and confirm by returning to the
            // subscriptions page and show the alert
            console.log(response);
            spinnerObject.stop();
            $("#spinDiv").hide();
            swal("Cancelled", "That recurring gift has been stopped.", "error");
          }
        });
      }
    });
  },
  'click .edit-button': function (e) {
    e.preventDefault();
    console.log("Clicked edit");
    let self = this;

    Session.set("change_subscription_id", this._id);
    Session.set("change_customer_id", this.customer);
    Session.set('change_donateTo', this.metadata.donateTo);
    Session.set('change_amount', this.quantity);
    Session.set('change_date', this.current_period_end);

    $('#modal_for_admin_subscription_change_form').modal({
      show: true,
      backdrop: 'static'
    });

    Meteor.setTimeout(function() {
      $("select option").filter(function() {
        //may want to use $.trim in here
        return $(this).text() == self.metadata.donateTo;
      }).prop('selected', true).change();
    }, 0);
  },
  'keyup .search': function () {
    let searchValue = $(".search").val();

    // Remove punctuation and make it into an array of words
    searchValue = searchValue
      .replace(/[^\w\s]|_/g, "")
      .replace(/\s+/g, " ");

    Session.set("searchValue", searchValue);
  },
  'change .search': function () {
    let searchValue = $(".search").val();

    // Remove punctuation and make it into an array of words
    searchValue = searchValue
      .replace(/[^\w\s]|_/g, "")
      .replace(/\s+/g, " ");

    Session.set("searchValue", searchValue);
  },
  'click .reset-button': function () {
    $(".search").val("").change();
  }
});

Template.AdminSubscriptions.helpers({
  subscriptions: function () {
    return Subscriptions.find();
  },
  searchSubscriptions: function () {
    if(Session.equals("searchValue", "")){
      return Subscriptions.find();
    } else if(!Session.get("searchValue")) {
      return;
    } else {
      return Subscriptions.find( {
        $or: [
          { 'metadata.fname': {$regex: Session.get("searchValue"), $options: 'i' } },
          { 'metadata.lname': {$regex: Session.get("searchValue"), $options: 'i' } }
        ]
      } );
    }
  }
});

Template.AdminSubscriptions.onCreated( function () {
  Session.set("searchValue", "");
});
