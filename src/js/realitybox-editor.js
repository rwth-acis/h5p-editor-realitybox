import Tooltip from './tooltip.js';

H5PEditor.widgets.realitybox = H5PEditor.RealityBox = (function ($) {

  /**
   * Constructor function
   * @extends H5P.DragNBar.FormManager
   * @param {Object} parent - Parent object
   * @param {Object} field - Field object
   * @param {Object} params - Config object for RealityBox
   * @param {function(field: Object, value: Object)} - Callback function to set widgets field value
   */
  function RealityBoxEditor(parent, field, params, setValue) {

    H5P.DragNBar.FormManager.call(this, parent.parent, {
      doneButtonLabel: 'Done',
      deleteButtonLabel: 'Delete',
      expandBreadcrumbButtonLabel: 'Enter fullscreen',
      collapseBreadcrumbButtonLabel: 'Exit fullscreen'
    }, 'realitybox');

    this.field = field;
    this.parent = parent;
    this.setValue = setValue;

    // get model params and set model
    this.findField(this.field.model, (field) => {
      if (field.field.type !== 'file') {
        throw 'No model field.';
      }
      if (field.params !== undefined) {
        this.setModel(field.params);
      }
      field.changes.push(() => {
        this.setModel(field.params);
      });
    });

    this.params = [];
    this.setValue(field, this.params);

    this.children = [];

    this.passReadies = true;
    parent.ready(() => {
      this.passReadies = false;
      this.setActive();
    });

    this.currentTabIndex = 0;

    parent.on('stepChanged', (event) => {
      this.currentTabIndex = event.data.id;
      console.log(this.readies);
    });

  }

  // extends H5P.DragNBar.FormManager
  RealityBoxEditor.prototype = Object.create(H5P.DragNBar.FormManager.prototype);
  RealityBoxEditor.prototype.constructor = RealityBoxEditor;

  /**
   * Invokes callback with H5P field object of given path
   * @param {string} path - Path of field
   * @param {function(field: Object)} callback - Callback function
   */
  RealityBoxEditor.prototype.findField = function (path, callback) {
    this.parent.ready(() => {
      const field = H5PEditor.findField(path, this.parent);
      if (!field) {
        throw 'Field ' + path + 'not found';
      }
      callback(field);
    });
  }

  /**
   * Set model
   * @param {Object} file - H5P file object
   */
  RealityBoxEditor.prototype.setModel = function (file) {
    console.log(file);
    this.model = file;
    this.deleteBabylonBox();
    this.params.length = 0;
  }

  /**
   * Creates BabylonBox instance in widget
   */
  RealityBoxEditor.prototype.setActive = function () {
    if (this.babylonBox !== undefined) {
      return;
    }

    if (this.model === undefined) {
      this.$editor.html('No model file uploaded.');
      return;
    }

    let modelUrl = H5P.getPath(this.model.path, H5PEditor.contentId);
    let params = $.extend({}, { modelUrl }, { annotations: this.params });
    this.babylonBox = H5P.newRunnable({
      library: 'H5P.BabylonBox 1.0',
      params
    }, H5PEditor.contentId, undefined, undefined, {parent: this});

    const annotations = this.babylonBox.getAnnotations();
    for (let i = 0; i < annotations.length; i++) {
      this.processAnnotation(annotations[i], this.params[i]);
    }

    // Create new by double-click
    this.babylonBox.on('dblClick', ({ data }) => {
      this.addAnnotation(data.position, data.normalRef);
    });

    // Init edit with click
    this.babylonBox.on('annotation picked', ({ data }) => {
      if (this.titleTooltip) {
        this.titleTooltip.hide();
      }
      this.openAnnotationDialog(data);
    });

    // Show title tooltip while pointer over
    this.babylonBox.on('annotation pointerover', ({ data }) => {
      if (!this.titleTooltip) {
        this.titleTooltip = new Tooltip();
      }
      if (typeof(data.content.metadata.title) !== 'undefined') {
        this.titleTooltip.show(data.content.metadata.title);
      }
    });
    this.babylonBox.on('annotation pointerout', () => {
      this.titleTooltip.hide();
    });

    this.$editor.empty();
    this.babylonBox.attach(this.$editor);
  }

  /**
   * Alert message
   * @param {string} message - Message to show
   */
  RealityBoxEditor.prototype.displayMessage = function (message) {
    alert(message);
  }

  /**
   * Creates form for edit annotation content
   * @param {Annotation} annotation - Associated annotation
   * @param {Object} parameters - Parameters of annotations content
   */
  RealityBoxEditor.prototype.createAnnotationForm = function (annotation, parameters) {
    const $semanticFields = $('<div class="h5p-dialog-inner-semantics" />');
    annotation.$form = $semanticFields;
    const annotationsList = findField('annotationsList', this.field.fields);
    const annotationFields = H5PEditor.$.extend(
      true,
      [],
      annotationsList.field.fields
    );

    hideFields(annotationFields, ['position', 'normalRef']);

    H5PEditor.processSemanticsChunk(
      annotationFields,
      parameters,
      $semanticFields,
      this
    );

    // hide selector for choosing library
    var pos = annotationFields.map(function (field) {
      return field.type;
    }).indexOf('library');
    if (pos > -1) {
      this.children[pos].hide();
    }
  }

  /**
   * Processes annotation
   * @param {Annotation} annotation - Annotation to process
   * @param {Object} parameters - Parameters of annotations content
   */
  RealityBoxEditor.prototype.processAnnotation = function (annotation, parameters) {
    this.createAnnotationForm(annotation, parameters);
    annotation.children = this.children;
    this.children = undefined;
    this.openAnnotationDialog(annotation);
  }

  /**
   * Gets H5P content field of specific annotation
   * @param {Annotation} annotation
   * @return {Object} - H5P field for annotations content
   */
  RealityBoxEditor.prototype.getAnnotationFields = function (annotation) {
    return annotation.children.reduce(function (prev, child) {
      if (child.field && child.field.name) {
        prev[child.field.name] = child;
      }
      return prev;
    }, {});
  }

  /**
   * Opens form for a specific annotation
   * @param {Annotation} annotation
   */
  RealityBoxEditor.prototype.openAnnotationDialog = function (annotation) {
    const formremoveHandler = () => {
      if(!confirm('Would you like to remove this annotation?')) {
        return;
      }
      this.removeAnnotation(annotation);
    }
    this.on('formremove', formremoveHandler);

    const formdoneHandler = () => {
      for (const child of annotation.children) {
        child.validate();
      }
    }
    this.on('formdone', formdoneHandler);

    const formcloseHandler = () => {
      this.off('formremove', formremoveHandler);
      this.off('formdone', formdoneHandler);
      this.off('formclose', formcloseHandler);
    }
    this.on('formclose', formcloseHandler);

    const libraryField = H5PEditor.findField('content', annotation);
    this.openForm(libraryField, annotation.$form[0], 'h5p-realitybox-editor');

    annotation.trigger('openEditDialog');
  }

  /**
   * Removes annotation
   * @param {Annotation} annotation - Annotation to remove
   */
  RealityBoxEditor.prototype.removeAnnotation = function (annotation) {
    const pos = this.babylonBox.getIndexOfAnnotation(annotation);
    if (pos >= 0) {
      this.params.splice(pos, 1);
      this.babylonBox.removeAnnotation(annotation);
      H5PEditor.removeChildren(annotation.children);
    }
  }

  /**
   * Adds annotation
   * @param {Object} positionObj - Position where new annotation should created
   * @param {number} positionObj.x - x position
   * @param {number} positionObj.y - y position
   * @param {number} positionObj.z - y position
   * @param {Object} normalRefOject - Normal reference of annotation and model
   * @param {number} normalRefOject.x - x position
   * @param {number} normalRefOject.y - y position
   * @param {number} normalRefOject.z - z position
   * @param {Object} options - Config object for annotation
   * @return {Annotation} - New created annotation instance
   */
  RealityBoxEditor.prototype.addAnnotation = function (positionObj, normalRefObj) {
    const params = {
      position: {
        x: positionObj.x,
        y: positionObj.y,
        z: positionObj.z
      },
      normalRef: {
        x: normalRefObj.x,
        y: normalRefObj.y,
        z: normalRefObj.z
      },
      content: {
        library: 'H5P.Column 1.13',
        params: {}
      }
    }
    params.id = H5P.createUUID();

    this.params.push(params);
    this.annotation = this.babylonBox.addAnnotation(params);
    this.processAnnotation(this.annotation, params);

    return this.annotation;
  }

  /**
   * Deletes current BabylonBox instance
   */
  RealityBoxEditor.prototype.deleteBabylonBox = function () {
    if (this.babylonBox !== undefined) {
      this.babylonBox.stopRendering();
      delete this.babylonBox;
    }
  }

  /**
   * Appends H5P editor item scaffold to widgets wrapper
   * @param {jQuery} $wrapper - wrapper of widget
   */
  RealityBoxEditor.prototype.appendTo = function ($wrapper) {
    this.$item = $(this.createHTML()).appendTo($wrapper);
    this.$editor = this.$item.children('.h5peditor-annotations');
    this.$errors = this.$item.children('.h5p-errors');
  }

  /**
   * Gets H5P editor item scaffold
   * @return {string} - HTML string
   */
  RealityBoxEditor.prototype.createHTML = function () {
    return H5PEditor.createItem(
      this.field.widget,
      '<div class="h5peditor-annotations" />'
    );
  }

  /**
   * Checks validity of all entries
   * @return {boolean} True if all entries are valid
   */
  RealityBoxEditor.prototype.validate = function () {
    if (this.babylonBox) {
      for (const annotation of this.babylonBox.getAnnotations()) {
        for (const child of annotation.children) {
          child.validate();
        }
      }
    }
    this.trigger('validate');
    return true;
  }

  /**
   * Removes widget
   */
  RealityBoxEditor.prototype.remove = function () {
    this.deleteBabylonBox();
    this.$item.remove();
  }

  /**
   * Collect functions to execute once the tree is complete.
   * @param {function} ready
   */
  RealityBoxEditor.prototype.ready = function (ready) {
    if (this.passReadies) {
      this.parent.ready(ready);
    }
    else {
      this.readies.push(ready);
    }
  }

  /**
   * Find field by name
   * @private
   * @param {string} name - Name for seeking
   * @param {Object[]} fields - Fields to go over
   * @return {Object} - Field with the specific name
   */
  const findField = function (name, fields) {
    for (const f of fields) {
      if (f.name === name) {
        return f;
      }
    }
  }

  /**
   * Hides fields from widget by name
   * @param {Object[]} annotationFields - All annotation fields
   * @param {string[]} fields - Array of field names that should hided
   */
  const hideFields = function (annotationFields, fields) {
    // Find and hide fields in list
    for (const f of fields) {
      var field = findField(f, annotationFields);
      if (field) {
        field.widget = 'none';
      }
    }
  }

  return RealityBoxEditor;

})(H5P.jQuery);
