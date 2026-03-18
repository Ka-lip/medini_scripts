function main(){
  var ports = [];
  var subElements = selection[0].the_owned_elements.toArray();
  for (var i = 0; i < subElements.length; i++){
    if (subElements[i] instanceof Metamodel.sysml.SysMLPortUsage == true) {
      ports.push(subElements[i]);
    }
  }

  var percent = (java.math.BigDecimal("100").divide(java.math.BigDecimal(ports.length.toString()) , 18, java.math.BigDecimal.ROUND_HALF_UP));

  for (var i = 0; i < ports.length; i++){
    ports[i].percentage = percent;
    ports[i].failureRateMode = "FROM_PARENT";
  }
}

main();

