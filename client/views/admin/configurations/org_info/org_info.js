/*****************************************************************************/
/* OrgInfo: Event Handlers */
/*****************************************************************************/
Template.OrgInfo.events({
});

/*****************************************************************************/
/* OrgInfo: Helpers */
/*****************************************************************************/
Template.OrgInfo.helpers({
  updateDoc: function () {
    return Books.findOne({_id: "nW6dSfSfqALNcqZuS"} );
  }
});

/*****************************************************************************/
/* OrgInfo: Lifecycle Hooks */
/*****************************************************************************/
Template.OrgInfo.onCreated(function () {
});

Template.OrgInfo.onRendered(function () {
});

Template.OrgInfo.onDestroyed(function () {
});
