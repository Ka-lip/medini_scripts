/* 
 * Copyright (c) 2018-2021 ANSYS Inc.
 * All rights reserved.
 * 
 * THE NON STANDARD SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT
 * NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO
 * EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE NON STANDARD
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE NON STANDARD SOFTWARE.
 * 
 * v2021-08-20 - JM Fixed setNumber
 * v2020-08-26 - JM Disclose Cell class
 * v2020-03-04 - JM Pass file name to callback function "readOnly"
 * v2019-05-08 - JM Fixed another issue with callback scope when nesting in objects
 * v2018-11-15 - JM Added cleanupWorksheet()
 * v2018-10-15 - JM Fixed order of checks in collectRows and firstCellsEmpty 
 * v2018-09-12 - JM Fixed issue with callback scope of ExcelImporter
 * v2018-09-04 - JM Added several finder and filter methods (for row, column, header), verbose methods
 * v2018-01-07 - JM Initial version
 */
if (!bind) {
	throw "This script requires extended API";
}

// bind Excel library (NOT OFFICIAL API YET)
var ExcelDocument = bind("de.ikv.medini.docgen.openxml", "de.ikv.medini.docgen.openxml.document.excel.ExcelDocument", false);
var Cell = bind("de.ikv.medini.docgen.openxml", "de.ikv.medini.docgen.openxml.document.excel.Cell", false);
var CellAddress = bind("de.ikv.medini.docgen.openxml", "de.ikv.medini.docgen.openxml.document.excel.CellAddress", false);
var ExcelVerbose = false;

/*
 * Debug helper.
 */
function _V(m,a,b,c,d,e) {
	if (ExcelVerbose) {
		console.log(m,a,b,c,d,e);
	}
} 

function _A(a,b) {
	
	var addr = undefined;
	var name = undefined;
	
	if ((typeof a == "object") && (typeof b == "number")) {
		addr = cellAddress(a, b);
		name = a.getWorksheet().getName();
	} else if (typeof a == "object") {
		addr = a.getAddress();
		name = a.getRow().getWorksheet().getName();
	}
	if (!addr) {
		return "?";
	}
	
	return name + ":" + addr.toString();
}

/*
 * Trim helper
 */
function _T(t) {
	if (t) {
		var old = t;
		t = t.trim();
//		if (old.length() != t.length()) {
//			console.error("Text trimmed from ''{0}'' to ''{1}''", old, t);
//		}
	}
	// return null instead of ""
	if (t && t.length() == 0) {
		return null;
	}
	return t;
}

/*
 * Excel helper.
 */
function set(sheet, rowIndex, columnIndex, value) {
	var row = sheet.getOrCreateRow(rowIndex);
	var cell = row.getOrCreateCell(columnIndex);
	cell.setSharedStringValue(value);
	_V("Wrote string ''{0}'' to cell {1}", value, cell.getAddress());
}

/*
 * Excel helper.
 */
function setNumber(sheet, rowIndex, columnIndex, value) {
	var row = sheet.getOrCreateRow(rowIndex);
	var cell = row.getOrCreateCell(columnIndex);
	cell.setType(Cell.Type.NUMBER);
	cell.setNumberValue(value);
	_V("Wrote number ''{0}'' to cell {1}", value, cell.getAddress());
}

/*
 * Excel helper.
 */
function extractImageName(image, defaultValue) {
	try {
		uri = image.getPackagePart().getPartName().getURI();
		name = uri.getPath();
		lastSlash = name.lastIndexOf('/');
		if (lastSlash >= 0) {
			name = name.substring(lastSlash + 1);
		}
		return name;
	} catch (exception) {
		return defaultValue;
	}
}

/*
 * Excel helper.
 */
function getTextInCell(row, columnIndex, trim /* = true */) {
	if (trim == undefined) {
		trim = true;
	}
	var cell = row.getCell(columnIndex);
	if (!cell) {
		return undefined;
	}
	var text = cell.toString();
	if (trim) {
		text = _T(text);
	}
	return text;
}

/*
 * Excel helper.
 */
function getTextInCellOrAbove(row, columnIndex, trim /* = true */) {
	if (trim == undefined) {
		trim = true;
	}
	while (row) {
		var cell = row.getCell(columnIndex);
		if (cell && cell.toString() != null) {
			// _V("Row {0} has cell in column {1}: {2}", row.getRowIndex(), columnIndex, cell);
			var text = cell.toString();
			if (trim) {
				text = _T(text);
			}
			if (!text) {
				throw("BUG-E1");
			}
			return text;
		}
		// _V("Row {0} has no cell in column {1}, check above", row.getRowIndex(), columnIndex);
		row = row.getWorksheet().getRow(row.getRowIndex() - 1); 
	}
	
	return undefined;
}

/*
 * Excel helper to create a CellAddress from a row and a column index.
 */
function cellAddress(row, columnIndex) {
	if (typeof row == "number") {
		return new CellAddress(row, columnIndex).toString();
	}
	return new CellAddress(row.getRowIndex(), columnIndex); 
}

/*
 * Excel helper.
 */
function collectVisibleRows(ws, start, stopWhen) {
	return collectRows(ws, start, stopWhen, true);
}

/*
 * Excel helper.
 */
function collectRows(ws, start, stopWhen, onlyVisible) {
	_V("Start collecting rows, beginning with {0}...", start);
	var collectedRows = [];
	// Note: we cannot use ws.getRows() because it just returns *existing* rows
	var max = ws.getDimension().getBottomRight().getRow();
	for (var i = start; i <= max; i++) {
		// _V("Check row {0}...", i);
		var row = ws.getRow(i);
		if (row && onlyVisible && row.getHidden()) {
			_V("Ignore row {0} because its hidden", i);
			continue;
		}
		if (stopWhen && typeof(stopWhen) == 'function' && stopWhen(row)) {
			_V("Stopped in row {0}, collected {1} rows so far", i, collectedRows.length);
			break;
		}
		if (row == undefined) {
			_V("Ignore row at index {0} because it does not exist", i);
			continue;
		}

		var rowView = {
			handle : row,
			index : row.getRowIndex()
		};
		collectedRows.push(rowView);
	}	
	
	return collectedRows;
}

function first3CellsEmpty(row) {
	return firstCellsEmpty(row, 3);
}

function first5CellsEmpty(row) {
	return firstCellsEmpty(row, 5);
}

function firstCellsEmpty(row, number) {
	// the row might be undefined here, we treat it "all cells empty"
	if (!row) {
//		_V("Row is undefined and treated as 'empty'");
		return true;
	}
	var foundEmpty = 0;
	for (var c = 1; c <= number; c++) {
		var cell = row.getCell(c);
		var value = cell ? cell.getInterpretedValue() : undefined;
		if (!value || value == "") {
			foundEmpty = foundEmpty + 1;
			continue;
		}
	}
//	_V("Row {0} empty={1}, min={2}", row.getRowIndex(), foundEmpty, number);
	return foundEmpty >= number;
}

function findWorksheetByName(wb, name, message, max) {
	// assert that "ui.js" was imported
	if (typeof inputText != 'function') {
		throw "Library 'ui.js' was not imported but is required to interact with the user";
	}
	
	// extract all sheet names
	// let the user select a sheet
	var sheets = wb.getWorksheets();
	var names = [];
	var sheetsByName = {};
	sheets.forEach(function (s) {
		names.push(s.name);
		// use lower case sheet names
		sheetsByName[s.name.toLowerCase()] = s;
	});
	
	// handle the case there is no non-hidden or empty sheet
	if (names.length == 0) {
		throw "Workbook has no worksheets to import";
	}

	var sheet = undefined;
	while (!sheet) {
		name = inputText("Select Sheet", message, name, undefined);
		if (name == undefined) {
			return undefined;
		}
		
		sheet = sheetsByName[name.toLowerCase()];
	}
	return sheet;
}

/**
 * Finds a given column by it name. Name could be a string that must match 100%
 * or a regular expression.
 * 
 * @param row
 *            {Row} the row to search through
 * @param name
 *            {String} the name or regular expression
 * @param max
 *            {Number} the maximum number of columns to search
 * @returns the column index of undefined
 */
function findColumnByName(row, name, max) {
	var cells = row.getCells();
	for (var c = 0; c < cells.length; c++) {
		var cell = cells[c];
		var value = cell.getInterpretedValue();
		if (!value) {
			continue;
		}
//		_V("Checking value {0}...", value);
		if (value == name || value.matches(name)) {
			return cell.columnIndex;
		}
	}
	
	return -1;
}

function findHeaderRow(ws, hints, max) {
	// note: we use ws.getRows() because we anyhow just search existing rows (first row may start at > 1)
	var rows = ws.getRows();
	for (var r = 0; r < rows.length; r++) {
		var row = rows[r];
//		_V("Checking row {0}...", row.rowIndex);
		
		// above threshold?
		if (row.getRowIndex() > max) {
			return undefined;
		}
		
		// now check all hints
		var hits = 0;
		var cells = row.getCells();
		for (var c = 0; c < cells.length; c++) {
			var cell = cells[c];
			var value = cell.getInterpretedValue();
			if (!value) {
				continue;
			}
//			_V("Checking value {0}...", value);
			if (hints.indexOf("" + value) != -1) {
				hits = hits + 1;
			}
		}
		
//		_V("Hits in row {0}: {1}", row.rowIndex, hits);
		if (hits == hints.length) {
			return row;
		}
	}
	
	return undefined;
}


ExcelImporter.prototype = {
		
		// default first row with data (1 based!)
		DEFAULT_START_ROW : 1,
		
		callback : undefined,
		
		assertCallback : function () {
			// TODO Assert that the callback object fits the minimum 
		},
		
		/*
		 * Helper: returns true if the given sheet is empty.
		 */
		isWorksheetEmpty : function (sheet) {
			var dim = sheet.getDimension();
			var br = dim.getBottomRight();
			
			if (br.row > 1) {
				return false;
			}
			if (br.column > 1) {
				return false;
			}
			
			// obviously empty
			return true;
		}, 

		/*
		 * Helper: cleans the given sheet, basically by removing all rows.
		 * Note: isWorksheetEmpty does NOT work after this call.
		 */
		cleanupWorksheet : function (sheet) {
			_V("Cleanup sheet {0} with dim {1} and {2} rows...", sheet.name, sheet.dimension, sheet.rows.length);
			var rows = sheet.getRows();
			rows.forEach(function (r) {
				r.detach();
			});
			return rows.length;
		},
		
		run : function () {
			// 1. get input file
			var file = undefined;
			if (this.callback["getFile"]) {
				file = this.callback["getFile"].call(this.callback);
			} else if (this.callback["getFileName"]) {
				var fileName = this.callback["getFileName"].call(this.callback);
				file = new java.io.File(fileName);
			} else if (typeof __excel_importer_file__ != 'undefined') {
				file = __excel_importer_file__;
			} else {
				// assert that "ui.js" was imported
				if (typeof openFile != 'function') {
					throw "Library 'ui.js' was not imported but is required to interact with the user";
				}
				file = openFile([ "*.xlsx", "*.xlsm" ]);
				if (!file) {
					return undefined;
				}
			}
			
			if (!file) {
				throw "A file is missing or was not correctly defined.";
			}
			
			// 2. assert file exists
			if (!file.exists()) {
				throw "The file '" + file + "' does not exists or cannot be read.";
			}
			
			// open read-only? pass the file as argument
			var readOnly = true;
			if (this.callback["readOnly"]) {
				readOnly = this.callback["readOnly"].call(this.callback, file);
			}
			
			_V("Importing from {0}", file);
			
			progressMonitor.setTaskName("Loading data from Excel...");
			var document = ExcelDocument.open(file, readOnly);
			try {
				// callback
				if (this.callback["afterOpen"]) {
					this.callback["afterOpen"].call(this.callback, document);
				}
				
				var wb = document.getWorkbook();

				var sheet = undefined; 
				if (this.callback["getSheet"]) {
					sheet = this.callback["getSheet"].call(this.callback, wb);
				}
				else if (this.callback["getSheetName"]) {
					var sheetName = this.callback["getSheetName"].call(this.callback, wb);
					sheet = wb.getWorksheet(sheetName);
					if (!sheet) {
						throw "Sheet '" + sheetName + "' is missing in the Workbook";
					}
				} 
				else if (typeof __excel_importer_sheet_name__ != 'undefined') {
					sheetName = __excel_importer_sheet_name__;
					sheet = wb.getWorksheet(sheetName);
					if (!sheet) {
						throw "Sheet '" + sheetName + "' is missing in the Workbook";
					}
				}
				else {
					// ignore empty sheets?
					var ignoreEmpty = false;
					if (this.callback["ignoreEmptySheets"]) {
						ignoreEmpty = this.callback["ignoreEmptySheets"].call(this.callback);
					}

					// let the user select a sheet
					var sheets = wb.getWorksheets();
					var names = [];
					sheets.forEach(function (s) {
						// do not list hidden sheets
						if (s.isHidden()) {
							return;
						}
						// ignore if sheet is empty and callback wants it
						if (ignoreEmpty && this.isWorksheetEmpty(s)) {
							return;
						}
						names.push(s.name);
					}, this);
					
					// handle the case there is no non-hidden or empty sheet
					if (names.length == 0) {
						throw "Workbook has no worksheets to import";
					}
					
					var index = 0;
					if (names.length > 1) {
						// assert that "ui.js" was imported
						if (typeof selectOption != 'function') {
							throw "Library 'ui.js' was not imported but is required to interact with the user";
						}
						index = selectOption("Select Worksheet", "Please select the worksheet you want to import", names);
					}
					if (index == -1) {
						return undefined;
					}
					sheet = wb.getWorksheet(names[index]);
					if (!sheet) {
						throw "Sheet '" + names[index] + "' is missing in the Workbook";
					}
				}
				
				
				if (!sheet) {
					throw "Cannot open sheet in the Workbook";
				}

				// callback
				if (this.callback["beforeHandle"]) {
					this.callback["beforeHandle"].call(this.callback, sheet);
				}
				
				progressMonitor.setTaskName("Checking rows...");
				var startRow = this.DEFAULT_START_ROW;
				if (this.callback["getStartRowIndex"]) {
					startRow = this.callback["getStartRowIndex"].call(this.callback);
				}
				
				// start row is 1 based, "collectRows" as well
				var rows = collectRows(sheet, startRow, this.callback["isStopRow"], false);
				// note: we do NOT use foreach but iterate instead - otherwise we cannot easily access this.callback
				for (var i = 0; i < rows.length; i++) {
					var row = rows[i];
					// callback
					if (this.callback["handleRow"]) {
						this.callback["handleRow"].call(this.callback, row.index, row.handle);
					}
					// TODO Can we do more?
				}

				// callback
				if (this.callback["afterHandle"]) {
					this.callback["afterHandle"].call(this.callback, sheet);
				}
				
			} finally {
				// callback
				if (this.callback["beforeClose"]) {
					this.callback["beforeClose"].call(this.callback, document);
				}
				
				// make sure we close the file, otherwise its locked by the process.
				progressMonitor.setTaskName("Closing Excel...");
				document.close();
			}
			
			return true;
		}
};

/**
 * Constructor.
 * @param callback
 */
function ExcelImporter(callback) {
	this.callback = callback;
	this.assertCallback();
}