var TextRenderer = require('./TextRenderer');
var TextNodeParser = require('./TextNodeParser');
var FakeImageLoader = require('./FakeImageLoader');
var FakeSupport = require('./FakeSupport');

window.html2canvas = function(node, options) {
  options = options || {};

  if (options.logging) {
    window.html2canvas.logging = true;
    window.html2canvas.start = Date.now();
  }
  if (!options.canvas) {
    options.canvas = document.createElement('canvas');
  }

  var support = new FakeSupport();
  var imageLoader = new FakeImageLoader();
  var renderer = new TextRenderer(options.width, options.height, imageLoader, options, document);
  var parser = new TextNodeParser(node, renderer, support, imageLoader);

  return parser.ready.then(function() {
    return renderer.canvas;
  });
};
