// $EXPERIMENTAL$ $STRICT_MODE$ $ENHANCED_CONTAINMENT_ACCESS$ $ENHANCED_JAVA_ACCESS$
// load(".lib/factory.js");
load(".lib/ui.js");

var defaultInfos = ["ISO26262_asil", "name"];

function getElementsInfo(scope, infos) {
  if (!scope) {
    scope = selection[0];
  }
  if (!infos) {
    infos = defaultInfos;
  }
  var elements = scope.the_owned_elements.toArray();

  var element, attr, element_info;
  var elements_info = [];
  for (var i = 0; i < elements.length; i++) {
    element = elements[i];
    element_info = {};
    for (var j = 0; j < infos.length; j++) {
      attr = infos[j];
      var value = element[attr];
      if (value) {
        element_info[attr] = value;
      }
    }
    elements_info.push(element_info);
  }
  return elements_info;
}

function Matrix(r, c) {
  _newEmptyMatrix = function (r, c) {
    var matrix = Array(r);
    for (var i = 0; i < r; i++) {
      matrix[i] = Array(c);
    }
    return matrix;
  };
  mat = _newEmptyMatrix(r, c);

  this.getMatrix = function () {
    return mat;
  };
  this.getRowCount = function () {
    return mat.length;
  };
  this.getColCount = function () {
    return mat[0].length;
  };
  this.setRow = function (row, rowContent) {
    if (rowContent.length > mat[0].length) {
      content = rowContent.slice(0, mat[0].length);
      alert("Row content is too long. It will be truncated.");
    } else if (rowContent.length < mat[0].length) {
      content = rowContent.concat(Array(mat[0].length - rowContent.length));
    } else {
      content = rowContent;
    }
    mat[row] = content;
  };
  this.setCol = function (col, colContent) {
    if (colContent.length > mat.length) {
      content = colContent.slice(0, mat.length);
      alert("Column content is too long. It will be truncated.");
    } else if (colContent.length < mat.length) {
      content = colContent.concat(Array(mat.length - colContent.length));
    } else {
      content = colContent;
    }
    for (var i = 0; i < mat.length; i++) {
      mat[i][col] = content[i];
    }
  };
}

function newCsv(arr2d) {
  var csv = "";
  var rows = Array(arr2d.length);
  var row;

  for (var i = 0; i < arr2d.length; i++) {
    rows[i] = arr2d[i].join("\t");
  }
  return rows.join("\n");
}

function main(scope, rowHeaders, colHeaders) {
  if (!scope) {
    scope = selection[0];
  }
  if (!rowHeaders) {
    rowHeaders = defaultInfos;
  }
  if (!colHeaders) {
    colHeaders = defaultInfos;
  }
  var n_rowHeaders = rowHeaders.length;
  var n_colHeaders = colHeaders.length;
  var elementsInfo = getElementsInfo(scope);
  var n_elements = elementsInfo.length;
  var m = new Matrix(n_elements + n_rowHeaders, n_elements + n_colHeaders);

  var attr, value, rowContent, shiftedRowContent;
  for (var i = 0; i < n_rowHeaders; i++) {
    attr = rowHeaders[i];
    rowContent = Array(n_elements);
    for (var j = 0; j < n_elements; j++) {
      value = elementsInfo[j][attr];
      rowContent[j] = value;
    }
    shiftedRowContent = Array(n_colHeaders).concat(rowContent);
    m.setRow(i, shiftedRowContent);
  }
  var colContent, shiftedColContent;
  for (var i = 0; i < n_colHeaders; i++) {
    attr = colHeaders[i];
    colContent = Array(n_elements);
    for (var j = 0; j < n_elements; j++) {
      value = elementsInfo[j][attr];
      colContent[j] = value;
    }
    shiftedColContent = Array(n_rowHeaders).concat(colContent);
    m.setCol(i, shiftedColContent);
  }
  var csv = newCsv(m.getMatrix());
  return csv;
}

copyToClipboard(main());
alert("Elements matrix copied to clipboard.");
