// $EXPERIMENTAL$ $STRICT_MODE$ $ENHANCED_CONTAINMENT_ACCESS$ $ENHANCED_JAVA_ACCESS$
/*
 * Objective: this script has 2 functionalities.
 * 1. It updates all FTA BASE events in selection[0] whose user_latent_failure are checked with following configuration.
 *   1 - 1. Set the probability model to "Custom (Experimental)"
 *   1 - 2. Set the language of the formula to JavaScript.
 *   1 - 3. Set the probability and frequency to the const below (PROB_FORMULA and FREQ_FORMULA)
 * 2. It lists FTA BASE events whose user_latent_failure are checked but user_latent_failure_time in Problems View.
 *
 * Best practice:
 * 1. Tick profiles user_latent_failure (Latent failure?) checkbox for FTA base events that you want to fill the customized formulas.
 * 2. Enter value into profile user_latent_failure_time (Latent failure (Mission Time)) of the events.
 * 3. Execute the script at the level of the FTA model (root of the FTA).
 *
 * Changelog:
 * 2025/09/29: add the function to alert the user if the selection is not a FTA model.
 * 2025/09/19: Add Problem view alert by ka-lip
 * 2025/09/18: Released by ka-lip.chu@ansys.com
 */
load(".lib/factory.js");
load(".lib/trashbin.js");
load(".lib/ui.js");
var FTAUtil = load(".lib/fta.js");

const PROB_FORMULA =
  "if (event.user_latent_failure) p = lambda * parseInt(event.user_latent_failure_time);";
const FREQ_FORMULA = "f = lambda * 1E-9;";

const CALC_PROB_OPTIONS = {
  mode: "PROBABILITY", // "PROBABILITY", or "UNAVAILABILITY_AVERAGE", or "UNAVAILABILITY_WORST_CASE"
  missionTime: parseBigDecimal("8000"),
  calculateIntermediateEvents: true,
};
function updateProb(e, prob_f, freq_f) {
  if (e.effectiveKind != "BASE") return;
  if (e.probabilityData) {
    Trashbin.deleteElement(e.probabilityData);
  }
  var probData = Factory.createElement(
    e,
    Metamodel.FTA.ScriptedProbabilityModel
  );
  probData.scriptKind = "JS";
  probData.probFormula = PROB_FORMULA;
  probData.freqFormula = FREQ_FORMULA;
  return;
}

function getFtaEvents(scope) {
  if (scope == undefined) {
    scope = selection[0];
  }
  var events = Global.getFinder(scope)
    .findByType(Metamodel.FTA.Event)
    .filter(function (e) {
      return e.effectiveKind == "BASE"; // note that arrow functions don't work well with finder objects.
    });
  return events.toArray();
}

function updateProbs(scope) {
  if (scope == undefined) {
    scope = selection[0];
  }
  var events = getFtaEvents(scope);
  for (var i = 0; i < events.length; i++) {
    var ith_event = events[i];
    if (ith_event.user_latent_failure) {
      updateProb(ith_event, PROB_FORMULA, FREQ_FORMULA);
    }
  }
  return;
}

function getInvalidEvents(scope) {
  if (scope == undefined) {
    scope = selection[0];
  }
  var events = getFtaEvents(scope);
  var invalidEvents = events.filter(
    (e) => e.user_latent_failure && !Boolean(Number(e.user_latent_failure_time))
  );
  return invalidEvents;
}

function createIssue(obj, msg) {
  if (obj == undefined) {
    obj = selection[0];
  }
  if (msg == undefined) {
    msg = "{0} encountered an issue.";
  }

  var ProjectIssues = Issues.forProject(finder.project);
  ProjectIssues.addIssue(4, obj, msg, "No resolution");
  return;
}

function createIssues(objs, msg, clearOldIssues, openProblemsView) {
  if (clearOldIssues == undefined) {
    clearOldIssues = true;
  }
  if (openProblemsView == undefined) {
    openProblemsView = true;
  }
  if (clearOldIssues) {
    var ProjectIssues = Issues.forProject(finder.project);
    var issues = ProjectIssues.getIssues();
    ProjectIssues.removeIssues(issues);
  }

  if (!objs.length) return;

  for (var i = 0; i < objs.length; i++) {
    createIssue(objs[i], msg);
  }
  if (openProblemsView) {
    ProjectIssues.openProblemsView();
  }
  return;
}

function calcProb(e) {
  if (e == undefined) {
    e = selection[0];
  }
  FTAUtil.calculateEventProbability(e, CALC_PROB_OPTIONS);
}
function calcRootEventsProb(m) {
  if (m == undefined) {
    m = selection[0];
  }
  var roots = m.rootNodes.toArray();
  for (var i = 0; i < roots.length; i++) {
    calcProb(roots[i]);
  }
}

function main() {
  var doCalculation = selectOption(
    "Confirmation",
    "Do you want to update the formula only or calculate the possibility at the same time?",
    ["Update the formula ONLY", "ALSO calculate the possibility"]
  );

  updateProbs();
  createIssues(getInvalidEvents(), "Mission Time is not set at {0}.");
  if (doCalculation) calcRootEventsProb();
}

if (selection[0] instanceof Metamodel.FTA.FTAModel) {
  main();
} else {
  alert("Please select a FTA model.");
}
