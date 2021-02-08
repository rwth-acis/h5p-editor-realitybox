H5PEditor.widgets.realitybox = H5PEditor.RealityBox = (function ($) {

  function RealityBoxEditor(parent, field, params, setValue) {

    H5P.DragNBar.FormManager.call(this, parent.parent, {}, 'realitybox');

    this.field = field;
    this.parent = parent;

    // get model params and set model
    this.findField(this.field.model, (f) => {
      if (f.field.type !== 'file') {
        throw 'No model uploaded.';
      }
      if (f.params !== undefined) {
        this.setModel(f.params);
      }
      f.changes.push(() => {
        this.setModel(f.params);
      });
    });

    this.params = $.extend({
      markers: []
    }, params)
    setValue(field, this.params);

    parent.ready(() => {
      this.setActive();
    })

    this.appendTo = ($wrapper) => {
      $wrapper.addClass('h5peditor-realitybox--wrapper')
      this.$editor = $('<div class="babylon--wrapper" />').appendTo($wrapper);
    }

    this.validate = () => {}

    this.remove = () => {}

  }

  RealityBoxEditor.prototype = Object.create(H5P.DragNBar.FormManager.prototype);

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
  }

  RealityBoxEditor.prototype.setActive = function () {
    if (this.model === undefined) {
      this.$editor.html('No model file uploaded');
      return;
    }
    if (this.babylon !== undefined) {
      return;
    }
    this.babylon = new H5P.newRunnable({
      library: 'H5P.BabylonBox 1.0',
      params: {
        file: this.model,
        markers: this.params
      }
    }, H5PEditor.contentId, undefined, undefined, {parent: this});
    this.$editor.html('');
    this.babylon.attach(this.$editor[0]);
  }

  return RealityBoxEditor;

})(H5P.jQuery);
