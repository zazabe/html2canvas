var NodeParser = require('../src/nodeparser');

function TextNodeParser(element, renderer, support, imageLoader, options) {
  NodeParser.call(this, element, renderer, support, imageLoader, options || {background: '#eee'});
}

TextNodeParser.prototype = Object.create(NodeParser.prototype);
TextNodeParser.prototype.constructor = TextNodeParser;

TextNodeParser.prototype.createStyles = function(document, styles) {
  if (window.html2canvas.logging) {
    console.warn('Pseudo style added externally.');
  }
};

module.exports = TextNodeParser;
