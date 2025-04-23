// $EXPERIMENTAL$ $STRICT_MODE$ $ENHANCED_CONTAINMENT_ACCESS$ $DEBUG$ $ENHANCED_JAVA_ACCESS$
// load(".lib/factory.js"); // don't forget to load factory

function _deepCopyGetAttributes(type) {
  var returAttribute = {};
  if (type == Metamodel.checklist.StaticChecklistItem) {
    returAttribute = {
      copyAttributes: ["name", "note", "user_Description"],
      subItemsAttribute: "subItems",
    };
  }
  return returAttribute;
}

function deepcopy(
  source,
  target,
  copyMetamodel,
  copyAttributes,
  subItemsAttribute
) {
  if (!copyMetamodel) {
    copyMetamodel = Object.getPrototypeOf(source);
  }
  if (!copyAttributes) {
    copyAttributes = _deepCopyGetAttributes(
      Object.getPrototypeOf(source)
    ).copyAttributes;
  }
  if (!subItemsAttribute) {
    subItemsAttribute = _deepCopyGetAttributes(
      Object.getPrototypeOf(source)
    ).subItemsAttribute;
  }

  var src = _deepCopyRead(source, copyAttributes, subItemsAttribute);

  var tgt = _deepCopyWrite(
    target,
    copyMetamodel,
    src,
    copyAttributes,
    subItemsAttribute
  );
  return tgt;
}

function _deepCopyRead(source, attributes, subItemsAttribute) {
  if (!attributes) {
    attributes = _deepCopyGetAttributes(
      Object.getPrototypeOf(source)
    ).copyAttributes;
  }
  if (!subItemsAttribute) {
    subItemsAttribute = _deepCopyGetAttributes(
      Object.getPrototypeOf(source)
    ).subItemsAttribute;
  }
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
      newSubItem = _deepCopyRead(subItem, attributes, subItemsAttribute);
      target[subItemsAttribute].push(newSubItem);
    }
  }
  return target;
}

function _deepCopyWrite(scope, type, schema, attributes, subItemsAttribute) {
  if (!attributes) {
    attributes = _deepCopyGetAttributes(
      Object.getPrototypeOf(source)
    ).copyAttributes;
  }
  if (!subItemsAttribute) {
    subItemsAttribute = _deepCopyGetAttributes(
      Object.getPrototypeOf(source)
    ).subItemsAttribute;
  }

  var item = Factory.createElement(scope, type);
  var attribute;
  for (var i = 0; i < attributes.length; i++) {
    attribute = attributes[i];
    item[attribute] = schema[attribute];
  }
  for (var j = 0; j < schema[subItemsAttribute].length; j++) {
    var j_schema;
    j_schema = schema[subItemsAttribute][j];
    _deepCopyWrite(item, type, j_schema, attributes, subItemsAttribute);
  }
  return item;
}
