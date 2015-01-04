'use strict';

var fs = require('fs');
var http = require('http');
var path = require('path');

var _ = require('lodash');
var assert = require('assert');
var grunt = require('grunt');
var prism = require('../lib/prism');

var manager = require('connect-prism').manager;

var requestTimeout = 5000; // 5 seconds

describe('Prism', function() {
  afterEach(function() {
    manager.reset();
  });

  describe('task with target initialization', function() {
    beforeEach(function() {
      grunt.config.set('prism', {
        options: {
          mode: 'proxy',
          mocksPath: './mocks',
          context: '/defaultContext',
          host: 'localhost',
          port: 8090,
          https: false,
          delay: 0
        },
        proxyTest: {
          options: {
            mode: 'proxy',
            mocksPath: './mocks',
            context: '/proxyRequest',
            host: 'localhost',
            port: 8090,
            https: false,
            delay: 2
          }
        },
        modeOverrideTest: {
          options: {
            mode: 'proxy',
            mocksPath: './mocks',
            context: '/proxyOverrideRequest',
            host: 'localhost',
            port: 8090,
            https: false
          }
        },
        inheritRootOptionsTest: {}
      });
      prism('proxyTest');
      prism('modeOverrideTest', 'record');
      prism('inheritRootOptionsTest');
    });

    it('should have initialized 3 proxies', function() {
      assert.equal(3, manager.prisms().length);
    });

    it('request options should be correctly mapped', function() {
      var proxy = manager.get('/proxyRequest');

      assert.equal(_.isUndefined(proxy), false);
      assert.equal(proxy.config.mode, 'proxy');
      assert.equal(proxy.config.mocksPath, './mocks');
      assert.equal(proxy.config.context, '/proxyRequest');
      assert.equal(proxy.config.host, 'localhost');
      assert.equal(proxy.config.port, 8090);
      assert.equal(proxy.config.https, false);
    });

    it('mode can be overridden', function() {
      var proxy = manager.get('/proxyOverrideRequest');

      assert.equal(_.isUndefined(proxy), false);
      assert.equal(proxy.config.mode, 'record');
    });

    it('can inherit config from root task options', function() {
      var proxy = manager.get('/defaultContext');

      assert.equal(_.isUndefined(proxy), false);
      assert.equal(proxy.config.mode, 'proxy');
      assert.equal(proxy.config.mocksPath, './mocks');
      assert.equal(proxy.config.context, '/defaultContext');
      assert.equal(proxy.config.host, 'localhost');
      assert.equal(proxy.config.port, 8090);
      assert.equal(proxy.config.https, false);
    });
  });
  describe('default task initialization', function() {

    it('should initialize default context', function() {
      grunt.config.set('prism', {
        options: {
          context: '/defaultContext',
          host: 'localhost'
        }
      });
      prism();

      var proxy = manager.get('/defaultContext');

      assert.equal(_.isUndefined(proxy), false);
      assert.equal(proxy.config.name, 'default');
      assert.equal(proxy.config.context, '/defaultContext');
    });

    it('should initialize all targets', function() {
      grunt.config.set('prism', {
        options: {
          mode: 'proxy',
          host: 'localhost'
        },
        targetOne: {
          options: {
            context: '/targetOne'
          }
        },
        targetTwo: {
          options: {
            context: '/targetTwo'
          }
        }
      });
      prism();

      assert.equal(2, manager.prisms().length);
      assert.equal(_.isUndefined(manager.get('/targetOne')), false);
      assert.equal(_.isUndefined(manager.get('/targetTwo')), false);
    });

    it('should initialize api', function(done) {
      grunt.config.set('prism', {
        options: {
          context: '/defaultContext',
          host: 'localhost',
          useApi: true
        }
      });
      prism();

      var req = http.request({
        host: 'localhost',
        path: '/_prism/version',
        port: 9000
      }, function(res) {
        var data = '';
        res.on('data', function(chunk) {
          data += chunk;
        });
        res.on('end', function() {
          assert.equal(data, require('../node_modules/connect-prism/package.json').version);
          done();
        });
      });
      req.end();
    });
  });
});