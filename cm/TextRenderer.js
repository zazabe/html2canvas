var CanvasRenderer = require('../src/renderers/canvas');

var TextRender = function() {
  CanvasRenderer.apply(this, arguments);
};

TextRender.prototype = Object.create(CanvasRenderer.prototype);
TextRender.prototype.constructor = TextRender;

TextRender.prototype.renderBackgroundImage = function() {
  if (window.html2canvas.logging) {
    console.warn('renderBackgroundImage not supported');
  }
};

module.exports = TextRender;
