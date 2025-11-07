// $EXPERIMENTAL$ $STRICT_MODE$
load(".lib/factory.js");
load(".lib/deepcopy.js");
var checklistTempateName = "[Scripting] Tasklist: DFA  & Cutset";

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
  var checklistItem;
  for (var i = 0; i < numberOfCutSets; i++) {
    checklistItem = deepcopy(checklistitemTemplate, checklist);
    checklistItem.name = (i + 1).toString();
    checklistItem.artifacts.add(cutSets[i]);
  }
}

main();
