'use strict';

var grunt = require('grunt');
var path = require('path');
var prism = require('connect-prism');
var _ = require('lodash');

function createInstance(modeOverride, options) {
  if (modeOverride) {
    options.mode = modeOverride;
  }
  prism.create(options);
}

module.exports = function(targetArg, modeOverride) {
  var root = grunt.config('prism');

  if (_.isUndefined(root)) {
    grunt.log.error('No prism configuration found.');
    return;
  }
  if (root['default']) {
    grunt.log.error('Cannot use reserved target name \'default\'');
    return;
  }

  root.options = root.options || {};

  // create default prism instance
  if (_.size(root) === 1 && root['options']) {
    if (_.isUndefined(root.options.name)) {
      root.options.name = 'default';
    }
    createInstance(modeOverride, root.options);
  } else {
    _.forEach(root, function(config, target) {
      // skip the base options configuration and all other target configs if targetArg provided
      if (target === 'options' || (targetArg && targetArg !== target)) {
        return;
      }

      var options = config.options || {};

      // use target as prism name. kind of like 'cassette' feature in VCR.
      options.name = target;
      options = _.defaults(options, root.options);
      createInstance(modeOverride, options);
    });
  }
};