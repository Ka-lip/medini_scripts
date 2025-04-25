// $EXPERIMENTAL$ $STRICT_MODE$ $ENHANCED_CONTAINMENT_ACCESS$ $DEBUG$ $ENHANCED_JAVA_ACCESS$
// load(".lib/factory.js");
load(".lib/ui.js");
var FTAUtil = load(".lib/fta.js");

var defaultCutsetsOpts = {
  restrictCutSetLength: false,
  cutSetLength: 1,
  calculateImportanceMeasures: true,
  computeSysUnreliability: true,
  stepWidth: parseBigDecimal("10.0"),
  // new 22.1 option
  probabilityCutOff: null, // or parseBigDecimal("0.8")
};

var defaultCalcProbOpts = {
  // new 22.1 options
  mode: "PROBABILITY", // "PROBABILITY", or "UNAVAILABILITY_AVERAGE", or "UNAVAILABILITY_WORST_CASE"
  missionTime: parseBigDecimal("8000"),
  calculateIntermediateEvents: true,
};

function FtaModel(ftaModel) {
  var originalProbs;
  this.getFtaModel = function () {
    return ftaModel;
  };
  this.getEvents = function () {
    return ftaModel.events.toArray();
  };
  this.getProbs = function () {
    var probs = {};
    var e, id, prob;
    var events = this.getEvents();
    for (var i = 0; i < events.length; i++) {
      e = events[i];
      id = e.id;
      if (e.rawProbability) {
        prob = "" + e.rawProbability;
        probs[id] = prob;
      }
    }
    return probs;
  };
  this.setProbs = function (probs) {
    var e, id, prob;
    var events = this.getEvents();
    for (var i = 0; i < events.length; i++) {
      e = events[i];
      id = e.id;
      if (probs[id]) {
        prob = parseBigDecimal(probs[id]);
        e.rawProbability = prob;
      }
    }
  };
  originalProbs = this.getProbs();
  this.resetProbs = function () {
    this.setProbs(originalProbs);
  };
  this.newCutset = function (cutsetName, calcProbOpts, cutsetsOpts) {
    if (!calcProbOpts) {
      calcProbOpts = defaultCalcProbOpts;
    }
    if (!cutsetsOpts) {
      cutsetsOpts = defaultCutsetsOpts;
    }
    var topNode = ftaModel.rootNodes[0];
    if (!cutsetName) {
      cutsetName = "CutSet of " + "[" + topNode.id + "]" + topNode.name;
    }
    FTAUtil.calculateEventProbability(topNode, calcProbOpts);
    var cutset = FTAUtil.calculateCutSets(topNode, cutsetsOpts);
    FTAUtil.saveAnalysisModel(cutset, cutsetName);
  };
  this.getCutset = function (cutsetName) {
    var cutSets = ftaModel.mediniGetOpposites("analyzedModel").toArray();
    var matchingCutsets = [];
    for (var i = 0; i < cutSets.length; i++) {
      if (cutSets[i].name == cutsetName) {
        matchingCutsets.push(cutSets[i]);
      }
    }
    if (matchingCutsets.length > 1) {
      alert (
        "Warning: Multiple cutsets found with the name '" + cutsetName + "'."
      );
    }
    return matchingCutsets[0];
  };
}

function ChecklistItem(checklistItem) {
  this.getNote = function () {
    return checklistItem.note;
  };
  this.getName = function () {
    return checklistItem.name;
  };
  this.getArtifacts = function () {
    var artifacts = checklistItem.artifacts.toArray();
    if (artifacts.length == 0) {
      return null;
    }
    return artifacts;
  };
  this.setNote = function (note) {
    checklistItem.note = note;
  };
  this.setArtifact = function (artifact) {
    checklistItem.artifacts.add(artifact);
  };
  this.getSubitems = function () {
    var subitems = checklistItem.subItems.toArray();
    if (subitems.length == 0) {
      return null;
    }
    return subitems;
  };
}

function main(ftaModelChecklistItem) {
  if (!ftaModelChecklistItem) {
    ftaModelChecklistItem = selection[0];
  }
  var checklistItem = new ChecklistItem(ftaModelChecklistItem);
  var ftam = new FtaModel(checklistItem.getArtifacts()[0]);
  var subChecklistItems = checklistItem.getSubitems();
  var subChecklistItem, prob, cutsetName;
  for (var i = 0; i < subChecklistItems.length; i++) {
    subChecklistItem = new ChecklistItem(subChecklistItems[i]);
    cutsetName = subChecklistItem.getName() + subChecklistItem.getNote();
    try {
      prob = JSON.parse(subChecklistItem.getNote());
    } catch (_e) {
      alert( "Warning: Note for cutset '" + cutsetName + "' is not valid JSON. Skipping this item.");
      continue;
    }

    ftam.setProbs(prob);
    ftam.newCutset(cutsetName);
    subChecklistItem.setArtifact(ftam.getCutset(cutsetName));
    ftam.resetProbs();
  }
}

main();
// selection[0].eventProbabilityParameters.missionTime = parseBigDecimal("8000");
console.log("script done");
