/* 
 * Copyright 2015-2023 ANSYS, Inc.
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
 * v2023-10-26 - JM Added findProjectModel
 * v2023-01-09 - GG support for checklist and measure groups
 * v2021-07-23 - JM fixed findConnector (connectors are contained by parent of port)
 * v2021-06-10 - MP added find support for port and connector
 * v2020-10-21 - added findOrCreateHazard
 * v2020-03-06 - initial support for traces
 * v2020-01-03 - initial support for variables
 * v2019-08-29 - initial support for Weaknesses and Triggers
 * v2019-06-26 - improved support for goals and functions
 * v2019-06-18 - added support for hazardous events 
 * v2019-04-11 - added support for general activities and actions 
 * v2017-03-01 - added support for project and system packages 
 * v2017-02-10 - added support for requirements
 * v2016-11-14 - added support for hazard
 * v2015-06-10 - added support for goal
 * v2015-06-08 - initial version
 */
if (!bind) {
	throw "This script requires extended API";
}

// extended finder methods
var AutoCounterSupport = bind("de.ikv.medini.metamodel.autocounter", "de.ikv.medini.metamodel.autocounter.AutoCounterSupport", false);
var TraceController = bind("de.ikv.medini.kernel.traceability", "de.ikv.medini.kernel.traceability.TraceController", false);
var MediniProjectModelUtil = bind("de.ikv.medini.metamodel.projectmodel", "de.ikv.medini.metamodel.projectmodel.util.MediniProjectModelUtil", false);

// helper
function findLimitation(scope, name) {
	if (!scope) {
		console.error("scope is undefined!");
		return undefined;
	}
	var found = Global.getFinder(scope).findByType(Metamodel.safetyModel.Limitation, false).find("name", name);
	if (!found.isEmpty()) {
		return found.first();
	}
	
	return undefined;
}

// helper
function findOrCreateLimitation(scope, name) {
	var found = findLimitation(scope, name);
	if (found) {
		return found;
	}

	// create one
	var created = Factory.createElement(scope, Metamodel.safetyModel.Limitation);
	created.name = name;
	return created;
}

// helper
function findTriggeringCondition(scope, name) {
	if (!scope) {
		console.error("scope is undefined!");
		return undefined;
	}
	var found = Global.getFinder(scope).findByType(Metamodel.safetyModel.TriggeringCondition, false).find("name", name);
	if (!found.isEmpty()) {
		return found.first();
	}
	
	return undefined;
}

// helper
function findOrCreateTriggeringCondition(scope, name) {
	var found = findTriggeringCondition(scope, name);
	if (found) {
		return found;
	}

	// create one
	var created = Factory.createElement(scope, Metamodel.safetyModel.TriggeringCondition);
	created.name = name;
	return created;
}

// helper
function findHazardousEvent(scope, id) {
	if (!scope) {
		console.error("scope is undefined!");
		return undefined;
	}
	var found = Global.getFinder(scope).findByType(Metamodel.hazard.HazardousEvent, false).find("id", id);
	if (!found.isEmpty()) {
		return found.first();
	}
	
	return undefined;
}

// helper
function findOrCreateHazardousEvent(scope, id) {
	var found = findHazardousEvent(scope, id);
	if (found) {
		return found;
	}

	// create one
	var created = Factory.createElement(scope, Metamodel.hazard.HazardousEvent);
	created.id = id;
	return created;
}

// helper
function findAction(scope, name) {
	if (!scope) {
		console.error("Scope is undefined in findAction!");
		return undefined;
	}
	
	var found = Global.getFinder(scope).findByType(Metamodel.sysml.SysMLAction, true)
		.find("name", name);
	if (!found.isEmpty()) {
		// first() since 3.0.2
		return found.first();
	}
	
	return undefined;
}

// helper
function findOrCreateAction(scope, name) {
	var found = findAction(scope, name);
	if (found) {
		return found;
	}
	
	// create one
	var created = Factory.createElement(scope, Metamodel.sysml.SysMLAction);
	created.name = name;
	return created;
}

// helper
function findActivity(scope, name) {
	if (!scope) {
		console.error("Scope is undefined in findActivity!");
		return undefined;
	}
	
	var found = Global.getFinder(scope).findByType(Metamodel.sysml.SysMLActivity, true)
		.find("name", name);
	if (!found.isEmpty()) {
		// first() since 3.0.2
		return found.first();
	}
	
	return undefined;
}

// helper
function findOrCreateActivity(scope, name) {
	var found = findActivity(scope, name);
	if (found) {
		return found;
	}
	
	// create one
	var created = Factory.createElement(scope, Metamodel.sysml.SysMLActivity);
	created.name = name;
	return created;
}

// helper
function findFunction(scope, name, id) {
	if (!scope) {
		console.error("Scope is undefined in findFunction!");
		return undefined;
	}
	// id before name (!)
	if (id) {
		var found = Global.getFinder(scope).findByType(Metamodel.sysml.SysMLActivity, true)
			.and("typeCode", "function")
			.find("id", id);
		if (!found.isEmpty()) {
			// first() since 3.0.2
			return found.first();
		}
	}
	if (name) {
		found = Global.getFinder(scope).findByType(Metamodel.sysml.SysMLActivity, true)
			.and("typeCode", "function")
			.find("name", name);
		if (!found.isEmpty()) {
			// first() since 3.0.2
			return found.first();
		}
	}
	return undefined;
}

// helper
function findOrCreateFunction(scope, name, id) {
	var found = findFunction(scope, name, id);
	if (found) {
		return found;
	}
	
	// create one
	var created = Factory.createElement(scope, Metamodel.sysml.SysMLActivity);
	created.typeCode = "function";
	created.id = id ? id : AutoCounterSupport.createUniqueIDString(created, "id", "F-001");
	created.name = name;
	return created;
}

// helper
function findMalfunction(scope, name) {
	if (!scope) {
		console.error("Scope is undefined in findMalfunction!");
		return undefined;
	}
	var found = Global.getFinder(scope).findByType(Metamodel.safetyModel.Malfunction, true).find("name", name);
	if (!found.isEmpty()) {
		return found.first();
	}

	return undefined;
}

// helper
function findOrCreateMalfunction(scope, name) {
	var found = findMalfunction(scope, name);
	if (found) {
		return found;
	}
	
	// create one
	var created = Factory.createElement(scope, Metamodel.safetyModel.Malfunction);
	created.name = name;
	return created;
}

// helper
function findHazard(scope, name) {
	if (!scope) {
		console.error("Scope is undefined in find method!");
	}
	var found = Global.getFinder(scope).findByType(Metamodel.safetyModel.Hazard, true).find("name", name);
	if (!found.isEmpty()) {
		return found.first();
	}

	return undefined;
}

// helper
function findOrCreateHazard(scope, name) {
	if (!scope) {
		console.error("Scope is undefined in findOrCreate!");
		return undefined;
	}
	var found = Global.getFinder(scope).findByType(Metamodel.safetyModel.Hazard, true).find("name", name);
	if (!found.isEmpty()) {
		// first() since 3.0.2
		return found.first();
	}
	
	// create one
	var created = Factory.createElement(scope, Metamodel.safetyModel.Hazard);
	created.name = name;
	return created;
}

// helper
function findOrCreateFailureMode(scope, name) {
	if (!scope) {
		console.error("Scope is undefined in findOrCreate!");
		return undefined;
	}
	var found = Global.getFinder(scope).findByType(Metamodel.safetyModel.FailureMode, true).find("name", name);
	if (!found.isEmpty()) {
		// first() since 3.0.2
		return found.first();
	}
	
	// create one
	var created = Factory.createElement(scope, Metamodel.safetyModel.FailureMode);
	created.name = name;
	return created;
}

// helper
function findOrCreateMeasure(scope, name) {
	if (!scope) {
		console.error("Scope is undefined in findOrCreate!");
	}
	var found = Global.getFinder(scope).findByType(Metamodel.safetyModel.Measure, true).find("name", name);
	if (!found.isEmpty()) {
		// first() since 3.0.2
		return found.first();
	}
	
	// create one
	var created = Factory.createElement(scope, Metamodel.safetyModel.Measure);
	created.name = name;
	return created;
}

// helper added by GG 2022-08-17
function findOrCreateMeasureGroup(scope, name) {
	if (!scope) {
		console.error("Scope is undefined in findOrCreate!");
	}
	var found = Global.getFinder(scope).findByType(Metamodel.safetyModel.MeasureGroup, true).find("name", name);
	if (!found.isEmpty()) {
		// first() since 3.0.2
		return found.first();
	}
	
	// create one
	var created = Factory.createElement(scope, Metamodel.safetyModel.MeasureGroup);
	created.name = name;
	return created;
}

// helper
function findContainerPackage(scope, name) {
	if (!scope) {
		console.error("Scope is undefined in find method!");
		return undefined;
	}
	var found = Global.getFinder(scope).findByType(Metamodel.sysml.SysMLContainerPackage, true).find("name", name);
	if (!found.isEmpty()) {
		return found.first();
	}
	
	return undefined;
}

// helper
function findOrCreateContainerPackage(scope, name) {
	var found = findContainerPackage(scope, name);
	if (found) {
		return found;
	}
	
	// create one
	var created = Factory.createElement(scope, Metamodel.sysml.SysMLContainerPackage);
	created.name = name;
	return created;
}

// helper
function findPart(scope, name) {
	if (!scope) {
		console.error("Scope is undefined in find method!");
		return undefined;
	}
	var found = Global.getFinder(scope).findByType(Metamodel.sysml.SysMLPart, true).find("name", name);
	if (!found.isEmpty()) {
		// first() since 3.0.2
		return found.asArray()[0];
	}
	
	return undefined;
}

// helper
function findOrCreatePart(scope, name) {
	var found = findPart(scope, name);
	if (found) {
		return found;
	}
	
	// create one
	var created = Factory.createElement(scope, Metamodel.sysml.SysMLPart);
	created.name = name;
	return created;
}

// helper
function findGoal(scope, name, id) {
	if (!scope) {
		console.error("Scope is undefined in find method!");
	}
	// id before name (!)
	if (id) {
		var found = Global.getFinder(scope).findByType(Metamodel.safetygoals.SafetyGoal, true).find("identifier", id);
		if (!found.isEmpty()) {
			// first() since 3.0.2
			return found.first();
		}
	}
	if (name) {
		found = Global.getFinder(scope).findByType(Metamodel.safetygoals.SafetyGoal, true).find("name", name);
		if (!found.isEmpty()) {
			// first() since 3.0.2
			return found.first();
		}
	}
	
	return undefined;
}

// helper
function findOrCreateGoal(scope, name, id) {
	var found = findGoal(scope, name, id);
	if (found) {
		return found;
	}
	
	// create one
	var created = Factory.createElement(scope, Metamodel.safetygoals.SafetyGoal);
	created.name = name;
	created.identifier = id;
	return created;
}

// helper
function findRequirement(scope, nameOrId) {
	if (!scope) {
		console.error("Scope is undefined in find method!");
	}
	var found = Global.getFinder(scope).findByType(Metamodel.safetygoals.SafetyRequirement, true).find("name", nameOrId);
	if (!found.isEmpty()) {
		// first() since 3.0.2
		return found.first();
	}
	// try again with ID
	found = Global.getFinder(scope).findByType(Metamodel.safetygoals.SafetyRequirement, true).find("identifier", nameOrId);
	if (!found.isEmpty()) {
		// first() since 3.0.2
		return found.first();
	}
	
	return undefined;
}

// helper
function findPackage(scope, name) {
	if (!scope) {
		console.error("Scope is undefined in find method!");
		return undefined;
	}
	var found = Global.getFinder(scope).findByType(Metamodel.projectmodel.PJPackage, true).find("name", name);
	if (!found.isEmpty()) {
		return found.first();
	}
	return undefined;
}

// helper
function findOrCreatePackage(scope, name) {
	var found = findPackage(scope, name);
	if (found) {
		return found;
	}
	
	// create one
	var created = Factory.createElement(scope, Metamodel.projectmodel.PJPackage);
	created.name = name;
	return created;
}

// helper
function findVariable(scope, name) {
	if (!scope) {
		console.error("Scope is undefined in find method!");
		return undefined;
	}
	// only handle elements that may carry failure rate data
	if (!Metamodel.safetyModel.Failable.isInstance(scope)) {
		console.error("Scope is not a Failable but has to be!");
		return undefined;
	}
	// we can skip if elements has no failure rate data
	if (!scope.failureRateData) {
		return undefined;
	}
	
	// search for catalog variables first
	var found = Global.getFinder(scope.failureRateData.variables.toArray()).findByType("FRVariable").find("name", name);
	if (!found.isEmpty()) {
		return found.first();
	}

	// search for user variables next
	found = Global.getFinder(scope.failureRateData.userVariables.toArray()).findByType("FRVariable").find("name", name);
	if (!found.isEmpty()) {
		return found.first();
	}
	
	// give up
	return undefined;
}

// helper
function findOrCreateVariable(scope, name) {
	var found = findVariable(scope, name);
	if (found) {
		return found;
	}
	
	// create one
	var created = Factory.createElement(scope, "FRVariable");
	created.name = name;
//	created.description = description;
//	created.comment = comment;
//	created.value = value;
	return created;
}

function findTraces(project) {
	var traceSet = TraceController.INSTANCE.findTraceModel(project ? project : finder.project);
	return Global.getFinder(traceSet).findByType("Trace");
}

// added by MP
function findOrCreatePort(scope, name) {
	var found = findPort(scope, name);
	if (found) {
		return found;
	}
	
	// create one
	var created = Factory.createElement(scope, Metamodel.sysml.SysMLFlowPortUsage);
	created.name = name;
	return created;
}

// added by MP
function findPort(scope, name) {
	var found = Global.getFinder(scope).findByType(Metamodel.sysml.SysMLFlowPortUsage, true).and("name", name);
	
	if (!found.isEmpty()) {
		return found.first();
	}
	
	// give up
	return undefined;
}

// added by MP
function findOrCreateConnector(source, target) {
	var found1 = findConnector(source, target);
	if (found1) {
		return found1;
	}
	var found2 = findConnector(target, source);
	if (found2) {
		return found2;
	}
	
	// create one
	var created = Factory.createRelation(source, target, Metamodel.sysml.SysMLConnector);
	
	//created.name = name;
	return created;
}

// added by MP
function findConnector(source, target) {
	// search through all connector (ends)
	var ends = source.end.toArray();
	for (var i = 0; i < ends.length; i++) {
		var end = ends[i];
		var conn = end.theConnector;
		// we assume that conn.theConnectorEnd.get(0).role == source
		if (conn.theConnectorEnd.get(1).role == target) {
			return conn; // found it
		}
	}

	// give up
	return undefined;
}

// helper added by GG 2021-10-19
function findChecklist(scope, name) {
	if (!scope) {
		console.error("Scope is undefined in findChecklist!");
		return undefined;
	}
	
	var found = Global.getFinder(scope).findByType(Metamodel.checklist.Checklist, true)
		.find("name", name);

	if (!found.isEmpty()) {
		// first() since 3.0.2
		return found.first();
	}
	
	return undefined;
}

// helper added by GG 2021-10-19
function findOrCreateChecklist(scope, name) {
	var found = findChecklist(scope, name);
	if (found) {
		return found;
	}
	
	// create one
	var created = Factory.createElement(scope, Metamodel.checklist.Checklist);
	created.typeCode = "checklist";
	created.name = name;
	return created;
}

// helper added by GG 2021-10-19
function findChecklistItem(scope, name) {
	if (!scope) {
		console.error("Scope is undefined in findChecklistItem!");
		return undefined;
	}
	
	var found = Global.getFinder(scope).findByType(Metamodel.checklist.StaticChecklistItem, true)
		.find("name", name);

	if (!found.isEmpty()) {
		// first() since 3.0.2
		return found.first();
	}
	
	return undefined;
}

// helper added by GG 2021-10-19
function findOrCreateChecklistItem(scope, name) {
	var found = findChecklistItem(scope, name);
	if (found) {
		return found;
	}
	
	// create one
	var created = Factory.createElement(scope, Metamodel.checklist.ChecklistItem);
	created.name = name;
	return created;
}

/**
 * Returns the project modle root ({@link MediniProject}) for 
 * any {@link EObject}, or <code>undefined</code> if element 
 * is null or undefined or is not contained in any project.
 * 
 * @param {EObject} element the model element
 * @return {MediniProject} the root object of the project model 
 * or <code>undefined</code>
 */
function findProjectModel(element) {
	return MediniProjectModelUtil.getMediniProject(element);
}

