// $EXPERIMENTAL$ $STRICT_MODE$ $ENHANCED_CONTAINMENT_ACCESS$ $ENHANCED_JAVA_ACCESS$ $DEBUG$
load(".lib/factory.js");
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
    if (!probs) {
      return;
    }
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
      alert(
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
    if (!checklistItem.artifacts) {
      return [];
    }
    var artifacts = checklistItem.artifacts.toArray();
    return artifacts;
  };
  this.getParent = function () {
    if (
      !checklistItem ||
      !checklistItem.mediniGetOpposites("subItems").size()
    ) {
      return null;
    }
    var parent = new this.constructor(
      checklistItem.mediniGetOpposites("subItems").get(0)
    );
    return parent;
  };
  this.setNote = function (note) {
    checklistItem.note = note;
  };
  this.setArtifact = function (artifact) {
    checklistItem.artifacts.add(artifact);
  };
  this.getSubitems = function () {
    if (!checklistItem.subItems || !checklistItem.subItems.size()) {
      return [];
    }
    var subitems = checklistItem.subItems.toArray();
    return subitems;
  };
  this.newSubitem = function (name, note) {
    var subitem = Factory.createElement(
      checklistItem,
      Metamodel.checklist.StaticChecklistItem
    );
    subitem.name = name;
    subitem.note = note;
  };
  this.getType = function () {
    // "FtaModelItem", "TestcaseItem", "EventnodeItem", "Unknown"
    var isFtaModelItem =
      this.getArtifacts().length == 1 &&
      this.getArtifacts()[0] instanceof Metamodel.FTA.FTAModel;
    var isTestcaseItem =
      this.getParent() && this.getParent().getType() == "FtaModelItem";
    var isEventnodeItem =
      this.getParent() && this.getParent().getType() == "TestcaseItem";
    var getNote = this.getNote; // help isValidNote get this.getNote
    var isValidNote = function () {
      if (!isNaN(parseFloat(getNote()) && isFinite(getNote()))) return true;
      try {
        JSON.parse(getNote());
        return true;
      } catch (_e) {
        return false;
      }
    };
    if (isFtaModelItem) {
      return "FtaModelItem";
    } else if (isTestcaseItem && isValidNote()) {
      return "TestcaseItem";
    } else if (isEventnodeItem && isValidNote()) {
      return "EventnodeItem";
    } else {
      return "Unknown/invalid";
    }
  };
  this.getProbsFromEventnodeItem = function () {
    var probs = {};
    var artifact, id, prob;
    for (var i = 0; i < this.getArtifacts().length; i++) {
      artifact = this.getArtifacts()[i];
      if (artifact instanceof Metamodel.FTA.Event) {
        id = artifact.id;
        prob = parseBigDecimal(this.getNote());
        probs[id] = prob;
      }
    }
    return probs;
  };
}

function handler(checklistItem, ftaModel) {
  if (!checklistItem) {
    checklistItem = selection[0];
  }
  var cli = new ChecklistItem(checklistItem);
  var name = cli.getName();
  var artifacts = cli.getArtifacts();
  var note = cli.getNote();
  var subItems = cli.getSubitems();
  var subItem;
  if (cli.getType() == "FtaModelItem") {
    // it is a fta model cl. go deeper
    if (!ftaModel) {
      ftaModel = new FtaModel(artifacts[0]);
    }
    for (var i = 0; i < subItems.length; i++) {
      handler(subItems[i], ftaModel);
    }
  } else if (cli.getType() == "TestcaseItem") {
    // it is a testcase cl. set the prob from json, go deeper, and calculate
    for (var i = 0; i < subItems.length; i++) {
      // the testcase has eventnodes
      subItem = subItems[i];
      handler(subItem, ftaModel);
    }
    ftaModel.setProbs(JSON.parse(note));
    ftaModel.newCutset(name);
    ftaModel.resetProbs();
    cli.setArtifact(ftaModel.getCutset(name));
  } else if (cli.getType() == "EventnodeItem") {
    // it is an eventnode cl. set the probs
    ftaModel.setProbs(cli.getProbsFromEventnodeItem());
  }
}

function main(scope) {
  if (!scope) {
    scope = selection[0];
  }
  if (scope instanceof Metamodel.checklist.Checklist) {
    var items = scope.items.toArray();
    for (var i = 0; i < items.length; i++) {
      handler(items[i]);
    }
  } else if (scope instanceof Metamodel.checklist.StaticChecklistItem) {
    handler(scope);
  }
}

main();
console.log("script done");
