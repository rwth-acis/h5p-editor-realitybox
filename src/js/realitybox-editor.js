H5PEditor.widgets.realitybox = H5PEditor.RealityBox = (function ($) {

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

    this.isFirstModel = (params === undefined || !parent.params.video.files);

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

  RealityBoxEditor.prototype = Object.create(H5P.DragNBar.FormManager.prototype);
  RealityBoxEditor.prototype.constructor = RealityBoxEditor;

  RealityBoxEditor.prototype.findField = function (path, callback) {
    this.parent.ready(() => {
      const field = H5PEditor.findField(path, this.parent);
      if (!field) {
        throw 'Field ' + path + 'not found';
      }
      callback(field);
    });
  }

  RealityBoxEditor.prototype.setModel = function (file) {
    console.log(file);
    this.model = file;
    this.deleteBabylonBox();
  }

  RealityBoxEditor.prototype.setActive = function () {
    if (this.babylonBox !== undefined) {
      return;
    }

    if (this.model === undefined) {
      this.$editor.html('No model file uploaded.');
      return;
    }

    console.log('--- Editor model ---')
    console.log(H5P.getPath(this.model.path, H5PEditor.contentId))
    const params = $.extend({}, { file: this.model }, this.params);
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

  RealityBoxEditor.prototype.displayMessage = function (message) {
    alert(message);
  }

  RealityBoxEditor.prototype.createMarkerForm = function (marker, parameters) {
    const $semanticFields = $('<div class="h5p-dialog-inner-semantics" />');
    marker.$form = $semanticFields;
    const markers = findField('markers', this.field.fields);
    const markerFields = H5PEditor.$.extend(true, [], markers.field.fields);

    hideFields(markerFields, ['position', 'normalRef']);

    H5PEditor.processSemanticsChunk(markerFields, parameters, $semanticFields, this);

    var pos = markerFields.map(function (field) {
      return field.type;
    }).indexOf('library');
    if (pos > -1) {
      this.children[pos].hide();
    }
  }

  RealityBoxEditor.prototype.processMarker = function (marker, parameters) {
    this.createMarkerForm(marker, parameters);
    marker.children = this.children;
    this.children = undefined;
    const markerFields = this.getMarkerFields(marker);

    this.newMarker(marker);
  }

  RealityBoxEditor.prototype.getMarkerFields = function (marker) {
    return marker.children.reduce(function (prev, child) {
      if (child.field && child.field.name) {
        prev[child.field.name] = child;
      }
      return prev;
    }, {});
  }

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

  RealityBoxEditor.prototype.newMarker = function (marker) {
      this.openMarkerModal(marker);
  }

  RealityBoxEditor.prototype.removeMarker = function (marker) {
    this.babylonBox.removeMarker(marker);
    this.params.markers.splice(marker.arrayPosition, 1);
    H5PEditor.removeChildren(marker.children);
  }

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

  RealityBoxEditor.prototype.deleteBabylonBox = function () {
    if (this.babylonBox !== undefined) {
      this.babylonBox.stopRendering();
      delete this.babylonBox;
    }
  }

  RealityBoxEditor.prototype.appendTo = function ($wrapper) {
    this.$item = $(this.createHTML()).appendTo($wrapper);
    this.$editor = this.$item.children('.h5peditor-markers');
    this.$errors = this.$item.children('.h5p-errors');
  }

  RealityBoxEditor.prototype.createHTML = function () {
    return H5PEditor.createItem(this.field.widget, '<div class="h5peditor-markers" />');
  }

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

  const findField = function (name, fields) {
    for (f of fields) {
      if (f.name === name) {
        return f;
      }
    }
  }

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
