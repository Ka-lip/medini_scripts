// $EXPERIMENTAL$ $STRICT_MODE$ $WARNING_AS_ERROR$ $ENHANCED_JAVA_ACCESS$
/* 
 * Copyright 2020-2021 ANSYS, Inc.
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
 * v2022-01-20 - NH support 22.1 calculate probability (now with options)
 * v2021-08-04 - JM support 22.1 options and code
 * v2021-05-18 - JM cosmetics
 * v2021-02-17 - JM test calculation options
 * v2021-02-16 - JM test FTA calculations
 * v2020-08-26 - JM initial version
 */
load(".lib/ui.js");
var FTAUtil = load(".lib/fta.js");

// var nodes = finder.findByType(Metamodel.rbd.RBDModel);
var nodes = finder.findByType(Metamodel.FTA.EventNode).and("effectiveKind", Metamodel.FTA.EventType.TOP_LEVEL);
if (nodes.isEmpty()) {
	throw "Cannot find any top level event in the project";
}

console.log("This will calculate the probability for {0} top level nodes.", nodes.size());

var cutsetsOptions = {
	"restrictCutSetLength" : true,
	"cutSetLength" : 2,
	"calculateImportanceMeasures" : true,
	"computeSysUnreliability" : true,
	"stepWidth" : parseBigDecimal("10.0"),
	// new 22.1 option
	"probabilityCutOff" : null, // or parseBigDecimal("0.8")
};

var calcProbOptions = {
	// new 22.1 options
	"mode" : "PROBABILITY", // "PROBABILITY", or "UNAVAILABILITY_AVERAGE", or "UNAVAILABILITY_WORST_CASE"
	"missionTime" : parseBigDecimal("8000"),
	"calculateIntermediateEvents" : true,
};

// XXX does only work for 2021 R2
nodes.forEach(function (node) {
	// calculate probabilities
	FTAUtil.calculateEventProbability(node, calcProbOptions);
	// calculate cut-sets
	var model = FTAUtil.calculateCutSets(node, cutsetsOptions);
	if (!model) {
		console.error("Failed! See error log and console!");
	} else {
		// save cut-set model
		FTAUtil.saveAnalysisModel(model, "CutSet of " + node.name);
	}
});
