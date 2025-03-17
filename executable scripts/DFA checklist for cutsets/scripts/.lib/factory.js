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
 * v2024-04-19 - NH extended the signature by collection type for: TriggerCollection, MeasureCatalog, SystemEffectCollection, WeaknessCollection
 * v2024-04-05 - MW extended the signature for failure collection creation by the required collection type (using the context parameter of createElement)
 * v2024-03-26 - JM added support for MissionProfile and contained data
 * v2023-12-05 - JM added support for RiskTimeProbabilityModel
 * v2022-09-12 - JM added support Checklist templates (23.1.0 only)
 * v2022-09-01 - JM added support for Item (finally)
 * v2022-05-17 - JM fixed SysMLValueProperty handling for 21.1 and 21.0 (was introduced later)
 * v2022-04-26 - JM added support for DC worksheet
 * v2022-03-07 - JM fixed connector and dependency creation for scripted importer use case
 * v2022-03-31 - JM added support for SecurityGoal
 * v2022-03-31 - MW support for FailureEffectCreation
 * v2022-03-23 - JM added support for SysMLValueProperty
 * v2022-03-11 - JM fixed connector doublet handling and connector creation for 22.1
 * v2022-03-01 - JM prevent creation of connector/dependency duplicates
 * v2022-02-08 - JM support for DCMetricsParameters
 * v2022-01-20 - MW support creation of damage scenario and other 22.1 artifacts + some leftovers
 * v2022-01-04 - JM support creation of system models without any scope
 * v2021-04-07 - JM fixed glitch preventing ui.js work together with factory.js  
 * v2021-03-17 - JM support creation of Failure Rate Data  
 * v2020-09-21 - JM prevent creation of contribution duplicates  
 * v2020-09-21 - JM fixed requirements relation from sub-requirement
 * v2020-08-14 - JM support creation of system models
 * v2020-06-29 - JM support creation of checklist items inside other items
 * v2020-05-06 - JM improved error handling for double traces and write protected HAZOP
 * v2020-04-22 - JM added support for add map entries in HAZOP entries
 * v2020-04-06 - JM added support for HAZOP and Guidewords
 * v2020-03-20 - JM small fix for Trace (> v310)
 * v2020-03-02 - JM initial support for Diagrams
 * v2019-11-13 - JM support for more Cybersecurity elements (Stakeholder)
 * v2019-11-05 - JM support for Cybersecurity elements
 * v2019-09-09 - JM more support for Causality Relations
 * v2019-08-29 - JM fixed creation of Ports/FlowPorts
 * v2019-08-29 - JM initial support for Weaknesses and Triggers
 * v2019-04-11 - JM added support for Actions
 * v2019-01-30 - JM added support for version 2019 R1
 * v2018-08-24 - JM added support for Checklist template usage
 * v2018-06-18 - JM added support for Hazard and Error
 * v2018-06-12 - JM fixed return value for FailureRelation and SafetyReqRelation
 * v2018-02-28 - JM added support for SysMLDependency and SysMLAbstraction
 * v2018-02-14 - JM added support for FRVariable
 * v2017-10-18 - JM added support for SysMLConnector
 * v2017-09-13 - JM initial version
 */
if (!bind) {
    throw "This script requires extended API";
}

// bind operations (NOT OFFICIAL API YET)
var AddPackageOperation = bind("de.ikv.analyze.core", "de.ikv.analyze.core.operations.AddPackageOperation", false);
var AddFunctionOperation = bind("de.ikv.analyze.core", "de.ikv.analyze.core.operations.AddFunctionOperation", false);
var AddMalfunctionOperation = bind("de.ikv.analyze.core", "de.ikv.analyze.core.operations.AddMalfunctionOperation", false);
var AddFailureModeOperation = bind("de.ikv.analyze.core", "de.ikv.analyze.core.operations.AddFailureModeOperation", false);
var AddHazardOperation = bind("de.ikv.analyze.core", "de.ikv.analyze.core.operations.AddHazardOperation", false);
var AddDamageScenarioOperation = undefined;
var AddErrorOperation = bind("de.ikv.analyze.core", "de.ikv.analyze.core.operations.AddErrorOperation", false);
var AddMeasureOperation = bind("de.ikv.analyze.core", "de.ikv.analyze.core.operations.AddMeasureOperation", false);
var AddSafetyRequirementOperation = bind("de.ikv.analyze.core", "de.ikv.analyze.core.operations.AddSafetyRequirementOperation", false);
var AddSafetyGoalOperation = bind("de.ikv.analyze.core", "de.ikv.analyze.core.operations.AddSafetyGoalOperation", false);
var AddSafetyMechanismOperation = bind("de.ikv.analyze.core", "de.ikv.analyze.core.operations.AddSafetyMechanismOperation", false);
var CreateTraceOperation = bind("de.ikv.medini.kernel.traceability", "de.ikv.medini.kernel.traceability.operations.CreateTraceOperation", false);
var MediniModelModificationUtil = bind("de.ikv.medini.util.emf.plugin", "de.ikv.medini.util.emf.edit.MediniModelModificationUtil", false);
var SafetyModelUtil = bind("de.ikv.medini.metamodel.safety", "de.ikv.medini.metamodel.safetyModel.util.SafetyModelUtil", false);
var SafetyGoalsUtils = bind("de.ikv.analyze.metamodel.safetygoals", "de.ikv.analyze.metamodel.safetygoals.util.SafetyGoalsUtils", false);
 
var CreateSystemArchitectureModelOperation = bind("de.ikv.analyze.sysml.core", "de.ikv.analyze.sysml.core.operations.CreateSystemArchitectureModelOperation", false);
var CreateItemModelOperation = bind("de.ikv.analyze.item.core", "de.ikv.analyze.item.core.operations.CreateItemModelOperation", false);
var CreateHazardAnalysisModelOperation = bind("de.ikv.analyze.core", "de.ikv.analyze.core.operations.CreateHazardAnalysisModelOperation", false);
var CreateFMEAWorksheetOperation = bind("de.ikv.analyze.core", "de.ikv.analyze.core.operations.CreateFMEAWorksheetOperation", false);
var CreateDCWorksheetOperation = bind("de.ikv.analyze.editor.dc.core", "de.ikv.analyze.editor.dc.core.operations.CreateDCWorksheetOperation", false);
var CreateFTAModelOperation = bind("de.ikv.analyze.core", "de.ikv.analyze.core.operations.CreateFTAModelOperation", false);
var CreateChecklistOperation = bind("de.ikv.analyze.editor.creation.checklist", "de.ikv.analyze.editor.creation.checklist.operations.CreateChecklistOperation", false);
var CreateSafetyGoalModelOperation = bind("de.ikv.analyze.safetygoal.core", "de.ikv.analyze.safetygoal.core.operations.CreateSafetyGoalModelOperation", false);
var CreateMissionProfileModelOperation = bind("de.ikv.analyze.failureratecatalogs", "de.ikv.analyze.failureratecatalogs.missionprofiles.operations.CreateMissionProfileModelOperation", false);
var ImportChecklistReviewOperation = undefined;
 
var SysmlFactory = bind("de.ikv.medini.metamodel.sysml", "de.ikv.medini.metamodel.sysml.SysmlFactory", false);
var SafetyModelFactory = bind("de.ikv.medini.metamodel.safety", "de.ikv.medini.metamodel.safetyModel.SafetyModelFactory", false);
var SafetyGoalsFactory = bind("de.ikv.analyze.metamodel.safetygoals", "de.ikv.analyze.metamodel.safetygoals.SafetyGoalsFactory", false);
var FMEAFactory = bind("de.ikv.medini.metamodel.fmea", "de.ikv.medini.metamodel.FMEA.FMEAFactory", false);
var HazardAnalysisFactory = bind("de.ikv.analyze.metamodel.hazard", "de.ikv.analyze.metamodel.hazard.HazardAnalysisFactory", false);
var FTAFactory = bind("de.ikv.medini.metamodel.fta", "de.ikv.medini.metamodel.FTA.FTAFactory", false);
var ChecklistFactory = bind("de.ikv.analyze.metamodel.checklist", "de.ikv.analyze.metamodel.checklist.ChecklistFactory", false);
var TransactionUtil = bind("org.eclipse.emf.transaction", "org.eclipse.emf.transaction.util.TransactionUtil", false);
var DCFactory = bind("de.ikv.analyze.metamodel.dc", "de.ikv.analyze.metamodel.dc.DcFactory", false);

var CreateNewFailureCollectionOperation = bind("de.ikv.analyze.core", "de.ikv.analyze.core.operations.CreateNewFailureCollectionOperation", false);
var CreateNewSystemEffectCollectionOperation = undefined;
var CreateNewMeasureCatalogOperation = bind("de.ikv.analyze.core", "de.ikv.analyze.core.operations.CreateNewMeasureCatalogOperation", false);
// ANY REFERENCE TO SYSML DIAGRAM CLASSES WERE INTENIONALLY REMOVED TO PREVENT TROUBLE WIHT BUNDLE ACTIVATION FROM NON-UI THREADS
var AnalyzeSystemAllocateOperation = bind("de.ikv.analyze.sysml.core", "de.ikv.analyze.sysml.core.operations.AnalyzeSystemAllocateOperation", false);
var SysMLModelUtils = bind("de.ikv.medini.sysml.core", "de.ikv.medini.sysml.core.SysMLModelUtils", false);

var FailureRateCatalogsFactory = bind("de.ikv.medini.metamodel.failureratecatalogs", "de.ikv.medini.metamodel.failureratecatalogs.FailureRateCatalogsFactory", false);
var FailureRateCatalogsPackage = bind("de.ikv.medini.metamodel.failureratecatalogs", "de.ikv.medini.metamodel.failureratecatalogs.FailureRateCatalogsPackage", false);
var MExpressionsFactory = bind("de.ikv.medini.metamodel.expressions", "de.ikv.medini.metamodel.MExpressions.MExpressionsFactory", false);
var MExpressionsPackage = bind("de.ikv.medini.metamodel.expressions", "de.ikv.medini.metamodel.MExpressions.MExpressionsPackage", false);

var StructuredSelection = bind("org.eclipse.jface", "org.eclipse.jface.viewers.StructuredSelection", false);
var VanillaAction = bind("de.ikv.medini.util.eclipse", "de.ikv.medini.util.eclipse.jface.action.VanillaAction", false);

// do not define it here and now
var CreatePJDiagramOperation = undefined;
var CreateNewDiagramHandler = undefined;

// these operations were introduced with 20.1 or later - avoid breaking scripts
var CreateNewWeaknessCollectionOperation = undefined;
var CreateNewTriggerCollectionOperation = undefined;
var AddLimitationOperation = undefined;
var AddTriggeringConditionOperation = undefined;
var AddVulnerabilityOperation = undefined;
var AddAttackOperation = undefined;
var AddThreatOperation = undefined;
var CreateNewThreatAssessmentModelOperation = undefined;
var ThreatAssessmentFactory = undefined;
var CreateAttackTreeOperation = undefined;
var AttackTreeFactory = undefined;
var DCMetricsParametersBuilder = undefined;

// see more bindings below

// some EMF stuff
var BasicEList = bind("org.eclipse.emf.common", "org.eclipse.emf.common.util.BasicEList", false); 

// helper
function __createTrace(from, to, ignoreExisting) {
	// creating multiple traces per pair is strictly forbidden and may cause trouble, better prevent this
	if (from && to && from.mediniGetTracedElements(to.prototype).contains(to)) {
		if (ignoreExisting) return undefined; // not easy to really return the existing trace
		throw "a trace between the two objects already exists";
	}
	
    // create one
    var domain = TransactionUtil.getEditingDomain(from);
    var op = new CreateTraceOperation(domain, "Link", from, to, "");
    op.execute(null, null);
    return op.getTrace();
}
 
// helper
function __createFailureRelation(cause, effect) {
	return __createCausalityRelation(cause, effect);
}

// helper
function __createCausalityRelation(cause, effect) {
	// compatibility for < 2020 R1
	if ("addFailureRelation" in SafetyModelUtil.INSTANCE) {
	    return SafetyModelUtil.INSTANCE.addFailureRelation(cause, effect);
	}
	
	// this is 2020 R1
	return SafetyModelUtil.INSTANCE.addCausalityRelation(cause, effect);
}

// helper
function __getRequirementsModel(source) {
    // source might be top-level (then model is set) or sub (then container is set)
	if (source.model) {
		return source.model;
	}
	
	if (!source.container) {
		throw "requirement is missng the container reference";
	}
	
	return __getRequirementsModel(source.container);
}

function __hasRelationBetween(source, target) {
	var relations = source.sourceRelations;
	for (var i=0; i<relations.size(); i++) {
		var relation = relations.get(i);
		if (relation.target === target) {
			return true;			
		}
	}

	return false;	
}

function __hasDependencyBetween(source, target) {
	var relations = source.the_relationship_of_source;
	for (var i=0; i<relations.size(); i++) {
		var relation = relations.get(i);
		// note: since 22.1 this also contains connectors!
		if (relation instanceof Metamodel.sysml.SysMLConnector) {
			continue; // ignore
		}
		if (relation.the_target_element === target) {
			return true;			
		}
	}

	return false;	
}

function __hasConnectorBetween(source, target) {
	if ("end" in source) {
		// before 22.1 this was UMLConnectableElement.end
		var ends = source.end;
		for (var i=0; i<ends.size(); i++) {
			var end = ends.get(i);
			var connector = end.theConnector;
			if (connector.theConnectorEnd.get(1).role === target) {
				return true;			
			}
		}
	}
	else if ("relationships" in source) {
		// before 22.1 this was UMLConnectableElement.end
		var rels = source.relationships;
		for (i=0; i<rels.size(); i++) {
			connector = rels.get(i);
			if (connector && "theConnectorEnd" in connector && connector.theConnectorEnd.get(1).role === target) {
				return true;			
			}
		}
	} else {
		throw "not supported in this library";
	}

	return false;	
}

// helper
function __createContributesRelation(source, target, ignoreExisting) {
	// creating multiple relations per pair is strictly forbidden and may cause trouble, better prevent this
	if (source && target && __hasRelationBetween(source, target)) {
		if (ignoreExisting) return undefined; // not easy to really return the existing relation
		throw "a relation between the two objects already exists";
	}
	
    var kind = SafetyGoalsFactory.eINSTANCE.createFromString(Metamodel.safetygoals.SafetyReqRelationKind, "UNSPECIFIED");
    var relation = SafetyGoalsUtils.createSafetyRelation(source, target, kind);
    // we need the requirements model as the container for the relation
    var scope = __getRequirementsModel(source);
    MediniModelModificationUtil.addValueOfFeature(scope, Metamodel.safetygoals.SafetyRequirementsModel.reqRelations, relation);
    return relation;
}
 
// helper
function __createPart(scope) {
    var part = SysmlFactory.eINSTANCE.create(Metamodel.sysml.SysMLPart);
    part.typeCode = "Generic";
    part.name = "new part";
 
    // XXX changing containment is not supported in 3.1.0 API
    var feature = Metamodel.sysml.SysMLPart.the_owned_elements;
    MediniModelModificationUtil.addValueOfFeature(scope, feature, part);
 
    return part;
}
 
// helper
function __createValueProperty(scope) {
    var prop = SysmlFactory.eINSTANCE.create(Metamodel.sysml.SysMLValueProperty);
    prop.name = "new property";
 
    // XXX changing containment is not supported in 3.1.0 API
    var feature = Metamodel.sysml.SysMLPart.the_owned_elements;
    MediniModelModificationUtil.addValueOfFeature(scope, feature, prop);
 
    return prop;
}

// helper
function __createActor(scope) {
    var part = SysmlFactory.eINSTANCE.create(Metamodel.sysml.SysMLActor);
    part.typeCode = "stakeholder";
    part.name = "new stakeholder";
 
    // XXX changing containment is not supported in 3.1.0 API
    var feature = Metamodel.sysml.SysMLPart.the_owned_elements;
    MediniModelModificationUtil.addValueOfFeature(scope, feature, part);
 
    return part;
}

// helper
function __createContainerPackage(scope) {
    var pkg = SysmlFactory.eINSTANCE.create(Metamodel.sysml.SysMLContainerPackage);
    pkg.name = "new package";
 
    if (scope) {
        // XXX changing containment is not supported in 3.1.0 API
        var feature = Metamodel.sysml.SysMLElement.the_owned_elements;
        MediniModelModificationUtil.addValueOfFeature(scope, feature, pkg);
    }
 
    return pkg;
}

// helper
function __createSysMLModel(scope) {
    if (!scope) {
        console.error("Scope is undefined in create method!");
    }
    // create one
    var op = new CreateSystemArchitectureModelOperation("", scope);
    op.execute(null, null);
    return op.getNewModel();
}

// helper
function __createAction(scope) {
    var activity = SysmlFactory.eINSTANCE.create(Metamodel.sysml.SysMLAction);
    activity.name = "new action";
 
    // XXX changing containment is not supported in 3.1.0 API
    var feature = Metamodel.sysml.SysMLPart.the_owned_elements;
    MediniModelModificationUtil.addValueOfFeature(scope, feature, activity);
 
    return activity;
}

// helper
function __createActivity(scope) {
    var activity = SysmlFactory.eINSTANCE.create(Metamodel.sysml.SysMLActivity);
    activity.name = "new activity";
 
    // XXX changing containment is not supported in 3.1.0 API
    var feature = Metamodel.sysml.SysMLPart.the_owned_elements;
    MediniModelModificationUtil.addValueOfFeature(scope, feature, activity);
 
    return activity;
}

// helper
function __createBlock(scope) {
    var block = SysmlFactory.eINSTANCE.create(Metamodel.sysml.SysMLBlock);
    block.typeCode = "Generic";
    block.name = "new block";
 
    // XXX changing containment is not supported in 3.1.0 API
    var feature = Metamodel.sysml.SysMLBlock.the_owned_elements;
    MediniModelModificationUtil.addValueOfFeature(scope, feature, block);
 
    return block;
}

// helper
function __createPort(scope) {
    var port = SysmlFactory.eINSTANCE.create(Metamodel.sysml.SysMLFlowPort);
    port.name = "new port";
 
    // XXX changing containment is not supported in 3.1.0 API
    var feature = Metamodel.sysml.SysMLBlock.the_owned_elements;
    MediniModelModificationUtil.addValueOfFeature(scope, feature, port);
 
    return port;
}


// helper
function __createPortUsage(scope) {
  var port = SysmlFactory.eINSTANCE.create(Metamodel.sysml.SysMLFlowPortUsage);
  port.name = "new port usage";

  // XXX changing containment is not supported in 3.1.0 API
  var feature = Metamodel.sysml.SysMLPart.the_owned_elements;
  MediniModelModificationUtil.addValueOfFeature(scope, feature, port);

  return port;
}

/**
 * Default approach is to traverse ancestors of the source to find instance of container.
 * Modify with appropriate logic.
 */
function __deduceContainer(source, target, type) {
	// Find container element for the new link.
	// Climb up by containment hierarchy starting from the source
	// and return the first element that is instance of the container class.
	var element = source;
	while (element != null) {
		if (element instanceof type) {
			return element;
		}
		element = element.eContainer();
	}
	return null;
}

// helper
function __createConnector(source, target, ignoreExisting) {
	// creating multiple connectors per pair is strictly forbidden and may cause trouble, better prevent this
	if (source && target && __hasConnectorBetween(source, target)) {
		if (ignoreExisting) return undefined; // not easy to really return the existing connector
		throw "a connector between the two objects already exists";
	}
	
	var connector = SysmlFactory.eINSTANCE.create(Metamodel.sysml.SysMLConnector);
	var container = __deduceContainer(source, target, Metamodel.sysml.SysMLContainerPackage);
	
    // XXX changing containment is not supported in 3.1.0 API
    var feature = Metamodel.sysml.SysMLContainerPackage.connectors;
    MediniModelModificationUtil.addValueOfFeature(container, feature, connector);
	
	if (Factory.isV2210OrLater) {
		// 22.1 code
		ConnectorUtil.createConnectorEnds(connector);
		connector.the_source_element = source;
		connector.the_target_element = target;
	} else {
		// pre 22.1 code
		ConnectorUtil.createConnectorEnds(connector);
		ConnectorUtil.getSourceEnd(connector).role = source;
		ConnectorUtil.getTargetEnd(connector).role = target;
	}
	
	return connector;
}

// helper
function __createDependency(source, target, ignoreExisting) {
	// creating multiple dependencies  per pair is strictly forbidden and may cause trouble, better prevent this
	if (source && target && __hasDependencyBetween(source, target)) {
		if (ignoreExisting) return undefined; // not easy to really return the existing dependency
		throw "a dependency between the two objects already exists";
	}
	
	var connector = SysmlFactory.eINSTANCE.create(Metamodel.sysml.SysMLDependency);
	var container = __deduceContainer(source, target, Metamodel.sysml.SysMLElement);
	
    // XXX changing containment is not supported in 3.1.0 API
    var feature = Metamodel.sysml.SysMLElement.dependencies;
    MediniModelModificationUtil.addValueOfFeature(container, feature, connector);

	connector.the_source_element = source;
	connector.the_target_element = target;
	return connector;
}

// helper
function __createAbstraction(source, target) {
    // create one
    var op = new AnalyzeSystemAllocateOperation(source, java.util.Collections.singletonList(target));
    op.execute(null, null);
    // unfortunately that one will not give us the result
    return SysMLModelUtils.findDependency(source, target,
		Metamodel.sysml.SysMLAbstraction.instanceClass, "allocate");
}

// helper
function __createRequirementsModel(scope) {
    if (!scope) {
        console.error("Scope is undefined in create method!");
    }
 
    // create one
    var op = new CreateSafetyGoalModelOperation("", scope);
    op.execute(null, null);
    return op.getNewModel();
}

// helper
function __createSafetyRequirement(scope) {
    if (!scope) {
        console.error("Scope is undefined in create method!");
    }
 
    // create one
    var op = new AddSafetyRequirementOperation(scope, null);
    op.clientExecute(null);
    return op.getSafetyRequirement();
}

// helper
function __createSafetyGoal(scope) {
    if (!scope) {
        console.error("Scope is undefined in create method!");
    }
 
    // create one
    var op = new AddSafetyGoalOperation(scope, null);
    op.clientExecute(null);
    return op.getSafetyGoal();
}

// helper
function __createSecurityGoal(scope) {
    if (!scope) {
        console.error("Scope is undefined in create method!");
    }
 
    // create one
    var op = new AddSecurityGoalOperation(scope, null);
    op.clientExecute(null);
	// TODO Yes, its named getSafetyGoal, dont ask why
    return op.getSafetyGoal();
}

// helper
function __createFailureCollection(scope, collectionType) {
    if (!scope) {
        console.error("Scope is undefined in create method!");
    }

    if (!collectionType) {
        collectionType = Metamodel.safetyModel.Hazard;
    }
 
    // create one
    var op = new CreateNewFailureCollectionOperation("", collectionType, scope);
    op.execute(null, null);
    return op.getNewModel();
}
 
// helper
function __createSystemEffectCollection(scope, collectionType) {
    if (!scope) {
        console.error("Scope is undefined in create method!");
    }

    if (!collectionType) {
        collectionType = Metamodel.security.DamageScenario;
    }

    if (CreateNewSystemEffectCollectionOperation == undefined) {
		CreateNewSystemEffectCollectionOperation = bind("de.ikv.analyze.core", "de.ikv.analyze.core.operations.CreateNewSystemEffectCollectionOperation", false);
	}

    // create one
    var op = new CreateNewSystemEffectCollectionOperation("", collectionType, scope);
    op.execute(null, null);
    return op.getNewModel();
}
 
// helper
function __createWeaknessCollection(scope, collectionType) {
    if (!scope) {
        console.error("Scope is undefined in create method!");
    }
    
    if (!collectionType) {
        collectionType = Metamodel.safetyModel.Limitation;
    }

    if (CreateNewWeaknessCollectionOperation == undefined) {
    	CreateNewWeaknessCollectionOperation = bind("de.ikv.analyze.core", "de.ikv.analyze.core.operations.CreateNewWeaknessCollectionOperation", false);
    }
    
    // create one
    var op = new CreateNewWeaknessCollectionOperation("", collectionType, scope);
    op.execute(null, null);
    return op.getNewModel();
}

// helper
function __createTriggerCollection(scope, collectionType) {
    if (!scope) {
        console.error("Scope is undefined in create method!");
    }
 
    if (!collectionType) {
        collectionType = Metamodel.safetyModel.TriggeringCondition;
    }

    if (CreateNewTriggerCollectionOperation == undefined) {
    	CreateNewTriggerCollectionOperation = bind("de.ikv.analyze.core", "de.ikv.analyze.core.operations.CreateNewTriggerCollectionOperation", false);
    }
    
    // create one
    var op = new CreateNewTriggerCollectionOperation("", collectionType, scope);
    op.execute(null, null);
    return op.getNewModel();
}

// helper
function __createLimitation(scope) {
    if (!scope) {
        console.error("Scope is undefined in create method!");
    }
 
    if (AddLimitationOperation == undefined) {
    	AddLimitationOperation = bind("de.ikv.analyze.core", "de.ikv.analyze.core.operations.AddLimitationOperation", false);
    }
    
    // create one
    var op = new AddLimitationOperation(scope, null);
    op.clientExecute(null);
    return op.getLimitation();
}

// helper
function __createTriggeringCondition(scope) {
    if (!scope) {
        console.error("Scope is undefined in create method!");
    }
 
    if (AddTriggeringConditionOperation == undefined) {
    	AddTriggeringConditionOperation = bind("de.ikv.analyze.core", "de.ikv.analyze.core.operations.AddTriggeringConditionOperation", false);
    }
    
    // create one
    var op = new AddTriggeringConditionOperation(scope, null);
    op.clientExecute(null);
    return op.getTriggeringCondition();
}

// helper
function __createVulnerability(scope) {
    if (!scope) {
        console.error("Scope is undefined in create method!");
    }
 
    if (AddVulnerabilityOperation == undefined) {
    	AddVulnerabilityOperation = bind("de.ikv.analyze.core", "de.ikv.analyze.core.operations.AddVulnerabilityOperation", false);
    }
    
    // create one
    var op = new AddVulnerabilityOperation(scope, null);
    op.clientExecute(null);
    return op.getVulnerability();
}

// helper
function __createAttack(scope) {
    if (!scope) {
        console.error("Scope is undefined in create method!");
    }
 
    if (AddAttackOperation == undefined) {
    	AddAttackOperation = bind("de.ikv.analyze.core", "de.ikv.analyze.core.operations.AddAttackOperation", false);
    }
    
    // create one
    var op = new AddAttackOperation(scope, null);
    op.clientExecute(null);
    return op.getAttack();
}

// helper
function __createThreat(scope) {
    if (!scope) {
        console.error("Scope is undefined in create method!");
    }
 
    if (AddThreatOperation == undefined) {
    	AddThreatOperation = bind("de.ikv.analyze.core", "de.ikv.analyze.core.operations.AddThreatOperation", false);
    }
    
    // create one
    var op = new AddThreatOperation(scope, null);
    op.clientExecute(null);
    return op.getThreat();
}

// helper
function __createDamageScenario(scope) {
    if (!scope) {
        console.error("Scope is undefined in create method!");
    }
 
	if (AddDamageScenarioOperation == undefined) {
		AddDamageScenarioOperation = bind("de.ikv.analyze.core", "de.ikv.analyze.core.operations.AddDamageScenarioOperation", false);
	}
	
	// create one
    var op = new AddDamageScenarioOperation(scope, null);
    op.clientExecute(null);
    return op.getDamageScenario();
}

// helper
function __createFailureMode(scope) {
    if (!scope) {
        console.error("Scope is undefined in create method!");
    }
 
    // create one
    var op = new AddFailureModeOperation(scope, null);
    op.clientExecute(null);
    return op.getFailureMode();
}
 
// helper
function __createMalfunction(scope) {
    if (!scope) {
        console.error("Scope is undefined in create method!");
    }
 
    // create one
    var op = new AddMalfunctionOperation(scope, null);
    op.clientExecute(null);
    return op.getMalfunction();
}

// helper
function __createHazard(scope) {
    if (!scope) {
        console.error("Scope is undefined in create method!");
    }
 
    // create one
    var op = new AddHazardOperation(scope, null);
    op.clientExecute(null);
    return op.getHazard();
}

// helper
function __createError(scope) {
    if (!scope) {
        console.error("Scope is undefined in create method!");
    }
 
    // create one
    var op = new AddErrorOperation(scope, null);
    op.clientExecute(null);
    return op.getError();
}

/**
 * 
 * @param scope the {PJScope} parent
 * @returns the newly created {MeasureCatalog}
 * @since 2017-09-13
 */
function __createMeasureCatalog(scope, collectionType) {
    if (!scope) {
        console.error("Scope is undefined in create method!");
    }

    if (!collectionType) {
        collectionType = Metamodel.safetyModel.Measure;
    }

    // create one
    var op = new CreateNewMeasureCatalogOperation("", collectionType, scope);
    op.execute(null, null);
    return op.getNewModel();
}

// helper
function __createMeasure(scope) {
    if (!scope) {
        console.error("Scope is undefined in create method!");
    }
 
    // create one
    var op = new AddMeasureOperation(scope, null);
    op.clientExecute(null);
    return op.getMeasure();
}
 
// helper
function __createMeasureGroup(scope) {
    if (!scope) {
        console.error("Scope is undefined in create method!");
    }
 
    var measureGroup = SafetyModelFactory.eINSTANCE.create(Metamodel.safetyModel.MeasureGroup);
 
    // XXX changing containment is not supported in 3.1.0 API
    var feature = Metamodel.safetyModel.Failure.measureGroups;
    MediniModelModificationUtil.addValueOfFeature(scope, feature, measureGroup);
    // console.log("Added measure group to ''{0}''", scope.name);
    return measureGroup;
}

/**
 * @param scope the {MeasureCatalog} parent
 * @returns the newly created {SafetyMechanism}
 * @since 2017-09-13
 */
function __createSafetyMechanism(scope) {
    if (!scope) {
        console.error("Scope is undefined in create method!");
    }
 
    // create one
    var op = new AddSafetyMechanismOperation(scope, null /* no name */);
    op.clientExecute(null);
    return op.getSafetyMechanism();
}

// helper
function __createFMEAWorksheet(scope) {
	if (!scope) {
		console.error("Scope is undefined in create method!");
	}
	
	// create one
	var op = new CreateFMEAWorksheetOperation("", scope);
	op.execute(null, null);
	return op.getNewModel();
}

// helper
function __createDCWorksheet(scope) {
	if (!scope) {
		console.error("Scope is undefined in create method!");
	}
	
	// create one
	var op = new CreateDCWorksheetOperation(null, scope, "");
	op.execute(null, null);
	return op.getNewModel();
}

// helper
function __createRecommendedAction(scope) {
    if (!scope) {
        console.error("Scope is undefined in create method!");
    }
 
    var action = FMEAFactory.eINSTANCE.create(Metamodel.FMEA.RecommendedAction);
 
    // XXX changing containment is not supported in 3.1.0 API
    var feature = Metamodel.FMEA.MeasureEntry.recommendedActions;
    MediniModelModificationUtil.addValueOfFeature(scope, feature, action);
    return action;
}
 
// helper
function __createTakenAction(scope) {
    if (!scope) {
        console.error("Scope is undefined in create method!");
    }
 
    var entry = FMEAFactory.eINSTANCE.create(Metamodel.FMEA.TakenAction);
 
    // XXX changing containment is not supported in 3.1.0 API
    var feature = Metamodel.FMEA.RecommendedAction.takenActions;
    MediniModelModificationUtil.addValueOfFeature(scope, feature, entry);
    return entry;
}
 
// helper
function __createCurrentDesignControl(scope) {
    if (!scope) {
        console.error("Scope is undefined in create method!");
    }
 
    var entry = FMEAFactory.eINSTANCE.create(Metamodel.FMEA.CurrentDesignControl);
 
    // XXX changing containment is not supported in 3.1.0 API
    var feature = Metamodel.FMEA.CauseEntry.currentDesignControls;
    MediniModelModificationUtil.addValueOfFeature(scope, feature, entry);
    return entry;
}
 
// helper
function __createFailureEntry(scope) {
    if (!scope) {
        console.error("Scope is undefined in create method!");
    }
 
    var entry = FMEAFactory.eINSTANCE.create(Metamodel.FMEA.FailureEntry);
 
    // XXX changing containment is not supported in 3.1.0 API
    var feature = Metamodel.FMEA.ComponentEntry.failureModes;
    MediniModelModificationUtil.addValueOfFeature(scope, feature, entry);
    return entry;
}
 
//helper
function __createComponentEntry(scope) {
    if (!scope) {
        console.error("Scope is undefined in create method!");
    }
 
    var entry = FMEAFactory.eINSTANCE.create(Metamodel.FMEA.Component);
 
    // XXX changing containment is not supported in 3.1.0 API
    var feature = Metamodel.FMEA.FMEAWorksheet.components;
    MediniModelModificationUtil.addValueOfFeature(scope, feature, entry);
    return entry;
}

function __createPlainFailureMode(scope) {
    if (!scope) {
        console.error("Scope is undefined in create method!");
    }
 
    var entry = FMEAFactory.eINSTANCE.create(Metamodel.FMEA.PlainFailureMode);
 
    // XXX changing containment is not supported in 3.1.0 API
    var feature = Metamodel.FMEA.Component.failureModes;
    MediniModelModificationUtil.addValueOfFeature(scope, feature, entry);
    return entry;
}
 
function __createFailureEffect(scope) {
    if (!scope) {
        console.error("Scope is undefined in create method!");
    }
 
    var entry = FMEAFactory.eINSTANCE.create(Metamodel.FMEA.FailureEffect);
 
    // XXX changing containment is not supported in 3.1.0 API
    var feature = Metamodel.FMEA.PlainFailureMode.failureEffects;
    MediniModelModificationUtil.addValueOfFeature(scope, feature, entry);
    return entry;
}
 
// helper
function __createDCMetricsParametersBuilder(scope) {
    if (!scope) {
        console.error("Scope is undefined in create method!");
    }
    
	if (DCMetricsParametersBuilder == undefined) {
		DCMetricsParametersBuilder = bind("de.ikv.analyze.metamodel.dc", "de.ikv.analyze.metamodel.dc.DCMetricsParametersBuilder", false);
	}
    var builder = new DCMetricsParametersBuilder();
    return builder;
}

// helper
function __createDCFailureModeEntry(scope) {
    if (!scope) {
        console.error("Scope is undefined in create method!");
    }
 
    var entry = DCFactory.eINSTANCE.create(Metamodel.dc.DCFailureModeEntry);
 
    // XXX changing containment is not supported in 3.1.0 API
    var feature = Metamodel.FMEA.ComponentEntry.failureModes;
    MediniModelModificationUtil.addValueOfFeature(scope, feature, entry);
    return entry;
}
 
// helper
function __createItemModel(scope) {
        if (!scope) {
			console.error("Scope is undefined in create method!");
        }
       
        // create one
        var op = new CreateItemModelOperation("", scope);
        op.execute(null, null);
        return op.getNewModel();
}

// helper
function __createHazardAnalysisModel(scope) {
        if (!scope) {
			console.error("Scope is undefined in create method!");
        }
       
        // create one
        var op = new CreateHazardAnalysisModelOperation("", scope, null);
        op.execute(null, null);
        return op.getNewModel();
}
 
// helper
function __createHazop(scope) {
	if (!scope) {
		console.error("Scope is undefined in create method!");
	}
   
    // create one
	if (CreateHazopAnalysisOperation == undefined) {
		CreateHazopAnalysisOperation = bind("de.ikv.analyze.hazop", "de.ikv.analyze.hazop.ui.operations.CreateHazopAnalysisOperation", false);
	}
	var op = new CreateHazopAnalysisOperation("", scope, true /* default model*/ );
	op.execute(null, null);
	return op.getNewModel();
}

// HAZOP/Guideword analysis
var CreateHazopAnalysisOperation = undefined;
var AddGuidewordOperation = undefined;
var HazopFactory = undefined;

// helper
function __createGuideword(scope) {
	if (!scope) {
		console.error("Scope is undefined in create method!");
	}
   
    // create one
	if (AddGuidewordOperation == undefined) {
		AddGuidewordOperation = bind("de.ikv.analyze.hazop", "de.ikv.analyze.hazop.ui.operations.AddGuidewordOperation", false);
	}
	if (HazopFactory == undefined) {
		HazopFactory = bind("de.ikv.analyze.metamodel.hazop", "de.ikv.analyze.metamodel.hazop.HazopFactory", false);
	}
	var guideword = HazopFactory.eINSTANCE.create(Metamodel.hazop.Guideword);
	var op = new AddGuidewordOperation(scope, guideword, scope.guidewords.size());
	op.execute(null, null);
	return guideword;
}

// helper
function __createHazopEntry(scope) {
	if (!scope) {
		console.error("Scope is undefined in create method!");
	}
   
    // create one
	if (HazopFactory == undefined) {
		HazopFactory = bind("de.ikv.analyze.metamodel.hazop", "de.ikv.analyze.metamodel.hazop.HazopFactory", false);
	}
	var entry = HazopFactory.eINSTANCE.create(Metamodel.hazop.HazopEntry);
    // XXX changing containment is not supported in 3.1.0 API
    var feature = Metamodel.hazop.HazopAnalysisModel.entries;
    MediniModelModificationUtil.addValueOfFeature(scope, feature, entry);
	return entry;
}

// helper
function __createThreatAssessmentModel(scope) {
    if (!scope) {
		console.error("Scope is undefined in create method!");
    }
    if (CreateNewThreatAssessmentModelOperation == undefined) {
    	CreateNewThreatAssessmentModelOperation = bind("de.ikv.analyze.core", "de.ikv.analyze.core.operations.CreateNewThreatAssessmentModelOperation", false);
    }
    
    // create one
    var op = new CreateNewThreatAssessmentModelOperation("", scope);
    op.execute(null, null);
    return op.getNewModel();
}

// helper
function __createThreatEvent(scope) {
	if (ThreatAssessmentFactory == undefined) {
		ThreatAssessmentFactory = bind("de.ikv.analyze.metamodel.tara", "de.ikv.analyze.metamodel.tara.ThreatAssessmentFactory", false);
	}
    var event = ThreatAssessmentFactory.eINSTANCE.create(Metamodel.tara.ThreatEvent);
    event.id = "-";
 
    // XXX changing containment is not supported in 3.1.0 API
    var feature = Metamodel.tara.ThreatAssessmentModel.threatEvents;
    MediniModelModificationUtil.addValueOfFeature(scope, feature, event);

    return event;
}

// helper
function __createIsoAsil(scope) {
	if (!scope || scope.prototype != Metamodel.hazard.HazardousEvent) {
		console.error("Scope is undefined or wrong in create method!");
	}
	
	var isoAsil = HazardAnalysisFactory.eINSTANCE.create(Metamodel.hazard.IsoAsil);
	var feature = Metamodel.hazard.HazardousEvent.isoAsil;
	MediniModelModificationUtil.setValueOfFeature(scope, feature, isoAsil);

	return isoAsil;
}

// helper
function __createHazardousEvent(scope) {
    var event = HazardAnalysisFactory.eINSTANCE.create(Metamodel.hazard.HazardousEvent);
    event.id = "-";
 
    // XXX changing containment is not supported in 3.1.0 API
    var feature = Metamodel.hazard.HazardAnalysisModel.hazardElements;
    MediniModelModificationUtil.addValueOfFeature(scope, feature, event);
 
    // create nested structures (!)
    var situation = HazardAnalysisFactory.eINSTANCE.create(Metamodel.hazard.OperationalSituation);
    feature = Metamodel.hazard.HazardousEvent.operationalSituation;
    MediniModelModificationUtil.setValueOfFeature(event, feature, situation);
 
	if (Factory.isBeforeV1930) {
	    var isoAsil = HazardAnalysisFactory.eINSTANCE.create(Metamodel.hazard.IsoAsil);
	    feature = Metamodel.hazard.HazardousEvent.isoAsil;
	    MediniModelModificationUtil.setValueOfFeature(event, feature, isoAsil);
	}

    return event;
}
 
//helper
function __createPackage(scope) {
    if (!scope) {
        console.error("Scope is undefined in create method!");
    }
 
    // create one
    var op = new AddPackageOperation(scope, "");
    op.execute(null, null);
    return op.getNewModel();
}
 
// helper
function __createChecklist(scope, context) {
    if (!scope) {
        console.error("Scope is undefined in create method!");
    }
 
    if (ImportChecklistReviewOperation == undefined) {
        ImportChecklistReviewOperation = bind("de.ikv.analyze.editor.review.checklist", "de.ikv.analyze.editor.review.checklist.handlers.ImportChecklistReviewOperation", false);
    }
 
    // create one
    var op = new ImportChecklistReviewOperation("", scope, "");
    // since 23.1.0 we can set a template
    if (context && ("template" in context) && ("template" in op) ) {
    	op.template = context["template"];
    } else if (context && "handler" in context) {
        // @deprecated and never really working
        op.setHandler(context ? context["handler"] : null);
    }
    op.execute(null, null);
    return op.getNewModel();
}

function __isTopLevelForDiagram(scope) {
    if (scope instanceof Metamodel.FTA.FTAModel) {
    	return true;
    }
	if (scope instanceof Metamodel.sysml.SysMLContainerPackage) {
		return true;
	}
	if (scope instanceof Metamodel.safetygoals.SafetyRequirementsModel) {
		return true;
	}
	
	return false;
}

// helper
function __createDiagram(scope, context) {
    if (!scope) {
        console.error("Scope is undefined in create method!");
    }
 
    if (CreatePJDiagramOperation == undefined) {
    	CreatePJDiagramOperation = bind("de.ikv.medini.projectmodel.ui", "de.ikv.medini.projectmodel.operations.CreatePJDiagramOperation", false);
    }
    if (CreateNewDiagramHandler == undefined) {
    	CreateNewDiagramHandler = bind("de.ikv.analyze.ui.common", "de.ikv.analyze.ui.common.handlers.CreateNewDiagramHandler", false);
    }

    // scope at this point can be either a PJDiagram (to create a child diagram) or a PJProxy or any semantic element.
    var proxy = undefined;
    if (__isTopLevelForDiagram(scope)) {
    	proxy = scope.mediniGetOpposites("originalModel").get(0);
    } else {
    	// TODO Support proxy and diagram as scope
    	throw "unsupported container for diagram";
    }

    // TODO At the moment we cannot use the diagram operation, too much function is provided by the handler
    var handler = new CreateNewDiagramHandler();
	var action = new VanillaAction("Create Diagram");
	handler.selectionChanged(action, new StructuredSelection(proxy));
    
    // obtain the operation from the hander and execute it
	if ("getOperation" in handler) {
	    var op = handler.getOperation();
	    op.execute(null, null);
	    return op.getDiagram();
	} else {
		throw "Script code can not access vital functions of diagram handling: you MUST add $ENHANCED_JAVA_ACCESS$ pragma to your script";
	}
}

// helper
function __createChecklistItem(scope) {
    if (!scope) {
        console.error("Scope is undefined in create method!");
    }
 
    // create one (ALWAYS CREATE STATIC!)
    var item = ChecklistFactory.eINSTANCE.create(Metamodel.checklist.StaticChecklistItem);
    var feature = Metamodel.checklist.Checklist.items;
    // scope might be another checklist item
    if (scope instanceof Metamodel.checklist.ChecklistItem) {
    	feature = Metamodel.checklist.ChecklistItem.subItems;
    }
    MediniModelModificationUtil.addValueOfFeature(scope, feature, item);
 
    return item;
}
 
// helper
function __createFTAModel(scope) {
    if (!scope) {
        console.error("Scope is undefined in create method!");
    }
 
    // create one
    var op = new CreateFTAModelOperation("", "", scope);
    op.execute(null, null);
    return op.getNewModel();
}
 
// helper
function __createAttackTree(scope) {
    if (!scope) {
        console.error("Scope is undefined in create method!");
    }
    if (CreateAttackTreeOperation == undefined) {
    	CreateAttackTreeOperation = bind("de.ikv.analyze.core", "de.ikv.analyze.core.operations.CreateAttackTreeOperation", false);
    }
    
    // create one
    var op = new CreateAttackTreeOperation("", scope);
    op.execute(null, null);
    return op.getNewModel();
}

// EXCEPTION This method returns models that are NOT part of any scope yet
function __createAttackPathModel(/* no scope!*/) {
	if (AttackTreeFactory == undefined) {
		AttackTreeFactory = bind("de.ikv.medini.metamodel.fta", "de.ikv.medini.metamodel.attacktree.AttackTreeFactory", false);	
	}
    return AttackTreeFactory.eINSTANCE.create(Metamodel.attacktree.AttackPathModel);
}

// helper
function __createFTAEvent(scope) {
    if (!scope) {
        console.error("Scope is undefined in create method!");
    }
 
    // create one
    var event = FTAFactory.eINSTANCE.create(Metamodel.FTA.Event);
    var feature = Metamodel.FTA.FTAModel.events;
    MediniModelModificationUtil.addValueOfFeature(scope, feature, event);
 
	/*
	 * With 3.4.0 we introduced a separation between Event and EventNode.
	 * Execute conditional code.
	 */
	if (__tool_version_number && __tool_version_number >= 340) {
		feature = Metamodel.FTA.FTAModel.eventNodes;
		var eventFeature = Metamodel.FTA.FTAModel.eventNodes;
		var eventNode = FTAFactory.eINSTANCE.create(Metamodel.FTA.EventNode);
		MediniModelModificationUtil.addValueOfFeature(scope, eventFeature, eventNode);
		eventNode.event = event;
	}

    return event;
}
 
// helper
function __createFTAEventNode(scope) {
    if (!scope) {
        console.error("Scope is undefined in create method!");
    }
 
    // create one
    var eventNode = FTAFactory.eINSTANCE.create(Metamodel.FTA.EventNode);
    var feature = Metamodel.FTA.FTAModel.eventNodes;
    MediniModelModificationUtil.addValueOfFeature(scope, feature, eventNode);
 
    return eventNode;
}

// helper
function __createCustomProbabilityModel(scope, type) {
    if (!scope) {
        console.error("Scope is undefined in create method!");
    }
    if (!type) {
        console.error("Type is undefined in create method!");
    }
 
    // create one
    var model = FTAFactory.eINSTANCE.create(type);
    console.log(model);
    var feature = Metamodel.FTA.Event.probabilityData;
    MediniModelModificationUtil.addValueOfFeature(scope, feature, model);

    return model;
}

// helper
function __createFTALogicalGate(scope) {
    if (!scope) {
        console.error("Scope is undefined in create method!");
    }
 
    // create one
    var gate = FTAFactory.eINSTANCE.create(Metamodel.FTA.LogicalGate);
    var feature = Metamodel.FTA.FTAModel.gates;
    MediniModelModificationUtil.addValueOfFeature(scope, feature, gate);
 
    return gate;
}
 
// helper
function __createFTAVotingGate(scope) {
    if (!scope) {
        console.error("Scope is undefined in create method!");
    }
 
    // create one
    var gate = FTAFactory.eINSTANCE.create(Metamodel.FTA.VotingGate);
    var feature = Metamodel.FTA.FTAModel.gates;
    MediniModelModificationUtil.addValueOfFeature(scope, feature, gate);
 
    return gate;
}
 
// helper
function __createFTATransferGate(scope) {
    if (!scope) {
        console.error("Scope is undefined in create method!");
    }
 
    // create one
    var gate = FTAFactory.eINSTANCE.create(Metamodel.FTA.TransferGate);
    var feature = Metamodel.FTA.FTAModel.gates;
    MediniModelModificationUtil.addValueOfFeature(scope, feature, gate);
 
    return gate;
}
 
// helper
function __createFTAConnection(scope, source, target) {
    if (!scope) {
        console.error("Scope is undefined in create method!");
    }
 
    // create one
    var connection = FTAFactory.eINSTANCE.create(Metamodel.FTA.Connection);
    var feature = Metamodel.FTA.FTAModel.connections;
    MediniModelModificationUtil.addValueOfFeature(scope, feature, connection);
 
    if (source != undefined && target != undefined) {
        // Note: source is the output!
        connection.inputNode = source;
        connection.outputNode = target;
    }
 
    return connection;
}

// helper
function __createInternalWorkingCycle(scope) {
    if (!scope) {
        console.error("Scope is undefined in create method!");
    }

	var workingCycle = FailureRateCatalogsFactory.eINSTANCE.create(FailureRateCatalogsPackage.Literals.INTERNAL_WORKING_CYCLE);
	var feature = Metamodel.failureratecatalogs.MissionProfile.internalWorkingCycles;
	MediniModelModificationUtil.addValueOfFeature(scope, feature, workingCycle);

    return workingCycle;
}

// helper
function __createWorkingPhase(scope) {
    if (!scope) {
        console.error("Scope is undefined in create method!");
    }

	var workingPhase = FailureRateCatalogsFactory.eINSTANCE.create(FailureRateCatalogsPackage.Literals.WORKING_PHASE);
	var feature = Metamodel.failureratecatalogs.MissionProfile.workingPhases;
	MediniModelModificationUtil.addValueOfFeature(scope, feature, workingPhase);

    return workingPhase;
}

// helper
function __createMissionProfile(scope) {
    if (!scope) {
        console.error("Scope is undefined in create method!");
    }
    if (!(scope instanceof Metamodel.projectmodel.MediniProject)) {
        console.error("Scope must be a MediniProject object!");
        throw "Scope must be a MediniProject object";
    }

	// we need to place the mission profile into the right hidden package
	var tempFinder = Global.getFinder(scope);
	scope = tempFinder.findByType(Metamodel.projectmodel.PJPackage).and('name', 'MissionProfiles').first();
    if (!scope) {
        console.error("This project has no package for mission profiles!");
        throw "This project has no package for mission profiles";
    }
	
    // create one
    var op = new CreateMissionProfileModelOperation("", scope);
    op.execute(null, null);
    return op.getMissionProfile();
}

// helper
function __createFailureRateData(scope) {
    if (!scope) {
        console.error("Scope is undefined in create method!");
    }

	var failureRateData = FailureRateCatalogsFactory.eINSTANCE.create(FailureRateCatalogsPackage.Literals.FAILURE_RATE_DATA);
	// we create decisions here already
	var decisions = MExpressionsFactory.eINSTANCE.create(MExpressionsPackage.Literals.DECISIONS);
	failureRateData.decision = decisions;
	
	var feature = Metamodel.safetyModel.Failable.failureRateData;
	MediniModelModificationUtil.setValueOfFeature(scope, feature, failureRateData);
 
    return failureRateData;
}

// helper
function __createFRVariable(scope) {
    if (!scope) {
        console.error("Scope is undefined in create method!");
    }

	var failureRateData = scope.failureRateData;
	if (failureRateData == null) {
		failureRateData = FailureRateCatalogsFactory.eINSTANCE.create(FailureRateCatalogsPackage.Literals.FAILURE_RATE_DATA);
	    var feature = Metamodel.safetyModel.Failable.failureRateData;
	    MediniModelModificationUtil.setValueOfFeature(scope, feature, failureRateData);
	}

	var newVariable = FailureRateCatalogsFactory.eINSTANCE.create(FailureRateCatalogsPackage.Literals.FR_VARIABLE);
	newVariable.name = "new_variable"; // at least set a name
	newVariable.valueAsString= "0.0"; // at least set initial value
	
    var feature2 = Metamodel.safetyModel.IFailureRateData.userVariables;
    MediniModelModificationUtil.addValueOfFeature(failureRateData, feature2, newVariable);
 
    return newVariable;
}

/**
 * Object Factory()
 * @constructor
 * @since 3.1.0
 * @stability 1 - Experimental
 */
function Factory(){}
Factory.prototype = new Object();
Factory.ignoreDoubleTraces = false;
Factory.ignoreDoubleSafetyReqRelations = false;
Factory.ignoreDoubleSysMLDependencies = false;
Factory.ignoreDoubleSysMLConnectors = false;
Factory.ignoreNullScopes = false;
 
// after a certain version (e.g. 2000 == 20.0.0, 340 = 3.4.0)
Factory.isV310OrLater = (__tool_version_number && __tool_version_number >= 310);
Factory.isV340OrLater = (__tool_version_number && __tool_version_number >= 340);
Factory.isV2000OrLater = (__tool_version_number && __tool_version_number >= 2000);
Factory.isV2110OrLater = (__tool_version_number && __tool_version_number >= 2100);
// Note: __tool_version_object was introduced with 21.2.0 and __tool_version_number frozen at 2120
Factory.isV2120OrLater = "__tool_version_object" in this;
Factory.isV2210OrLater = Factory.isV2120OrLater && __tool_version_object.major >= 22;

// before a certain version
Factory.isBeforeV1930 = (__tool_version_number && __tool_version_number < 1930); 

// version specific bindings
if (Factory.isV2120OrLater) {
	var AddSecurityGoalOperation = bind("de.ikv.analyze.core", "de.ikv.analyze.core.operations.AddSecurityGoalOperation", false);
}

var ConnectorUtil = undefined;
if (Factory.isV2210OrLater) {
    // 22.1 code
    ConnectorUtil = bind("de.ikv.medini.metamodel.sysml", "de.ikv.medini.metamodel.sysml.util.SysMLConnectorUtil", false);
} else {
	// pre 22.1 code
	ConnectorUtil = bind("de.ikv.medini.uml", "de.ikv.medini.uml.util.ConnectorUtil", false);
}

/**
 * Creates an instance of the given type in the given scope.
 * 
 * @memberOf Factory
 * @param {Object}
 *            scope
 * @param {EClass}
 *            type
 * @returns {Object}
 * @static
 * @see Factory
 * @since 3.1.0
 * @stability 1 - Experimental
 */ 
 
Factory.createElement = function (scope, type, context) {
    var collectionType;
    if (!scope && !this.ignoreNullScopes) {
        throw "missing mandatory scope argument";
    }
    if (!type) {
        throw "missing mandatory type argument";
    }
 
    // SG and SR
    if (type == Metamodel.safetygoals.SafetyRequirementsModel) {
        return __createRequirementsModel(scope);
    }
    if (type == Metamodel.safetygoals.SafetyRequirement) {
        return __createSafetyRequirement(scope);
    }
    if (type == Metamodel.safetygoals.SafetyGoal) {
        return __createSafetyGoal(scope);
    }
 
    // SYSML
    if (type == Metamodel.sysml.SysMLPart) {
        return __createPart(scope);
    }
    if (type == Metamodel.sysml.SysMLActivity) {
        return __createActivity(scope);
    }
    if (type == Metamodel.sysml.SysMLAction) {
        return __createAction(scope);
    }
    if (type == Metamodel.sysml.SysMLBlock) {
        return __createBlock(scope);
    }
    if (type == Metamodel.sysml.SysMLPort || type == Metamodel.sysml.SysMLFlowPort) {
        return __createPort(scope);
    }
    if (type == Metamodel.sysml.SysMLPortUsage || type == Metamodel.sysml.SysMLFlowPortUsage) {
        return __createPortUsage(scope);
    }
    if (type == Metamodel.sysml.SysMLContainerPackage) {
    	if (scope instanceof Metamodel.projectmodel.PJScope) {
            return __createSysMLModel(scope);
    	} else {
    		return __createContainerPackage(scope);
    	}
    }
    // TODO This will create Stakeholders always!
	if (this.isV2000OrLater) {
	    if (type == Metamodel.sysml.SysMLActor) {
	        return __createActor(scope);
	    }
	}
	if (this.isV2120OrLater) {
	    if (type == Metamodel.sysml.SysMLValueProperty) {
	        return __createValueProperty(scope);
	    }
	}
	
    // SAFETY
    if (type == Metamodel.safetyModel.MeasureGroup) {
        return __createMeasureGroup(scope);
    }
    if (type == Metamodel.safetyModel.FailureMode) {
        return __createFailureMode(scope);
    }
    if (type == Metamodel.safetyModel.Malfunction) {
        return __createMalfunction(scope);
    }
    if (type == Metamodel.safetyModel.Hazard) {
        return __createHazard(scope);
    }
    if (type == Metamodel.safetyModel.Error) {
        return __createError(scope);
    }
    if (type == Metamodel.safetyModel.Measure) {
        return __createMeasure(scope);
    }
    if (type == Metamodel.safetyModel.FailureCollection) {
        collectionType = context;
        return __createFailureCollection(scope, collectionType);
    }
    // since 2017-09-13
    if (type == Metamodel.safetyModel.MeasureCatalog) {
        collectionType = context;
        return __createMeasureCatalog(scope, collectionType);
    }
    // since 2017-09-13
    if (type == Metamodel.safetyModel.SafetyMechanism) {
        return __createSafetyMechanism(scope);
    }
	if (this.isV2000OrLater) {
	    if (type == Metamodel.safetyModel.WeaknessCollection) {
            collectionType = context;
	        return __createWeaknessCollection(scope, collectionType);
	    }
	    if (type == Metamodel.safetyModel.TriggerCollection) {
            collectionType = context;
            return __createTriggerCollection(scope, collectionType);
	    }
	    if (type == Metamodel.safetyModel.Limitation) {
	        return __createLimitation(scope);
	    }
	    if (type == Metamodel.safetyModel.TriggeringCondition) {
	        return __createTriggeringCondition(scope);
	    }
	    if (type == Metamodel.security.Vulnerability) {
	        return __createVulnerability(scope);
	    }
	    if (type == Metamodel.security.Attack) {
	        return __createAttack(scope);
	    }
	    if (type == Metamodel.security.Threat) {
	        return __createThreat(scope);
	    }
	    if (type == Metamodel.tara.ThreatAssessmentModel) {
	        return __createThreatAssessmentModel(scope);
	    }
	    if (type == Metamodel.tara.ThreatEvent) {
	        return __createThreatEvent(scope);
	    }
	    // XXX AttackTree was missing in Beta version - workaround with String
	    if (type == "AttackTree") {
	        return __createAttackTree(scope);
	    }
	}
	if (this.isV2110OrLater) {
	    // AttackPath was introduced with 21 R1
        if (type == Metamodel.attacktree.AttackPathModel) {
            return __createAttackPathModel();
        }
	}
	if (this.isV2120OrLater) {
	    // SecurityGoal was introduced with 21 R2
        if (type == Metamodel.safetygoals.SecurityGoal) {
            return __createSecurityGoal(scope);
        }
	}
	if (this.isV2210OrLater) {
	    if (type == Metamodel.security.DamageScenario) {
	        return __createDamageScenario(scope);
	    }
	    if (type == Metamodel.safetyModel.SystemEffectCollection) {
            collectionType = context;
	        return __createSystemEffectCollection(scope, collectionType);
	    }
	    if (type == "DCMetricsParametersBuilder") {
	        return __createDCMetricsParametersBuilder(scope);
	    }
        if (type == Metamodel.attacktree.AttackTree) {
	        return __createAttackTree(scope);
	    }
	}
    
    // FMEA
    if (type == Metamodel.FMEA.TakenAction) {
        return __createTakenAction(scope);
    }
    if (type == Metamodel.FMEA.RecommendedAction) {
        return __createRecommendedAction(scope);
    }
    if (type == Metamodel.FMEA.CurrentDesignControl) {
        return __createCurrentDesignControl(scope);
    }
	if (type == Metamodel.FMEA.FMEAWorksheet) {
		return __createFMEAWorksheet(scope);
	}
	if (type == Metamodel.dc.DCWorksheet) {
		return __createDCWorksheet(scope);
	}
	if (type == Metamodel.FMEA.Component) {
		return __createComponentEntry(scope);
	}
	if (type == Metamodel.FMEA.PlainFailureMode) {
		return __createPlainFailureMode(scope);
	}
	if (type == Metamodel.FMEA.FailureEffect) {
		return __createFailureEffect(scope);
	}
 
    // DC
    if (type == Metamodel.dc.DCFailureModeEntry) {
        return __createDCFailureModeEntry(scope);
    }
 
    // HARA
    if (type == Metamodel.hazard.PlainItem) {
        return __createItemModel(scope);
    }
    if (type == Metamodel.hazard.HazardousEvent) {
        return __createHazardousEvent(scope);
    }
    if (type == Metamodel.hazard.HazardAnalysisModel) {
        return __createHazardAnalysisModel(scope);
    }
	if (this.isBeforeV1930) {
		// IsoAsil obsolete since 19.3.0
		if (type == Metamodel.hazard.IsoAsil) {
			return __createIsoAsil(scope);
		}
	}
	
	// HAZOP/Guideword
    if (type == Metamodel.hazop.HazopAnalysisModel) {
        return __createHazop(scope);
    }
    if (type == Metamodel.hazop.Guideword) {
        return __createGuideword(scope);
    }
    if (type == Metamodel.hazop.HazopEntry) {
        return __createHazopEntry(scope);
    }
	
    // FTA
    if (type == Metamodel.FTA.FTAModel) {
        return __createFTAModel(scope);
    }
 
    if (type == Metamodel.FTA.Event) {
        return __createFTAEvent(scope);
    }
 
    if (type == Metamodel.FTA.LogicalGate) {
        return __createFTALogicalGate(scope);
    }
 
    if (type == Metamodel.FTA.VotingGate) {
        return __createFTAVotingGate(scope);
    }
 
    if (type == Metamodel.FTA.TransferGate) {
        return __createFTATransferGate(scope);
    }
    
	if (this.isV340OrLater) {
	    if (type == Metamodel.FTA.ScriptedProbabilityModel) {
	        return __createCustomProbabilityModel(scope, type);
	    }
	    if (type == Metamodel.FTA.ExponentialProbabilityModel) {
	        return __createCustomProbabilityModel(scope, type);
	    }
	    if (type == Metamodel.FTA.NormalProbabilityModel) {
	        return __createCustomProbabilityModel(scope, type);
	    }
	    if (type == Metamodel.FTA.TimeIndependentProbabilityModel) {
	        return __createCustomProbabilityModel(scope, type);
	    }
	    if (type == Metamodel.FTA.WeibullProbabilityModel) {
	        return __createCustomProbabilityModel(scope, type);
	    }
	    if (type == Metamodel.FTA.RiskTimeProbabilityModel) {
	        return __createCustomProbabilityModel(scope, type);
	    }
	    if (type == Metamodel.FTA.EventNode) {
	        return __createFTAEventNode(scope);
	    }
	}

    // TODO This should be better placed to createRelation(...)
    if (type == Metamodel.FTA.Connection) {
        console.error("Wrong usage of factory method: create connections with createelation");
        return __createFTAConnection(scope);
    }
 
    // CHECKLIST
    if (type == Metamodel.checklist.Checklist) {
        return __createChecklist(scope, context);
    }
 
    if (type == Metamodel.checklist.ChecklistItem) {
        // this is abstract so we create static items always for convenience
        return __createChecklistItem(scope);
    }
    if (type == Metamodel.checklist.StaticChecklistItem) {
        return __createChecklistItem(scope);
    }
 
    // ProjectModel
    if (type == Metamodel.projectmodel.PJPackage) {
        return __createPackage(scope);
    }
    if (type == Metamodel.projectmodel.PJDiagram) {
        return __createDiagram(scope);
    }
 
    // Reliability (HACK! not in Metamodel yet with R19.0)
    if (type == "FRVariable") {
        return __createFRVariable(scope);
    }
	if (this.isV2000OrLater) {
	    if (type == Metamodel.failureratecatalogs.FailureRateData) {
	        return __createFailureRateData(scope);
	    }
	    if (type == Metamodel.failureratecatalogs.MissionProfile) {
	        return __createMissionProfile(scope);
	    }
	    if (type == Metamodel.failureratecatalogs.InternalWorkingCycle) {
	        return __createInternalWorkingCycle(scope);
	    }
	    if (type == Metamodel.failureratecatalogs.WorkingPhase) {
	        return __createWorkingPhase(scope);
	    }
	}
    
    // not supported
    throw "type is not supported";
};

Factory.createRelation = function (source, target, type) {
    if (!source) {
        throw "missing mandatory source argument";
    }
    if (!target) {
        throw "missing mandatory target argument";
    }
    if (!type) {
        throw "missing mandatory type argument";
    }
 
    // HARA
	if (this.isV2000OrLater) {
	    if (type == Metamodel.safetyModel.CausalityRelation) {
	        return __createCausalityRelation(source, target);
	    }
	}
    if (type == Metamodel.safetyModel.FailureRelation) {
        return __createFailureRelation(source, target);
    }
 
    // SG and SR
    if (type == Metamodel.safetygoals.SafetyReqRelation) {
        return __createContributesRelation(source, target, this.ignoreDoubleSafetyReqRelations);
    }
 
    // FTA
    if (type == Metamodel.FTA.Connection) {
        // the scope is always the FTA model
        return __createFTAConnection(source.model, source, target);
    }
 
    // SysML
    if (type == Metamodel.sysml.SysMLConnector) {
        return __createConnector(source, target, this.ignoreDoubleSysMLConnectors);
    }
    // must come first because its inherits from SysMLDependency
    if (type == Metamodel.sysml.SysMLAbstraction) {
        return __createAbstraction(source, target, this.ignoreDoubleSysMLDependencies);
    }
    if (type == Metamodel.sysml.SysMLDependency) {
        return __createDependency(source, target, this.ignoreDoubleSysMLDependencies);
    }

    // Trace (HACK for versions < 310!)
    if (type == "TRACE") {
        return __createTrace(source, target, this.ignoreDoubleTraces);
    }
	if (this.isV310OrLater) {
	    if (type == Metamodel.traceability.Trace) {
	        return __createTrace(source, target, this.ignoreDoubleTraces);
	    }
	}
	
    // not supported
    throw "type is not supported";
};


/**
 * Introduced to create entries in maps.
 * 
 * @memberOf Factory
 * @static
 * 
 * @param {Map}
 *            map - a map (key maps to multiple values)
 * @param {Object}
 *            key - the key
 * @param {Object}
 *            element - an element
 * 
 * @see Factory
 * @since 20.1.0
 * @stability 1 - Experimental
 */
Factory.createMapEntry = function(map, key, value) {
	// some paranoia
	if ("class" in map && ("" + map["class"]).indexOf("UnmodifiableEList") != -1) {
		throw "this map is not modifiable - seems that you lack some pragma in your script to change containment";
	}
	var list = map.get(key);
	if (list == undefined) {
		list = new BasicEList.FastCompare();
		list.add(value);
		map.put(key, list);
	} else {
		list.add(value);
	}
};
