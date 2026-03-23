//$EXPERIMENTAL$  $ENHANCED_CONTAINMENT_ACCESS$
/*
 * Copyright 2017-2026 ANSYS, Inc.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated 
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation the 
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to 
 * permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of 
 * the Software.
 * v2026-03-23 - KL initial version
 */
load(".lib/ui.js");
function main(){
  if (selection[0] instanceof Metamodel.sysml.SysMLPart == false){
    alert("Please select a SysML part.\n Aborted.");
    return;
  }
  var ports = [];
  var subElements = selection[0].the_owned_elements.toArray();
  for (var i = 0; i < subElements.length; i++){
    if (subElements[i] instanceof Metamodel.sysml.SysMLPortUsage == true) {
      ports.push(subElements[i]);
    }
  }

  if (ports.length == 0) {
    alert("No ports are found.\nAborted.");
    return;
  }
  var percent = (java.math.BigDecimal("100").divide(java.math.BigDecimal(ports.length.toString()) , 18, java.math.BigDecimal.ROUND_HALF_UP));
  var confirm_msg = ("Found " + ports.length + " ports, the ratio of each port will be " + 100/ports.length +"%. Do you want to proceed?");
  var user_confirm = alertWithAbortOption("CONFIRMATION", confirm_msg);
  if (user_confirm) { return;}
  for (var i = 0; i < ports.length; i++){
    ports[i].percentage = percent;
    ports[i].failureRateMode = "FROM_PARENT";
  }
  alert("Process completed. If the result is not as expected, please press CTRL + Z to undo it.");
}

main();

