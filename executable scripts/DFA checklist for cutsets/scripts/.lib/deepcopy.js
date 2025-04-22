// $EXPERIMENTAL$ $STRICT_MODE$ $ENHANCED_CONTAINMENT_ACCESS$ $DEBUG$ $ENHANCED_JAVA_ACCESS$
// load(".lib/factory.js"); // don't forget to load factory

// var copyAttributes = ["name", "note", "user_Description"];
// var copyMetamodel = Metamodel.checklist.StaticChecklistItem;
// var subItemsAttribute = "subItems";
function deepcopy(source, target, copyAttributes, copyMetamodel, subItemsAttribute) {
  var src = _read(source, copyAttributes, subItemsAttribute);
  var tgt = _write(
    target,
    copyMetamodel,
    src,
    copyAttributes,
    subItemsAttribute
  );
  return tgt;
}

function _read(source, attributes, subItemsAttribute) {
  var target = {};
  var attribute;
  var sourceSubItems;
  var subItem;
  var newSubItem;
  for (var i = 0; i < attributes.length; i++) {
    attribute = attributes[i];
    if (source[attribute]) {
      target[attribute] = source[attribute];
    }
    sourceSubItems = source[subItemsAttribute].toArray();
    target[subItemsAttribute] = [];
    for (var j = 0; j < sourceSubItems.length; j++) {
      subItem = source[subItemsAttribute][j];
      newSubItem = _read(subItem, attributes, subItemsAttribute);
      target[subItemsAttribute].push(newSubItem);
    }
  }
  return target;
}

function _write(scope, type, schema, attributes, subItemsAttribute) {
  var item = Factory.createElement(scope, type);
  var attribute;
  for (var i = 0; i < attributes.length; i++) {
    attribute = attributes[i];
    item[attribute] = schema[attribute];
  }
  for (var j = 0; j < schema[subItemsAttribute].length; j++) {
    var j_schema;
    j_schema = schema[subItemsAttribute][j];
    _write(item, type, j_schema, attributes, subItemsAttribute);
  }
  return item;
}
