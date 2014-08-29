'use strict';

var grunt = require('grunt');

var notify = true;

module.exports = {
  handleRequest: function(req, res, next) {
    if (notify) {
      grunt.log.warn('Deprecated.  Add grunt-connect-prism middleware using require(\'grunt-connect-prism/middleware\') instead');
      notify = false;
    }

    return require('connect-prism').middleware(req, res, next);
  }
};