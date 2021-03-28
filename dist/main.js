/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _css_realitybox_editor_css__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./css/realitybox-editor.css */ \"./src/css/realitybox-editor.css\");\n/* harmony import */ var _js_realitybox_editor__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./js/realitybox-editor */ \"./src/js/realitybox-editor.js\");\n/* harmony import */ var _js_realitybox_editor__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_js_realitybox_editor__WEBPACK_IMPORTED_MODULE_1__);\n\n // Load library\n\nH5PEditor = H5PEditor || {};\nH5PEditor.RealityBox = (_js_realitybox_editor__WEBPACK_IMPORTED_MODULE_1___default());\n\n//# sourceURL=webpack://H5PEditor.RealityBox/./src/index.js?");

/***/ }),

/***/ "./src/js/realitybox-editor.js":
/*!*************************************!*\
  !*** ./src/js/realitybox-editor.js ***!
  \*************************************/
/***/ (() => {

eval("H5PEditor.widgets.realitybox = H5PEditor.RealityBox = function ($) {\n  /**\r\n   * Constructor function\r\n   * @extends H5P.DragNBar.FormManager\r\n   * @param {Object} parent - Parent object\r\n   * @param {Object} field - Field object\r\n   * @param {Object} params - Config object for RealityBox\r\n   * @param {function(field: Object, value: Object)} - Callback function to set widgets field value\r\n   */\n  function RealityBoxEditor(parent, field, params, setValue) {\n    H5P.DragNBar.FormManager.call(this, parent.parent, {\n      doneButtonLabel: 'Done',\n      deleteButtonLabel: 'Delete',\n      expandBreadcrumbButtonLabel: 'Enter fullscreen',\n      collapseBreadcrumbButtonLabel: 'Exit fullscreen'\n    }, 'realitybox');\n    this.field = field;\n    this.parent = parent;\n    this.setValue = setValue; // get model params and set model\n\n    this.findField(this.field.model, field => {\n      if (field.field.type !== 'file') {\n        throw 'No model field.';\n      }\n\n      if (field.params !== undefined) {\n        this.setModel(field.params);\n      }\n\n      field.changes.push(() => {\n        this.setModel(field.params);\n      });\n    });\n    this.params = $.extend({\n      annotations: []\n    }, params);\n    this.setValue(field, this.params);\n    this.children = [];\n    this.passReadies = true;\n    parent.ready(() => {\n      this.passReadies = false;\n      this.setActive();\n    });\n    this.currentTabIndex = 0;\n    parent.on('stepChanged', event => {\n      this.currentTabIndex = event.data.id;\n    });\n  } // extends H5P.DragNBar.FormManager\n\n\n  RealityBoxEditor.prototype = Object.create(H5P.DragNBar.FormManager.prototype);\n  RealityBoxEditor.prototype.constructor = RealityBoxEditor;\n  /**\r\n   * Invokes callback with H5P field object of given path\r\n   * @param {string} path - Path of field\r\n   * @param {function(field: Object)} callback - Callback function\r\n   */\n\n  RealityBoxEditor.prototype.findField = function (path, callback) {\n    this.parent.ready(() => {\n      const field = H5PEditor.findField(path, this.parent);\n\n      if (!field) {\n        throw 'Field ' + path + 'not found';\n      }\n\n      callback(field);\n    });\n  };\n  /**\r\n   * Set model\r\n   * @param {Object} file - H5P file object\r\n   */\n\n\n  RealityBoxEditor.prototype.setModel = function (file) {\n    console.log(file);\n    this.model = file;\n    this.deleteBabylonBox();\n  };\n  /**\r\n   * Creates BabylonBox instance in widget\r\n   */\n\n\n  RealityBoxEditor.prototype.setActive = function () {\n    if (this.babylonBox !== undefined) {\n      return;\n    }\n\n    if (this.model === undefined) {\n      this.$editor.html('No model file uploaded.');\n      return;\n    }\n\n    let modelUrl = H5P.getPath(this.model.path, H5PEditor.contentId);\n    let params = $.extend({}, {\n      modelUrl\n    }, this.params);\n    this.babylonBox = H5P.newRunnable({\n      library: 'H5P.BabylonBox 1.0',\n      params\n    }, H5PEditor.contentId, undefined, undefined, {\n      parent: this\n    });\n    const annotations = this.babylonBox.getAnnotations();\n\n    for (let i = 0; i < annotations.length; i++) {\n      this.processAnnotation(annotations[i], this.params.annotations[i]);\n    }\n\n    this.babylonBox.on('dblClick', ({\n      data\n    }) => {\n      this.addAnnotation(data.position, data.normalRef);\n    });\n    this.$editor.empty();\n    this.babylonBox.attach(this.$editor);\n  };\n  /**\r\n   * Alert message\r\n   * @param {string} message - Message to show\r\n   */\n\n\n  RealityBoxEditor.prototype.displayMessage = function (message) {\n    alert(message);\n  };\n  /**\r\n   * Creates form for edit annotation content\r\n   * @param {Annotation} annotation - Associated annotation\r\n   * @param {Object} parameters - Parameters of annotations content\r\n   */\n\n\n  RealityBoxEditor.prototype.createAnnotationForm = function (annotation, parameters) {\n    const $semanticFields = $('<div class=\"h5p-dialog-inner-semantics\" />');\n    annotation.$form = $semanticFields;\n    const annotations = findField('annotations', this.field.fields);\n    const annotationFields = H5PEditor.$.extend(true, [], annotations.field.fields);\n    hideFields(annotationFields, ['position', 'normalRef']);\n    H5PEditor.processSemanticsChunk(annotationFields, parameters, $semanticFields, this); // hide selector for choosing library\n\n    var pos = annotationFields.map(function (field) {\n      return field.type;\n    }).indexOf('library');\n\n    if (pos > -1) {\n      this.children[pos].hide();\n    }\n  };\n  /**\r\n   * Processes annotation\r\n   * @param {Annotation} annotation - Annotation to process\r\n   * @param {Object} parameters - Parameters of annotations content\r\n   */\n\n\n  RealityBoxEditor.prototype.processAnnotation = function (annotation, parameters) {\n    this.createAnnotationForm(annotation, parameters);\n    annotation.children = this.children;\n    this.children = undefined;\n    this.newAnnotation(annotation);\n  };\n  /**\r\n   * Gets H5P content field of specific annotation\r\n   * @param {Annotation} annotation\r\n   * @return {Object} - H5P field for annotations content\r\n   */\n\n\n  RealityBoxEditor.prototype.getAnnotationFields = function (annotation) {\n    return annotation.children.reduce(function (prev, child) {\n      if (child.field && child.field.name) {\n        prev[child.field.name] = child;\n      }\n\n      return prev;\n    }, {});\n  };\n  /**\r\n   * Opens form for a specific annotation\r\n   * @param {Annotation} annotation\r\n   */\n\n\n  RealityBoxEditor.prototype.openAnnotationModal = function (annotation) {\n    const formremoveHandler = () => {\n      if (!confirm('Would you like to remove this annotation?')) {\n        return;\n      }\n\n      this.removeAnnotation(annotation);\n    };\n\n    this.on('formremove', formremoveHandler);\n\n    const formdoneHandler = () => {\n      for (child of annotation.children) {\n        child.validate();\n      }\n    };\n\n    this.on('formdone', formdoneHandler);\n\n    const formcloseHandler = () => {\n      this.off('formremove', formremoveHandler);\n      this.off('formdone', formdoneHandler);\n      this.off('formclose', formcloseHandler);\n    };\n\n    this.on('formclose', formcloseHandler);\n    const libraryField = H5PEditor.findField('content', annotation);\n    this.openForm(libraryField, annotation.$form[0], 'h5p-realitybox-editor');\n    annotation.trigger('openEditDialog');\n  };\n  /**\r\n   * Opens form for new created annotation\r\n   * @param {Annotation} annotation - Newly created annotation\r\n   */\n\n\n  RealityBoxEditor.prototype.newAnnotation = function (annotation) {\n    this.openAnnotationModal(annotation);\n  };\n  /**\r\n   * Removes annotation\r\n   * @param {Annotation} annotation - Annotation to remove\r\n   */\n\n\n  RealityBoxEditor.prototype.removeAnnotation = function (annotation) {\n    this.babylonBox.removeAnnotation(annotation);\n    this.params.annotations.splice(annotation.arrayPosition, 1);\n    H5PEditor.removeChildren(annotation.children);\n  };\n  /**\r\n   * Adds annotation\r\n   * @param {Object} positionObj - Position where new annotation should created\r\n   * @param {number} positionObj.x - x position\r\n   * @param {number} positionObj.y - y position\r\n   * @param {number} positionObj.z - y position\r\n   * @param {Object} normalRefOject - Normal reference of annotation and model\r\n   * @param {number} normalRefOject.x - x position\r\n   * @param {number} normalRefOject.y - y position\r\n   * @param {number} normalRefOject.z - z position\r\n   * @param {Object} options - Config object for annotation\r\n   * @return {Annotation} - New created annotation instance\r\n   */\n\n\n  RealityBoxEditor.prototype.addAnnotation = function (positionObj, normalRefObj, options) {\n    let params = {};\n\n    if (options) {\n      params = options;\n    } else {\n      params = {\n        position: {\n          x: positionObj.x,\n          y: positionObj.y,\n          z: positionObj.z\n        },\n        normalRef: {\n          x: normalRefObj.x,\n          y: normalRefObj.y,\n          z: normalRefObj.z\n        },\n        content: {\n          library: 'H5P.Column 1.13',\n          params: {}\n        }\n      };\n    }\n\n    params.id = H5P.createUUID();\n    this.params.annotations.push(params);\n    this.annotation = this.babylonBox.addAnnotation(params);\n    this.processAnnotation(this.annotation, params);\n    return this.annotation;\n  };\n  /**\r\n   * Deletes current BabylonBox instance\r\n   */\n\n\n  RealityBoxEditor.prototype.deleteBabylonBox = function () {\n    if (this.babylonBox !== undefined) {\n      this.babylonBox.stopRendering();\n      delete this.babylonBox;\n    }\n  };\n  /**\r\n   * Appends H5P editor item scaffold to widgets wrapper\r\n   * @param {jQuery} $wrapper - wrapper of widget\r\n   */\n\n\n  RealityBoxEditor.prototype.appendTo = function ($wrapper) {\n    this.$item = $(this.createHTML()).appendTo($wrapper);\n    this.$editor = this.$item.children('.h5peditor-annotations');\n    this.$errors = this.$item.children('.h5p-errors');\n  };\n  /**\r\n   * Gets H5P editor item scaffold\r\n   * @return {string} - HTML string\r\n   */\n\n\n  RealityBoxEditor.prototype.createHTML = function () {\n    return H5PEditor.createItem(this.field.widget, '<div class=\"h5peditor-annotations\" />');\n  };\n  /**\r\n   * Checks validity of all entries\r\n   * @return {boolean} True if all entries are valid\r\n   */\n\n\n  RealityBoxEditor.prototype.validate = function () {\n    if (this.babylonBox) {\n      for (annotation of this.babylonBox.getAnnotations()) {\n        for (child of annotation.children) {\n          child.validate();\n        }\n      }\n    }\n\n    this.trigger('validate');\n    return true;\n  };\n  /**\r\n   * Removes widget\r\n   */\n\n\n  RealityBoxEditor.prototype.remove = function () {\n    this.deleteBabylonBox();\n    this.$item.remove();\n  };\n\n  RealityBoxEditor.prototype.ready = function (ready) {\n    if (this.passReadies) {\n      this.parent.ready(ready);\n    } else {\n      this.readies.push(ready);\n    }\n  };\n  /**\r\n   * Find field by name\r\n   * @private\r\n   * @param {string} name - Name for seeking\r\n   * @param {Object[]} fields - Fields to go over\r\n   * @return {Object} - Field with the specific name\r\n   */\n\n\n  const findField = function (name, fields) {\n    for (f of fields) {\n      if (f.name === name) {\n        return f;\n      }\n    }\n  };\n  /**\r\n   * Hides fields from widget by name\r\n   * @param {Object[]} annotationFields - All annotation fields\r\n   * @param {string[]} fields - Array of field names that should hided\r\n   */\n\n\n  const hideFields = function (annotationFields, fields) {\n    // Find and hide fields in list\n    for (f of fields) {\n      var field = findField(f, annotationFields);\n\n      if (field) {\n        field.widget = 'none';\n      }\n    }\n  };\n\n  return RealityBoxEditor;\n}(H5P.jQuery);\n\n//# sourceURL=webpack://H5PEditor.RealityBox/./src/js/realitybox-editor.js?");

/***/ }),

/***/ "./src/css/realitybox-editor.css":
/*!***************************************!*\
  !*** ./src/css/realitybox-editor.css ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n// extracted by mini-css-extract-plugin\n\n\n//# sourceURL=webpack://H5PEditor.RealityBox/./src/css/realitybox-editor.css?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => module['default'] :
/******/ 				() => module;
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop)
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	// startup
/******/ 	// Load entry module
/******/ 	__webpack_require__("./src/index.js");
/******/ 	// This entry module used 'exports' so it can't be inlined
/******/ })()
;