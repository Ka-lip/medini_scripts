// $EXPERIMENTAL$ $STRICT_MODE$
load(".lib/factory.js");
load(".lib/deepcopy.js");
//load(".lib/DfaChecklistitem.js");
var checklistTempateName = "[Scripting] Tasklist: DFA template";

/*
 * Create a checklist
 * Create checklist items in the checklist
 * Fill in the cutset objects in the checklist
 */

function newChecklist(checklistName, place) {
  var cl = Factory.createElement(place, Metamodel.checklist.Checklist);
  cl.name = checklistName;
  return cl;
}

function getChecklistItem(checklistName) {
  var cl = finder
    .findByType(Metamodel.checklist.Checklist)
    .and("name", checklistName)
    .first();
  if (cl.items) {
    return cl.items;
  }
  return null;
}

function updateChecklistItems() {}

function getEventsName(cutset) {
  var singleName;
  var combinedName = "";
  var events = cutset.events.toArray();
  var iEvent;
  for (var i = 0; i < events.length; i++) {
    iEvent = events[i];
    singleName = "[" + iEvent.id + "] " + iEvent.name;
    combinedName = combinedName + " " + singleName;
  }
  return combinedName;
}
function main(cutsetAnalysisModel) {
  if (!cutsetAnalysisModel) {
    cutsetAnalysisModel = selection[0];
  }
  var checklistName =
    "[DFA checklist] " +
    cutsetAnalysisModel.analyzedModel.name +
    " - " +
    cutsetAnalysisModel.name;
  var checklistLocation = cutsetAnalysisModel.analyzedModel
    .mediniGetOpposites("originalModel")[0]
    .mediniGetContainer();
  var cutSets = cutsetAnalysisModel.cutSets.toArray();
  var numberOfCutSets = cutSets.length;
  var checklist = newChecklist(checklistName, checklistLocation);
  var checklistitemTemplate = getChecklistItem(checklistTempateName)[0];
  for (var i = 0; i < numberOfCutSets; i++) {
    var checklistItem = deepcopy(checklistitemTemplate, checklist);
    checklistItem.artifacts.add(cutSets[i]);
    checklistItem.name =
      "[" + (i + 1).toString() + "] " + getEventsName(cutSets[i]);
  }
}

main();
