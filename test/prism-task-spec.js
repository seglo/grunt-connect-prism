'use strict';

var fs = require('fs');
var http = require('http');
var path = require('path');

var _ = require('lodash');
var assert = require('assert');

var proxies = require('connect-prism/lib/proxies');

var requestTimeout = 5000; // 5 seconds

describe('Prism', function() {
  describe('task initialization', function() {
    it('should have initialized 3 proxies', function() {
      assert.equal(3, proxies.proxies().length);
    });

    it('request options should be correctly mapped', function() {
      var proxy = proxies.getProxy('/proxyRequest');

      assert.equal(_.isUndefined(proxy), false);
      assert.equal(proxy.config.mode, 'proxy');
      assert.equal(proxy.config.mocksPath, './mocks');
      assert.equal(proxy.config.context, '/proxyRequest');
      assert.equal(proxy.config.host, 'localhost');
      assert.equal(proxy.config.port, 8090);
      assert.equal(proxy.config.https, false);
      assert.equal(proxy.config.changeOrigin, false);
    });

    it('mode can be overridden', function() {
      var proxy = proxies.getProxy('/proxyOverrideRequest');

      assert.equal(_.isUndefined(proxy), false);
      assert.equal(proxy.config.mode, 'record');
    });

    it('can inherit config from root task options', function() {
      var proxy = proxies.getProxy('/defaultContext');

      assert.equal(_.isUndefined(proxy), false);
      assert.equal(proxy.config.mode, 'proxy');
      assert.equal(proxy.config.mocksPath, './mocks');
      assert.equal(proxy.config.context, '/defaultContext');
      assert.equal(proxy.config.host, 'localhost');
      assert.equal(proxy.config.port, 8090);
      assert.equal(proxy.config.https, false);
      assert.equal(proxy.config.changeOrigin, false);
    });
  });
});