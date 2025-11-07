/*
 * Copyright 2016-2024 ANSYS, Inc.
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
 * v2024-03-27 - fixed glitch in default y value in drop to diagram function
 * v2022-12-01 - added functions to drop elements to diagrams 
 * v2022-11-18 - added functions to show in internal/external browser 
 * v2020-11-22 - extended selectElement by check / uncheck all tool for multi selection 
 * v2020-05-20 - extended selectElement by description and pre-selection 
 * v2019-03-20 - fixed glitch in openDirectory, improved alertWithAbortOption 
 * v2018-08-28 - alertWithToggle and alertWithAbortOption added
 * v2018-07-17 - copyToClipboard and copyFromClipboard added
 * v2018-04-12 - openDirectory added
 * v2016-11-14 - initial version
 */
if (!bind) {
	throw "This script requires extended API";
}

// bind UI utility (NOT OFFICIAL API YET)
var UI = bind("de.ikv.medini.util.eclipse", "de.ikv.medini.util.eclipse.MediniUIUtil", false);
var AnalyzeUI = bind("de.ikv.analyze.ui.common", "de.ikv.analyze.ui.common.util.AnalyzeUIUtil", false);
var Dialogs = bind("de.ikv.medini.util.eclipse", "de.ikv.medini.util.eclipse.dialogs.MediniDialogUtil", false);
var SelectElementTreeDialog = bind("de.ikv.medini.cockpit.ui", "de.ikv.medini.cockpit.ui.dialogs.SelectModelElementTreeDialog", false);
var SWT = bind("org.eclipse.swt", "org.eclipse.swt.SWT", false);
var SWTPoint = bind("org.eclipse.swt", "org.eclipse.swt.graphics.Point", false);
var SWTButton = bind("org.eclipse.swt", "org.eclipse.swt.widgets.Button", false);
var DirectoryDialog = bind("org.eclipse.swt", "org.eclipse.swt.widgets.DirectoryDialog", false);
var InputDialog = bind("org.eclipse.jface", "org.eclipse.jface.dialogs.InputDialog", false);
var StructuredSelection = bind("org.eclipse.jface", "org.eclipse.jface.viewers.StructuredSelection", false);
var ArrayTreeContentProvider = bind("de.ikv.medini.util.eclipse", "de.ikv.medini.util.eclipse.jface.viewers.ArrayTreeContentProvider", false);
var VanillaAction = bind("de.ikv.medini.util.eclipse", "de.ikv.medini.util.eclipse.jface.action.VanillaAction", false);
var WidgetUtil = bind("de.ikv.medini.util.swt", "de.ikv.medini.util.swt.widgets.WidgetUtil", false);
var ScopedPreferenceStore = bind("org.eclipse.ui.workbench", "org.eclipse.ui.preferences.ScopedPreferenceStore", false);
var InstanceScope = bind("org.eclipse.equinox.preferences", "org.eclipse.core.runtime.preferences.InstanceScope", false);
var BasicEList = bind("org.eclipse.emf.common", "org.eclipse.emf.common.util.BasicEList", false);

function openFile(extensions) {
	var fileName = undefined;
	UI.execute(function select(monitor) {
		var shell = UI.getWorkbenchWindowShell();
		fileName = Dialogs.openFileDialog(shell, SWT.OPEN, extensions);
	});
		
	if (fileName) {
		return new java.io.File(fileName);
	}
	return undefined;
}

/**
 * Open the directory dialog.
 * 
 * @param message
 *            {String} the dialog's message, which is a description of the
 *            purpose for which it was opened
 * @param initialPath
 *            {String} the path that the dialog will select initially
 * @returns {java.io.File} the selected path or undefined
 */
function openDirectory(message, initialPath) {
	var dirName = undefined;
	UI.execute(function select(monitor) {
		var shell = UI.getWorkbenchWindowShell();
		var dialog = new DirectoryDialog(shell);
		if (message) {
			dialog.setMessage(message);
		}
		if (initialPath) {
			dialog.setFilterPath(initialPath);
		}
		dirName = Dialogs.openDirectoryDialog(dialog);
	});
		
	if (dirName) {
		return new java.io.File(dirName.trim());
	}
	return undefined;
}

/**
 * Opens the editor for the given semantic element.
 * 
 * @param {EObject}
 *            semanticElement
 * @param {Number}
 *            delay the delay in milliseconds before the editor opens (optional)
 */
function openEditor(semanticElement, delay) {
	var openFunc = function open(monitor) {
		AnalyzeUI.INSTANCE.openEditorForSemanticElement(semanticElement, true,
				false, false, true);
	};
	
	if (delay != undefined) {
		UI.executeDelayed(delay, openFunc);
	} else {
		UI.executeNonBlocking(openFunc);
	}
}

/*
 * It is rather difficult to decide whether a given object 
 * is an array with Rhino.
 */
function isArray(object) {
	if (object == undefined) {
		return false;
	}
	if (typeof object != "object") {
		return false;
	}
	if (object.length == undefined) {
		return false;
	}
	if (typeof object.length != "number") {
		return false;
	}
	
	return true;
}

/**
 * Opens an element selection dialog, either single selection or multi-selection. 
 * An optional root element can be passed.
 * 
 * @param {String} title
 * @param {EClass} type
 * @param {Boolean} multiple
 * @param {Object} root
 * @param {String} description (optional)
 * @param {Array} preSelection (optional)
 * @returns a single object or an array of objects or undefined
 */
function selectElement(title, type, multiple, root, description, preSelection) {
	var selected = undefined;
	UI.execute(function select(monitor) {
		var shell = UI.getWorkbenchWindowShell();
		var dialog = new SelectElementTreeDialog(shell, title, type, multiple);
		AnalyzeUI.INSTANCE.preparate(dialog);
		dialog.setStyle(SelectElementTreeDialog.CHECKBOX);
		if (multiple) {
			dialog.setStyle(SelectElementTreeDialog.TOOLBAR_CHECK_ALL);
			dialog.setStyle(SelectElementTreeDialog.TOOLBAR_UNCHECK_ALL);
			dialog.setStyle(SelectElementTreeDialog.PROPAGATE_CHECKED_STATE);
		}
		// new since 05-2020
		if (description) {
			dialog.setDescription(description);
		}
		// new since 05-2020
		if (preSelection) {
			// the dialog only access EObject arrays or collections
			var list = new BasicEList();
			preSelection.forEach(function (p) { list.add(p); });
			dialog.setInitiallySelectedObjects(list);
		}
		// use global variable "project" as input if none was defined
		if (root == undefined) {
			root = finder.getProject();
		} else if (isArray(root)) {
			dialog.setTreeContentProvider(new ArrayTreeContentProvider());
			dialog.clearStyle(1 << 12); // <- filter does not work in this case
		}
		dialog.setTreeInput(root);
		var result = Dialogs.openDialog(dialog);
		
		if (result == 0) { // Window.OK = 0
			selected = dialog.getSelectedModelElements();
			if (!multiple) {
				selected = selected[0];
				// FIXME This should be normally done by the dialog already, why isn't?
				if (selected.prototype == Metamodel.projectmodel.PJProxyModel) {
					selected = selected.originalModel;
				}
			}
		}
	});
		
	return selected;
}

/*
 * Input filter which accepts all.
 */
function acceptAll(input) {
	return null;
}

function inputText(title, message, initialValue, validator) {
	var selected = undefined;
	if (validator == undefined) {
		validator = acceptAll;
	}
	UI.execute(function select(monitor) {
		var shell = UI.getWorkbenchWindowShell();
		var dialog = new InputDialog(shell, title, message, initialValue,
				validator);
		var result = dialog.open();
		if (result == 0) { // Window.OK = 0
			selected = dialog.getValue();
		}
	});

	return selected;
}

/**
 * Opens an option dialog with a message and buttons for each option.
 * 
 * @param {String} title
 * @param {String} message
 * @param [{String}] options an array of strings aka options
 * @returns the index of the selected option or -1 (cancel)
 */
function selectOption(title, message, buttons) {
	// API says: "can be called from any thread" but not true
	// TODO assert that buttons is an array
	var selected = -1;
	UI.execute(function select(monitor) {
		selected = UI.displayQuestion(title, message, buttons);
	});
	
	return selected;
}

function runHandler(handler, object, label) {
	// use a vanilla action to satisfy the handler
	var action = new VanillaAction(label);
	// we have to run in UI thread
	UI.execute(function run(monitor) {
		// simulate a selection
		handler.selectionChanged(action, new StructuredSelection(object));
		handler.run(action);
	});
}

function setHandlerSelection(handler, object, label) {
	// use a vanilla action to satisfy the handler
	var action = new VanillaAction(label ? label : "set selection");
	handler.selectionChanged(action, new StructuredSelection(object));
}

/**
 * Helper to fill the text into the system Clipboard.
 * 
 * @param {String}
 *            text to copy to the Clipboard
 * 
 */
function copyToClipboard(text) {
	var toolkit = java.awt.Toolkit.getDefaultToolkit();
	var clipboard = toolkit.getSystemClipboard();
	var transfer = new java.awt.datatransfer.StringSelection(text);
	clipboard.setContents(transfer, null);
}

/**
 * Helper to extract text from the system Clipboard.
 * 
 * @return {String} text if the Clipboard contains text, otherwise the result is
 *         undefined
 */
function copyFromClipboard() {
	var toolkit = java.awt.Toolkit.getDefaultToolkit();
	var clipboard = toolkit.getSystemClipboard();
	return clipboard.getData(java.awt.datatransfer.DataFlavor.stringFlavor);
}

/**
 * Opens a message dialog similar to "alert" but with a typical "Do not show
 * again" toggle.
 * 
 * @param {String}
 *            message
 * @param {Object}
 *            an optional object (map) that holds information on kind, title
 * @returns 0 (OK) or 1 (CANCEL)
 */
function alertWithToggle(message, options) {
	if (options == undefined) {
		options = {};
	}
	var kind = options["kind"];
	var title = options["title"];
	var toggleMessage = options["toggleMessage"];
	var bundleName = options["bundleName"];
	var key = options["key"];
	var style = options["style"];
	
	if (kind == undefined) {
		kind = 2; // INFO
	}
	if (title == undefined) {
		title = "Alert";
	}
	if (toggleMessage == undefined) {
		toggleMessage = "Do not show this message again";
	}
	if (bundleName == undefined) {
		bundleName = "de.ikv.medini.util.eclipse";
	}
	if (key == undefined) {
		key = message;
	}
	if (style == undefined) {
		style = SWT.NONE;
	}
		
	var store = new ScopedPreferenceStore(InstanceScope.INSTANCE, bundleName);
	var selected = undefined;
	UI.execute(function select(monitor) {
		var shell = UI.getWorkbenchWindowShell();
		selected = Dialogs.openDialogWithDontShowAgainToggle(kind, shell, title, message, toggleMessage, store, key, style);
		store.save();
	});
	
	return selected;
}

/**
 * Opens a message dialog similar to "alert" but allows the user to choose
 * whether or not to abort the program completely. Returns <code>true</code>
 * if "Abort" and <code>false</code> if "Continue" has been selected.
 * <strong>Note: It is up to the caller to evaluate this and abort the program,
 * if the user has opted so.</strong>
 * 
 * @param {String}
 *            title the dialog title
 * @param {String}
 *            message the message
 * @returns <code>false</code> if the user has selected to continue,
 *          <code>true</code> if the user has selected to abort
 */
function alertWithAbortOption(title, message) {
	var selected = selectOption(title, message , [ "Continue", "Abort" ]);
	if (selected == 1) {
		return true;
	} else {
		return false;
	}
}

/**
 * Opens a given object in the external browser. The following types are 
 * supported: java.io.File and string.
 * 
 * @param object URL string or File object
 */
function openInExternalBrowser(object) {
	if (object instanceof java.io.File) {
		object = object.toURL();
	}
	var url = '' + object; // make a string out of it
	AnalyzeUI.INSTANCE.openInExternalBrowser(url);
}

/**
 * Opens a given object in the internal browser. The following types are 
 * supported: java.io.File and string.
 * 
 * @param object URL string or File object
 * @param id optional unique id of this browser window, default is 'OpenInInternalBrowser'
 * @param name optional window name
 * @param name optional window tooltip
 */
function openInInternalBrowser(object, id, name, tooltip) {
	if (object instanceof java.io.File) {
		object = object.toURL();
	}
	var url = '' + object; // make a string out of it
	var AS_VIEW = 64; // 1 << 6
	var STATUS = 8; // 1 << 3
	var NAVIGATION_BAR = 4; // 1 << 2
	var style = AS_VIEW; // + STATUS + NAVIGATION_BAR;
	
	// MUST be executed in UI thread
	UI.execute(function select(monitor) {
		var /* IWorkbenchBrowserSupport */ support = UI.getWorkbench().getBrowserSupport();
		console.log("Internal available: {0}", support.internalWebBrowserAvailable);
		var /* IWebBrowser */ browser =
			support.createBrowser(style, id != null ? id : "OpenInInternalBrowser",
				name != null ? name : "Internal Browser", tooltip);
		browser.openURL(new java.net.URL(url));
	});	
}

/**
 * Drops objects on a given diagram using an offset edit part
 *
 * @param objectsBeingDropped
 *            an arrays of dropped objects
 * @param extendedData
 *            an optional map providing extended request data (may be <code>null</code>)
 * @param diagram
 *            the diagram onto which the objects have been dropped
 * @param x
 *            the location where the objects has been dropped
 * @param y
 *            the location where the objects has been dropped
 * @param operation
 *            the drop operation (2 = {@link DND#DROP_MOVE}, {1 = @link DND#DROP_COPY}, or {4 = @link DND#DROP_LINK}}
 */
function dropObjectsToDiagram(objectsBeingDropped, extendedData, /* PJDiagram */ diagram, x, y, /* int */ operation) {

	var OffscreenEditPartFactory = bind("org.eclipse.gmf.runtime.diagram.ui", "org.eclipse.gmf.runtime.diagram.ui.OffscreenEditPartFactory", false);
	var DropObjectsRequest = bind("org.eclipse.gmf.runtime.diagram.ui", "org.eclipse.gmf.runtime.diagram.ui.requests.DropObjectsRequest", false);
	var Point = bind("org.eclipse.draw2d", "org.eclipse.draw2d.geometry.Point", false);

	UI.execute(function select(monitor) {
		var shell = UI.getWorkbenchWindowShell();
		var /* EditPartViewer */ viewer =
			OffscreenEditPartFactory.getInstance().createDiagramEditPart(diagram.diagram, shell).getViewer();
	
		if (operation == undefined) {
			operation = 2;
		}
		if (x == undefined) {
			x = 50;
		}
		if (y == undefined) {
			y = 50;
		}
		var request = new DropObjectsRequest();
	
		request.setObjects(objectsBeingDropped);
		request.setRequiredDetail(operation);
		request.setAllowedDetail(operation);
		if (extendedData != null) {
			request.getExtendedData().putAll(extendedData);
		}
		/* Point */ var location = new Point(x, y);
		request.setLocation(location);
	
		/* EditPart */ targetEP = viewer.contents.getTargetEditPart(request);
		if (targetEP != null) {
			var command = targetEP.getCommand(request);
			if ((command != null) && command.canExecute()) {
				var stack = viewer.getDiagramEditDomain().getDiagramCommandStack();
				stack.execute(command);
				// flush pending UI events and asynchronous requests
				UI.flushEventQueue();
			}
		}
	});
}
