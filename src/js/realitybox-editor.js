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

    H5P.DragNBar.FormManager.call(
      this,
      parent.parent,
      {
        doneButtonLabel: 'Done',
        deleteButtonLabel: 'Delete',
        expandBreadcrumbButtonLabel: 'Full window',
        collapseBreadcrumbButtonLabel: 'Close full window'
      },
      'realitybox'
    );

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

    this.params = $.extend({
      markers: []
    }, params);
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

    let modelUrl = H5P.getPath(this.model.path, H5PEditor.contentId));
    let params = $.extend({}, { modelUrl }, this.params);
    this.babylonBox = H5P.newRunnable({
      library: 'H5P.BabylonBox 1.0',
      params
    }, H5PEditor.contentId, undefined, undefined, {parent: this});

    const markers = this.babylonBox.getMarkers();
    for (let i = 0; i < markers.length; i++) {
      this.processMarker(markers[i], this.params.markers[i]);
    }

    this.babylonBox.on('dblClick', ({ data }) => {
      this.addMarker(data.position, data.normalRef);
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
   * Creates form for edit marker content
   * @param {Marker} marker - Associated marker
   * @param {Object} parameters - Parameters of markers content
   */
  RealityBoxEditor.prototype.createMarkerForm = function (marker, parameters) {
    const $semanticFields = $('<div class="h5p-dialog-inner-semantics" />');
    marker.$form = $semanticFields;
    const markers = findField('markers', this.field.fields);
    const markerFields = H5PEditor.$.extend(true, [], markers.field.fields);

    hideFields(markerFields, ['position', 'normalRef']);

    H5PEditor.processSemanticsChunk(markerFields, parameters, $semanticFields, this);

    // hide selector for choosing library
    var pos = markerFields.map(function (field) {
      return field.type;
    }).indexOf('library');
    if (pos > -1) {
      this.children[pos].hide();
    }
  }

  /**
   * Processes marker
   * @param {Marker} marker - Marker to process
   * @param {Object} parameters - Parameters of markers content
   */
  RealityBoxEditor.prototype.processMarker = function (marker, parameters) {
    this.createMarkerForm(marker, parameters);
    marker.children = this.children;
    this.children = undefined;
    this.newMarker(marker);
  }

  /**
   * Gets H5P content field of specific marker
   * @param {Marker} marker
   * @return {Object} - H5P field for markers content
   */
  RealityBoxEditor.prototype.getMarkerFields = function (marker) {
    return marker.children.reduce(function (prev, child) {
      if (child.field && child.field.name) {
        prev[child.field.name] = child;
      }
      return prev;
    }, {});
  }

  /**
   * Opens form for a specific marker
   * @param {Marker} marker
   */
  RealityBoxEditor.prototype.openMarkerModal = function (marker) {
    const formremoveHandler = () => {
      if(!confirm('Would you like to remove this marker?')) {
        return;
      }
      this.removeMarker(marker);
    }
    this.on('formremove', formremoveHandler);

    const formdoneHandler = () => {
      for (child of marker.children) {
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

    const libraryField = H5PEditor.findField('content', marker);
    this.openForm(libraryField, marker.$form[0], 'h5p-realitybox-editor');

    marker.trigger('openEditDialog');
  }

  /**
   * Opens form for new created marker
   * @param {Marker} marker - Newly created marker
   */
  RealityBoxEditor.prototype.newMarker = function (marker) {
      this.openMarkerModal(marker);
  }

  /**
   * Removes marker
   * @param {Marker} marker - Marker to remove
   */
  RealityBoxEditor.prototype.removeMarker = function (marker) {
    this.babylonBox.removeMarker(marker);
    this.params.markers.splice(marker.arrayPosition, 1);
    H5PEditor.removeChildren(marker.children);
  }

  /**
   * Adds marker
   * @param {Object} positionObj - Position where new marker should created
   * @param {number} positionObj.x - x position
   * @param {number} positionObj.y - y position
   * @param {number} positionObj.z - y position
   * @param {Object} normalRefOject - Normal reference of marker and model
   * @param {number} normalRefOject.x - x position
   * @param {number} normalRefOject.y - y position
   * @param {number} normalRefOject.z - z position
   * @param {Object} options - Config object for marker
   * @return {Marker} - New created marker instance
   */
  RealityBoxEditor.prototype.addMarker = function (positionObj, normalRefObj, options) {
    let params = {};
    if (options) {
      params = options;
    }
    else {
      params = {
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
    }
    params.id = H5P.createUUID();

    this.params.markers.push(params);
    this.marker = this.babylonBox.addMarker(params);
    this.processMarker(this.marker, params);

    return this.marker;
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
    this.$editor = this.$item.children('.h5peditor-markers');
    this.$errors = this.$item.children('.h5p-errors');
  }

  /**
   * Gets H5P editor item scaffold
   * @return {string} - HTML string
   */
  RealityBoxEditor.prototype.createHTML = function () {
    return H5PEditor.createItem(this.field.widget, '<div class="h5peditor-markers" />');
  }

  /**
   * Checks validity of all entries
   * @return {boolean} True if all entries are valid
   */
  RealityBoxEditor.prototype.validate = function () {
    if (this.babylonBox) {
      for (marker of this.babylonBox.getMarkers()) {
        for (child of marker.children) {
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
    for (f of fields) {
      if (f.name === name) {
        return f;
      }
    }
  }

  /**
   * Hides fields from widget by name
   * @param {Object[]} markerFields - All marker fields
   * @param {string[]} fields - Array of field names that should hided
   */
  const hideFields = function (markerFields, fields) {
    // Find and hide fields in list
    for (f of fields) {
      var field = findField(f, markerFields);
      if (field) {
        field.widget = 'none';
      }
    }
  }

  return RealityBoxEditor;

})(H5P.jQuery);
