(()=>{var t={270:()=>{H5PEditor.widgets.realitybox=H5PEditor.RealityBox=function(t){function e(e,o,r,i){H5P.DragNBar.FormManager.call(this,e.parent,{},"realitybox"),this.field=o,this.parent=e,this.findField(this.field.model,(t=>{if("file"!==t.field.type)throw"No model uploaded.";void 0!==t.params&&this.setModel(t.params),t.changes.push((()=>{this.setModel(t.params)}))})),this.params=t.extend({markers:[]},r),i(o,this.params),e.ready((()=>{this.setActive()})),this.appendTo=e=>{e.addClass("h5peditor-realitybox--wrapper"),this.$editor=t('<div class="babylon--wrapper" />').appendTo(e)},this.validate=()=>{},this.remove=()=>{}}return e.prototype=Object.create(H5P.DragNBar.FormManager.prototype),e.prototype.findField=function(t,e){this.parent.ready((()=>{const o=H5PEditor.findField(t,this.parent);if(!o)throw"Field "+t+"not found";e(o)}))},e.prototype.setModel=function(t){console.log(t),this.model=t},e.prototype.setActive=function(){void 0!==this.model?void 0===this.babylon&&(this.babylon=new H5P.newRunnable({library:"H5P.BabylonBox 1.0",params:{file:this.model,markers:this.params}},H5PEditor.contentId,void 0,void 0,{parent:this}),this.$editor.html(""),this.babylon.attach(this.$editor[0])):this.$editor.html("No model file uploaded")},e}(H5P.jQuery)}},e={};function o(r){if(e[r])return e[r].exports;var i=e[r]={exports:{}};return t[r](i,i.exports,o),i.exports}o.n=t=>{var e=t&&t.__esModule?()=>t.default:()=>t;return o.d(e,{a:e}),e},o.d=(t,e)=>{for(var r in e)o.o(e,r)&&!o.o(t,r)&&Object.defineProperty(t,r,{enumerable:!0,get:e[r]})},o.o=(t,e)=>Object.prototype.hasOwnProperty.call(t,e),(()=>{"use strict";var t=o(270),e=o.n(t);H5PEditor=H5PEditor||{},H5PEditor.RealityBox=e()})()})();