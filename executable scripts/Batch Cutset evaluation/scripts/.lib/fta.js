/* 
 * Copyright 2020-2023 ANSYS, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated 
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation the 
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to 
 * permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of 
 * the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE 
 * WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS 
 * OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR 
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * 
 * v2024-03-15 - NH corrected the is232OrLater calculation
 * v2023-07-06 - JM improved 23.2 support as the API was changed before the release
 * v2022-10-08 - JM added support for 23.2 already to calculate CFT
 * v2022-09-07 - JM separate scope parameter to save cut-set also under RBD
 * v2022-01-20 - NH support 22.1 calculate probability (now with options)
 * v2021-08-04 - JM support 22.1 options and code
 * v2021-02-17 - JM support calculations options
 * v2021-02-16 - JM initial support to script FTA calculations
 * v2020-08-26 - JM initial version
 */
if (!bind) {
	throw "This script requires extended API";
}

// bind classes (NOT OFFICIAL API YET)
var CalculateEventProbabilityAction = bind(
		"de.ikv.analyze.editor.fta",
		"de.ikv.analyze.editor.fta.actions.CalculateEventProbabilityAction",
		false);

var StoreCutSetAnalysisHandler = bind(
		"de.ikv.analyze.editor.fta",
		"de.ikv.analyze.editor.fta.actions.StoreCutSetAnalysisHandler",
		false);

var AnalyzeCalculateCutSetAction = bind(
		"de.ikv.analyze.editor.fta",
		"de.ikv.analyze.editor.fta.actions.AnalyzeCalculateCutSetAction",
		false);

var BuildAnalysisModelOperation = bind(
		"de.ikv.medini.editor.fta.cockpit",
		"de.ikv.medini.editor.fta.operations.BuildAnalysisModelOperation",
		false);

var EcoreUtil = bind(
		"org.eclipse.emf.ecore",
		"org.eclipse.emf.ecore.util.EcoreUtil", 
		false);

({
	/**
	 * @param model the cut-set model, never <code>null</code>
	 * @param name the name for the saved model, never <code>null</code>
	 */
	saveAnalysisModel : function (model, name, scope) {
		if (!scope) {
			// extract the scope from the model (the FTA model's proxy holder)
			scope = model.analyzedModel;
			if (!scope) {
				throw "This analysis model does not refer to a fault tree model";
			}
		}
		var proxy = scope.mediniGetOpposites("originalModel").get(0);
		if (!proxy || !(proxy instanceof Metamodel.projectmodel.PJProxyModel)) {
			throw "This analysed model is not hooked properly into the project";
		}

		var action = new StoreCutSetAnalysisHandler(proxy);
		setHandlerSelection(action, model);
		action.name = name;
		action.setOpenEditor(false);
		action.doExecuteAndShowErrorResult();
	},

	/**
	 * @param eventNode top level event node to start calculation, never <code>null</code>
	 */
	calculateCutSets : function (eventNode, customOptions) {
		var action = new AnalyzeCalculateCutSetAction();
		if (!("invoke0" in action)) {
			throw "This script requires a special hook in medini to operate - but the hook is missing";
		}
		setHandlerSelection(action, eventNode);

		// do NOT use the parameter from FTA directly, create a copy
		var parameters = EcoreUtil.copy(eventNode.event.model.eventProbabilityParameters);
		
		// setup the defaults
		var is221OrLater = this.is212OrLater && __tool_version_object.major >= 22;
		
		// build an internal options object (changed from 21.2 to 22.1)
		var optionBuilder = undefined;
		if (is221OrLater || this.is212OrLater) {
			var AnalysisOptions = bind(
					"de.ikv.medini.editor.fta.cockpit",
					"de.ikv.medini.editor.fta.operations.AnalysisOptions",
					false);
			optionBuilder = AnalysisOptions.newBuilder();
		} else {
			optionBuilder = BuildAnalysisModelOperation.Options.newBuilder();
		}
		optionBuilder.restrictCutSetLength(customOptions && "restrictCutSetLength" in customOptions ? customOptions["restrictCutSetLength"] : true)
			.cutSetLength(customOptions && "cutSetLength" in customOptions ? customOptions["cutSetLength"] : 3)
			.calculateImportanceMeasures(customOptions && "calculateImportanceMeasures" in customOptions ? customOptions["calculateImportanceMeasures"] : true)
			.computeSysUnreliability(customOptions && "computeSysUnreliability" in customOptions ? customOptions["computeSysUnreliability"] : true)
			.stepWidth(customOptions && "stepWidth" in customOptions ? customOptions["stepWidth"] : java.math.BigDecimal.TEN)
			.eventProbabilityParameters(parameters);
		if (is221OrLater) {
			optionBuilder.probabilityCutOff(customOptions && "probabilityCutOff" in customOptions ? customOptions["probabilityCutOff"] : undefined);
		}
		
		// build them
		var options = optionBuilder.build();
		
		console.log("Calculating cut sets for {0} with options {1}", eventNode.id, uneval(customOptions));
		var result = new java.util.concurrent.atomic.AtomicReference();

		var status = action.invoke0(progressMonitor, eventNode, options, result);
		console.log("Status: {0}", status);
		return result.get();
	},

	/**
	 * Note: __tool_version_object was introduced with 21.2
	 */
	is212OrLater : "__tool_version_object" in this,
	
	/**
	 * @param eventNode top level event node to start calculation, never <code>null</code>
	 */
	calculateEventProbability : function (eventNode, customOptions) {
		console.log("Calculating probabilities for {0}", eventNode.id);
		var is221OrLater = this.is212OrLater && __tool_version_object.major >= 22;
		var is232OrLater = (__tool_version_object.major >= 23 && __tool_version_object.minor >= 2) || (__tool_version_object.major >= 24);
		
		// we use the action but we cannot call the handler in UI thread normally --> deadlock
		var action = new CalculateEventProbabilityAction();
		if (is232OrLater) {
			if (!("calculate" in action)) {
				throw "This script requires a special hook in medini to operate - but the hook is missing";
			}
		} else if (!("run0" in action)) {
			throw "This script requires a special hook in medini to operate - but the hook is missing";
		}
		
		/*
		 * The 20.2 prototype signature was (pm, node, boolean) but in 21.2 it was changed to (node, pm, boolean).
		 * With 23.2 it again changed due to CFT introduction.
		 */
	    if (is221OrLater) {
			// New for 22.1
			var ProbabilityOptions = bind(
				"de.ikv.analyze.editor.fta",
				"de.ikv.analyze.editor.fta.editors.ProbabilityOptions",
				false);
			var ProbabilityMode = bind(
				"de.ikv.medini.editor.fta.diagram",
				"de.ikv.medini.editor.fta.custom.util.ProbabilityMode",
				false);			
			
			var mode;
			if (customOptions && "mode" in customOptions) {
				switch (customOptions["mode"]) {
					case "PROBABILITY": 				mode = ProbabilityMode.PROBABILITY; break;
					case "UNAVAILABILITY_AVERAGE": 		mode = ProbabilityMode.UNAVAILABILITY_AVERAGE; break;
					case "UNAVAILABILITY_WORST_CASE":	mode = ProbabilityMode.UNAVAILABILITY_WORST_CASE; break;
					default:							mode = ProbabilityMode.PROBABILITY; break;
				}
			} else {
				mode = ProbabilityMode.PROBABILITY;
			}
			var missionTime = (customOptions && "missionTime" in customOptions) ? customOptions["missionTime"] : parseBigDecimal("1");
			var calculateIntermediateEvents = (customOptions && "calculateIntermediateEvents" in customOptions) ? customOptions["calculateIntermediateEvents"] : true;

			var options = new ProbabilityOptions(mode, missionTime, calculateIntermediateEvents);
		    if (is232OrLater) {
				action.calculate(eventNode, options, progressMonitor);
			} else {
				action.run0(eventNode, progressMonitor, options);
			}
		} else if (this.is212OrLater) {
			action.run0(eventNode, progressMonitor, true);
		} else {
			action.run0(progressMonitor, eventNode, true);
		}
	},

});
