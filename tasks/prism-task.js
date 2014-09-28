'use strict';

module.exports = function(grunt) {
  grunt.registerTask('prism', 'Configure any specified connect proxies for prism.', require('../lib/prism'));
};