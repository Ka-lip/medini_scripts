//$EXPERIMENTAL$  $ENHANCED_CONTAINMENT_ACCESS$

/*
Usage:
  Select a package (yellow folder in the medini Model browser) and right click, execute "rbd".
  The script will create a checklist with a checklist item, and put all cutsets of RBD in the item.
  The availability of each cutset and the sum of the unavailability will be computed automatically, showing in the checklist.
  Note the following things.
    1. RBDs without a cutset will be ignored, since no information of unavailability.
    2. If a RBD has more than one cutset, the script will be interrupted, since the script doesn't know which cutset users want to use.  
*/

load(".lib/factory.js");
load(".lib/ui.js");


function getAllRbd(){
	var rbdFinder = Global.getFinder(selection[0]);
	var allRbd = rbdFinder.findByType(Metamodel.rbd.RBDAnalysisModel, true).toArray();	
	return allRbd; 
}

function createChecklist(){
	rbdChecklist = Factory.createElement(selection[0], Metamodel.checklist.Checklist);
	rbdChecklist.name = 'RBDs results';
	rbdChecklistItem = Factory.createElement(rbdChecklist, Metamodel.checklist.StaticChecklistItem);
	rbdChecklistItem.name = 'Unavailability of RBDs in this package';
}

function hasDuplicateCutset(arr){	
	for (var i = 0; i < arr.length; i++){
		for (var j = i+1; j < arr.length; j++){
			if (arr[i].analyzedNodeContainer == arr[j].analyzedNodeContainer){return arr[i].analyzedNodeContainer;}
		}
	}
	return false;
}

function main(){
	var applicableRbds = getAllRbd();
	var checkDuplicate = hasDuplicateCutset(applicableRbds);
	if (checkDuplicate){
		alert(checkDuplicate.name + ' has multiple cutsets. Please keep only one cutset for each RBD.');
		return checkDuplicate;
	}
	else{
		createChecklist();
		applicableRbds.forEach(function(i){rbdChecklistItem.artifacts.add(i)});	
		alert('Done.');
	}
}

main();