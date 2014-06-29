'use strict';

var path = require('path');
var prism = require('connect-prism');
var _ = require('lodash');

module.exports = function(grunt) {
  grunt.registerTask('prism', 'Configure any specified connect proxies for prism.', function(targetArg, modeOverride) {
    var prismInstances = [];

    var root = grunt.config('prism');

    if (_.isUndefined(root)) {
      grunt.log.error('No prism configuration found.');
    }

    _.forEach(root, function(config, target) {
      // skip the base options configuration and all other target configs if targetArg provided
      if (target === 'options' || (targetArg && targetArg !== target)) {
        return;
      }

      var options = config.options || {};

      if (modeOverride) {
        options.mode = modeOverride;
      }

      // use target as prism name. kind of like 'cassette' feature in VCR.
      options.name = target;

      options = _.defaults(options, root.options);

      prism.create(options);
    });
  });
};