// $EXPERIMENTAL$ $ENHANCED_CONTAINMENT_ACCESS$ $STRICT_MODE$ $WARNING_AS_ERROR$

// this script refreshes the user_blank_check column in the HAZOP

var featureChangeListener = {
  getMetaClassFeaturesMap: function () {
    var eClassFeaturesList = [];
    eClassFeaturesList.push(Metamodel.hazop.HazopEntry);
    eClassFeaturesList.push([]);
    return eClassFeaturesList;
  },

  handleElementCreated: function (createdElement, context) {},

  handleModelModified: function (notification, context) {
    var modifiedElement = notification.getNotifier();

    return function () {
      Global.notifyFeatureUpdate(modifiedElement, "user_blank_check");
    };
  },

  handleElementDeleted: function (
    deletedElement,
    containmentReference,
    containerElement,
    containerResource,
    context
  ) {},
};
// create a new Java bridge object (Rhino does the mapping!)
new PostFeatureChangeListener(featureChangeListener);
