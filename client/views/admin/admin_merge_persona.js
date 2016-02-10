
Template.AdminMergePersona.onRendered(function () {
  // Setup parsley form validation
  $('#quick_move').parsley();

});

Template.AdminMergePersona.events({
  'submit form': function(e) {
    //prevent the default reaction to submitting this form
    e.preventDefault();
    // Stop propagation prevents the form from being submitted more than once.
    e.stopPropagation();

    var opts = {color: '#FFF', length: 60, width: 10, lines: 8};
    var target = document.getElementById('spinContainer');
    spinnerObject = new Spinner(opts).spin(target);

    $("#spinDiv").show();

    Meteor.call("merge_dt_persona", Number($("#old-persona-id").val()), Number($("#new-persona-id").val()), function (error, result) {
      if (result) {
        console.dir(result);
        $("#spinDiv").hide();
        $('#modal_for_admin_merge_persona').modal('hide');
        Bert.alert(result);
      } else {
        $("#spinDiv").hide();
        $('#modal_for_admin_merge_persona').modal('hide');
        console.log(error);
      }
    });

  }
});