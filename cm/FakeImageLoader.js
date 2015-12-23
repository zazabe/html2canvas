var FakeImageLoader = function() {
  this.ready = Promise.resolve();
};

FakeImageLoader.prototype.fetch = function() {
  return this;
};

module.exports = FakeImageLoader;
