/*
 * Copyright 2017-2024 ANSYS, Inc.
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
 * v2024-03-27 - JM support deletion of MissionProfile
 * v2020-03-20 - JM support deletion of normal SysML packages
 * v2018-01-15 - JM fail safe when deleting same object multiple times
 * v2017-09-13 - JM initial version
 */
if (!bind) {
	throw "This script requires extended API";
}

// bind operations (NOT OFFICIAL API YET)
var DeleteElementOperation = bind("de.ikv.analyze.core",
		"de.ikv.analyze.core.operations.DeleteElementOperation", false);

var TraceQuickLinkHandler = bind("de.ikv.analyze.ui",
		"de.ikv.analyze.ui.handlers.TraceQuickLinkHandler", false);

var VanillaAction = bind("de.ikv.medini.util.eclipse",
		"de.ikv.medini.util.eclipse.jface.action.VanillaAction", false);

var StructuredSelection = bind("org.eclipse.jface",
		"org.eclipse.jface.viewers.StructuredSelection", false);

var ExecutionEvent = bind("org.eclipse.core.commands",
		"org.eclipse.core.commands.ExecutionEvent", false);

var EvaluationContext = bind("org.eclipse.core.expressions",
		"org.eclipse.core.expressions.EvaluationContext", false);

var MediniProjectModelUtil = bind("de.ikv.medini.metamodel.projectmodel",
		"de.ikv.medini.metamodel.projectmodel.util.MediniProjectModelUtil", false);

var MediniEMFUtil = bind("de.ikv.medini.util.emf.plugin",
		"de.ikv.medini.util.emf.MediniEMFUtil", false);

/**
 * Object Trashbin()
 * 
 * @constructor
 * @since 3.1.0
 * @stability 1 - Experimental
 */
function Trashbin() {}
Trashbin.prototype = new Object();

/**
 * Returns <code>true</code> if the given element is for sure a top level
 * element in the sense, that it is hooked into the overall project model using
 * a PJProxy. In all other cases it returns false.
 * 
 * @param {Object}
 *            element
 * @returns <code>true</code> if this is a top level element
 */
Trashbin.isTopLevelElement = function(element) {
	if (element.prototype == Metamodel.safetygoals.SafetyRequirementsModel) {
		return true;
	}
	if (element.prototype == Metamodel.hazard.PlainItem) {
		return true;
	}
	if (element.prototype == Metamodel.hazard.HazardAnalysisModel) {
		return true;
	}
	if (element.prototype == Metamodel.FTA.FTAModel) {
		return true;
	}
	if (element.prototype == Metamodel.FMEA.FMEAWorksheet) {
		return true;
	}
	if (element.prototype == Metamodel.dc.DCWorksheet) {
		return true;
	}
	if (element.prototype == Metamodel.safetyModel.MeasureCatalog) {
		return true;
	}
	if (element.prototype == Metamodel.safetyModel.FailureCollection) {
		return true;
	}
	if (element.prototype == Metamodel.checklist.Checklist) {
		return true;
	}
	if (element.prototype == Metamodel.failureratecatalogs.MissionProfile) {
		return true;
	}
	// allow the deletion of plain packages, but not top level (== models)
	if (element.prototype == Metamodel.sysml.SysMLContainerPackage && (element.mediniGetContainer() == undefined)) {
		throw "elements of this type cannot be deleted - not supported";
	}
	if (element.prototype == Metamodel.Simulink.Configuration) {
		throw "elements of this type cannot be deleted - not supported";
	}
	
	return false;
};

Trashbin.deleteElement = function(element) {
	if (!element) {
		throw "missing element for deletion";
	}

	// at this stage we shall check whether the object is inside an editing domain
	if (MediniEMFUtil.getEditingDomain(element) == undefined) {
		// silently return
		return;
	}
	
	// add some paranoia here
	if (element.prototype == Metamodel.FTA.Event) {
		throw "pure Event objects cannot be deleted, only EventNode objects";
	}
	
	// all top level objects need special attention
	if (Trashbin.isTopLevelElement(element)) {
		element = MediniProjectModelUtil.findPJProxyModel(element);
		if (element == null) {
			throw "this object seems to be outside the containment hirarchy already";
		}
	}
	
	var op = new DeleteElementOperation(element, "");
	op.clientExecute(null);
};

Trashbin.deleteRelation = function(source, target, type) {
    if (!source) {
        throw "missing mandatory source argument";
    }
    if (!target) {
        throw "missing mandatory target argument";
    }
    if (!type) {
        throw "missing mandatory type argument";
    }

    // Trace (HACK!)
    if (type == "TRACE" || type == Metamodel.traceability.Trace) {
    	var action = new VanillaAction("Delete Trace");
    	var selection = new StructuredSelection([source, target]);
    	var context = new EvaluationContext(null, selection);
    	context.addVariable("selection", selection);
    	var params = new java.util.HashMap();
    	params["traceLink.inverse"] = "true";
    	var event = new ExecutionEvent(null, params, null, context);
    	
    	var handler = new TraceQuickLinkHandler();
    	handler.selectionChanged(action, selection);
    	handler.execute(event);
    	return;
    }
 
    // not supported
    throw "relation type is not supported";
};