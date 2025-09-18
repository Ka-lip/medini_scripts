// $EXPERIMENTAL$ $STRICT_MODE$ $ENHANCED_CONTAINMENT_ACCESS$ $ENHANCED_JAVA_ACCESS$
/* 
 * Objective: this script updates all FTA BASE events in selection[0] whose user_latent_failure is checked with following configuration.
 * 1. Set the probability model to "Custom (Experimental)"
 * 2. Set the language of the formula to JavaScript.
 * 3. Set the probability and frequency to the const below (PROB_FORMULA and FREQ_FORMULA)
 *
 * Best practice:
 * 1. Tick profiles user_latent_failure checkbox for FTA base events that you want to fill the customized formulas.
 * 2. Enter proper value for user_latent_failure_time of the events.
 * 3. Execute the script at the level of the FTA model (root of the FTA).
 *
 * Changelog:
 * 2025/09/18: Released by ka-lip.chu@ansys.com
 */
load(".lib/factory.js");
load(".lib/trashbin.js");

const PROB_FORMULA =
  "if (event.user_latent_failure) p = lambda * parseInt(event.user_latent_failure_time);";
const FREQ_FORMULA = "f = lambda * 1E-9;";

function updateProb(e, prob_f, freq_f) {
  if (e.effectiveKind != "BASE") {
    return;
  }
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
  var events = Global.getFinder(scope).findByType(Metamodel.FTA.Event);
  return events.toArray();
}

function main(scope) {
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

main();
