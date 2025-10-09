// $EXPERIMENTAL$ $STRICT_MODE$ $WARNING_AS_ERROR$
/*
 * Explanation: This script is a part of the functionality "Separate Requirement ID for different requirment models".
 *              It adds 1 to profile user_id_prefix_counter of requirement models.
 * Usage: Fill in the id_prefix and id_prefix_counter of requirement models. The ID of requirements will follow the numbering pattern.
 *   For example, with id_prefix = FSR, id_prefix_counter = 0001, the next requirement will be FSR-0001, and the next of the next will be FSR-0002.
 *   Different requirement models have their own id_prefix and id_prefix_counter.
 *   Old requirments' ID will not be changed.
 * Installation: Use diff/merge to copy the following settings to the target project from the functionality mprx.
 *   - Configuration Files/scripts/.hooks/separate_autocounter.js
 *   - Configuration Files/scripts/.hooks/separate_autocounter.md5
 *   - Project Settings/Autocounter patterns/Requirement
 *   - Project Settings/Profiling/Safety Goals/Requirements Model/id_prefix
 *   - Project Settings/Profiling/Safety Goals/Requirements Model/id_prefix_counter
 *
 * Alternative Installation: Manually copy the following files or update attributes.
 *   - Copy Configuration Files/scripts/.hooks/separate_autocounter.js (this file)
 *   - Copy Configuration Files/scripts/.hooks/separate_autocounter.md5
 *   - Set Project Settings/Autocounter patterns/Requirement to {ID::!model$user_id_prefix}-{ID::!model$user_id_prefix_counter}
 *   - Create a string property profiling in Safety Goals/Requirements Model with name id_prefix. (initial text is recommended for usability)
 *   - Create a string property profiling in Safety Goals/Requirements Model with name id_prefix_counter. (initial text '0001' is recommended for usability)
 *
 * Note: The native counter for requirements doesn't work anymore.
 *   You need to close the project and reopen it to trigger the autocounter functionality.
 */
var featureChangeListener = {
  getMetaClassFeaturesMap: function () {
    var eClassFeaturesList = [];
    eClassFeaturesList.push(Metamodel.safetygoals.SafetyRequirement);
    eClassFeaturesList.push([]);
    return eClassFeaturesList;
  },

  handleElementCreated: function (createdElement, context) {
    return function () {
      var currentCounter = createdElement.model.user_id_prefix_counter;
      if (!(currentCounter && createdElement.model.user_id_prefix)) {
        alert(
          "Check the requirement model's profile. Either id_prefix or id_prefix_counter is set properply."
        );
        return;
      }
      var nextCounter = String(Number(currentCounter) + 1);
      if (isNaN(nextCounter)) {
        alert("Fix id_prefix_counter. id_prefix_counter only accepts numbers.");
        return;
      }
      var zeroQty = currentCounter.length - nextCounter.length;
      var zeros;
      if (zeroQty >= 0) {
        zeros = "0".repeat(zeroQty);
      } else {
        zeros = "";
      }
      createdElement.model.user_id_prefix_counter = zeros + nextCounter;
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
