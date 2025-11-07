// $EXPERIMENTAL$ $STRICT_MODE$ $WARNING_AS_ERROR$

// this script updates Safe Fault Fraction of DC failure mode entries to 100% automatically when they are created.

var featureChangeListener = {
  getMetaClassFeaturesMap: function () {
    var eClassFeaturesList = [];
    eClassFeaturesList.push(Metamodel.dc.DCFailureModeEntry);
    // eClassFeaturesList.push(Metamodel.dc.DCWorksheet);
    eClassFeaturesList.push([]);
    return eClassFeaturesList;
  },

  handleElementCreated: function (createdElement, context) {
    return function () {
      createdElement.safeFaultFraction = parseBigDecimal("100");
      createdElement.user_comment =
        "Safe Fault Fraction is updated to 100% automatically.";
    };
  },

  handleModelModified: function (notification, context) {},

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
