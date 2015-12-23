function Support() {
  this.rangeBounds = true;
  this.cors = true;
  this.svg = true;
}

Support.prototype.testRangeBounds = function() {
  return true;
};

Support.prototype.testCORS = function() {
  return true;
};

Support.prototype.testSVG = function() {
  return true;
};

module.exports = Support;
