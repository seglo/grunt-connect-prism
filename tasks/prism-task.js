'use strict';

module.exports = function(grunt) {
  grunt.registerTask('prism', 'Configure any specified connect proxies for prism.', function(targetArg, modeOverride) {
    return require('../lib/prism')(targetArg, modeOverride, grunt);
  });
};