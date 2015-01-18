# grunt-connect-prism

[![NPM version](https://badge.fury.io/js/grunt-connect-prism.svg)](http://badge.fury.io/js/grunt-connect-prism)
[![Build Status](https://travis-ci.org/seglo/grunt-connect-prism.svg?branch=master)](https://travis-ci.org/seglo/grunt-connect-prism)
[![Dependency Status](https://david-dm.org/seglo/grunt-connect-prism.svg)](https://david-dm.org/seglo/grunt-connect-prism)
[![devDependency Status](https://david-dm.org/seglo/grunt-connect-prism/dev-status.svg)](https://david-dm.org/seglo/grunt-connect-prism#info=devDependencies)

> Record, mock, and proxy HTTP traffic using the connect-prism middleware.

## Getting Started
This plugin requires Grunt `~0.4.1` and the [grunt-contrib-connect](https://github.com/gruntjs/grunt-contrib-connect) `~0.7.1` plugin to already be installed.

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-connect-prism --save-dev
```

One the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-connect-prism');
```
## Overview

This grunt plugin is a wrapper around the [connect-prism](https://github.com/seglo/connect-prism) middleware.

Prism is similar to the Ruby project [VCR](https://github.com/elcuervo/vcr.js).

The purpose of this plugin is to provide an easy way for front end developers to record HTTP responses returned by their API (or some other remote source) and then be able replay the responses in the future.  It's basically an HTTP cache, but for developers working on a Single Page Application (SPA).

It's useful for mocking complex & high latency API calls during development.  It's also useful when writing e2e tests for your SPA only, removing the server from the equation.  This results in much faster execution of your e2e test suite.

Prism works by adding a custom connect middleware to the connect server provided by the [grunt-contrib-connect](https://github.com/gruntjs/grunt-contrib-connect) plugin.

### Modes

There are currently 4 supported modes of operation.

#### Record

The record mode will allow you to both record and proxy all HTTP traffic for a certain endpoint on your connect development server.  For example, if in production your API sits at an endpoint `/api` then you may be currently proxying requests to a server you're hosting locally on another port or to an integration machine somewhere else.  You may have also attempted to mock out services that make HTTP calls in your client side code itself.  While in record mode you can navigate your application and trigger all the types of API calls you would like to have recorded.  Prism will then listen for responses and serialize them to disk.  When you want to read these responses instead of proxying traffic to the real server you shutdown and switch to the 'mock' mode.

To make mocks more readable, responses with a content-type of `json` or `javascript` will have their data stringified as an object.  If the content-type is anything other than json or if stringification fails then it falls back to a string.

If the server returns a compressed response (gzip or deflate are supported), then prism will decompress the payload when recording the response.

Example mock generated:

```javascript
{
  "requestUrl": "/api/ponies",
  "contentType": "application/json",
  "statusCode": 200,
  "data": {
    "text": "my little ponies"
  }
}
```

#### Mock

The mock (read) mode will listen for requests to a certain endpoint.  When a request matches an endpoint it will attempt to find a previously recorded response in the directory you defined mocks to be saved in (./mocks by default).  

If a matching response is not found then prism will return a 404.  Prism will also create a mock during a 404.  This is useful when you want to mock API endpoints that may not exist yet.  To avoid having the subsequent request from returning the generated empty mock, the file has a .404 extension.  To use the mock, populate it with the appropriate values and remove the .404 extension.  This feature was contributed by [Miloš Mošovský](https://github.com/MilosMosovsky).

#### Mock & Record

As its name implies this operation will mock and record.  This mode will first attempt to load a mock if one exists.  If a mock does not exist it will then proxy the request and record the response instead of returning a 404.

#### Proxy

And finally, prism supports simple proxying in much the same way as the [grunt-connect-proxy](https://github.com/drewzboto/grunt-connect-proxy) plugin works.  In fact, this plugin is heavily inspired by that project.  While in proxy mode, listening events for recording and mocking are disabled.

### Adapting the "connect" task

#### Adding the middleware

This configuration is based on a modification to the connect middleware configuration that the yeoman [angular-generator](https://github.com/yeoman/generator-angular) will create.

```js
connect: {
  livereload: {
    options: {
      middleware: function(connect) {
        return [
          require('grunt-connect-prism/middleware'),
          connect.static('.tmp'),
          connect().use(
            '/bower_components',
            connect.static('./bower_components')
          ),
          connect.static(appConfig.app)
        ];
      }
    }
  }
}
```

## Configuration 

In your project's Gruntfile, add a section named `prism`.

### Adding prism configuration.

You can add all the options in the root task options, in a target options, or a mix of both (where the target options will inherit from the root options).  If only the root prism options are provided than a prism instance with the name 'default' will be created.

i.e)

```js
prism: {
  options: {
    mode: 'record',
    host: 'localhost',
    port: 8090,
    context: '/api'
  }
}
```

#### Multiple targets

You can create multiple prism targets in the standard convention of grunt configuration.  `grunt-connect-prism` will create a directory in the `mocksPath` directory named after the target. 

i.e.)

```js
prism: {
  options: {
    host: 'localhost',
    port: 8090,
    https: true,
    mocksPath: './stubs',
    useApi: true
  },
  server: {
    options: {
      mode: 'record',
      context: '/api'
    }
  }
}
```

### Running prism
Typically you will want to run your prism task while you're running your development server, or while e2e tests are running.  There are several different ways to add prism tasks to the grunt task queue.

Usage)

`'prism[:target[:mode]]'`

If `'prism'` is executed by itself then all prism targets will be created.

If a target is supplied (i.e. `'prism:targetOne'`) then only that prism target instance will be created.

If a target and mode are supplied (i.e. `'prism:targetOne:record'`) then only that prism target instance will be created and will be in the record mode.

Basic `grunt serve` example.

```js
grunt.registerTask('serve', function () {
  grunt.task.run([
    'clean:server',
    'compass:server',
    'prism',
    'livereload-start',
    'connect:livereload',
    'open',
    'watch'
  ]);
});
```

Target and mode override example (i.e. `grunt serve:targetOne:record`).

```js
grunt.registerTask('serve', function (target, prismMode) {
  grunt.task.run([
    'clean:server',
    'compass:server',
    'prism:' + target + ':' + prismMode, /* see mode configuration for more details */
    'livereload-start',
    'connect:livereload',
    'open',
    'watch'
  ]);
});
```

### Options

Options pass through directly to `connect-prism`.  See [Options](https://github.com/seglo/connect-prism#options) section in `connect-prism`.

### API features

The API can be enabled in the root prism configuration.  The API is disabled by default.

```js
prism: {
  options: {
    useApi: true
  }
}
```

See the [API features](https://github.com/seglo/connect-prism#api-features) section in `connect-prism` for more details.

## Release History
* 1.0.0 Use connect-prism 1.0.0.  Added API capabilities.
* 0.7.6 Use connect-prism 0.7.5 to fix socket hang up issue by handling aborted requests appropriately ([issue #15](https://github.com/seglo/grunt-connect-prism/issues/15)).
[Issue #527 from node-http-proxy project.](https://github.com/nodejitsu/node-http-proxy/issues/527)
* 0.7.4 Support 'default' instance.
Re-factor tests.
* 0.7.3 Upgrade to connect-prism 0.7.3.
* 0.7.1 Upgrade to connect-prism 0.7.1.
* 0.7.0 Upgrade to connect-prism 0.7.0.  
Fix legacy middleware call.
* 0.6.0 Upgrade to connect-prism 0.6.0.  
Fix spec to use PrismManager.
* 0.5.0 Upgrade to connect-prism 0.5.0.
* 0.4.2 Upgrade to connect-prism 0.4.2.
* 0.4.1 Upgrade to connect-prism 0.4.1.
* 0.3.0 Use connect-prism core library.
* 0.2.2 Support change origin.
* 0.2.1 Fixed record mode and tests so we don't release broken again!
* 0.2.0 Support 'cassettes' by putting mocks into directories named after target.  
Use http-proxy 0.10.4 to workaround around socket hangup issues in 1.1.4.
* 0.1.1 Stop recording all response headers.  
Only capture content-type.
* 0.1.0 Initial release