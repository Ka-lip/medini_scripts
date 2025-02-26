//$EXPERIMENTAL$  $ENHANCED_CONTAINMENT_ACCESS$
load('./.lib/factory.js');

function create_pacakge(package_name, contents, scope){
    /* reference of contents (project domains: ISO26262):
    Diagnostic Coverage: 'DC'
    FMEA Worksheets: 'FMEAWorksheets'
    FTA Models: 'FTAModels'
    Hazard Analysis and Risk Assessment: 'HazardAnalysisModels'
    Item Definition: 'ItemDefinitions'
    Safety Goals and Requirements: 'SafetyGoalModels'
    System Design: 'SystemArchitectureModels'
    System Weakness Anaysis: 'SystemWeaknessAnalysis'
    */
    if (!scope){var scope = selection[0];}
    var item = Factory.createElement(scope, Metamodel.projectmodel.PJPackage);
    item.name = package_name;
    item.eAnnotations[0].details[0].value = contents;
}

// create_pacakge('hello', 'SafetyGoalModels');
