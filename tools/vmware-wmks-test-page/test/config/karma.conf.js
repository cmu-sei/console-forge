/*********************************************************
 * Copyright (C) 2015-2021 VMware, Inc. All rights reserved.
 *********************************************************/

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '../',


    // frameworks to use
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      //libraries
      'node_modules/jquery/dist/jquery.js',
      'node_modules/jasmine-jquery/lib/jasmine-jquery.js',
      'node_modules/sinon/pkg/sinon.js',
      'node_modules/jquery-ui-dist/jquery-ui.js',

      //templates used as the placeholder for wmks widget
      'view/index.html',

      //test source files
      // '../bower_components/webmks/build/static/wmks/wmks.js',
      // '../wmks/const.js',
      // '../wmks/coreAPI.js',
      // '../wmks/vscancodeMap.js',
      // '../wmks/wmksWidget.js',
      // use sdk download file if in automation jenkins job
      '../wmks.min.js',
      // test cases
      'spec/*.js'
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'wmks/const.js'       : ['coverage'],
      'wmks/wmksWidget.js'  : ['coverage'],
      'wmks/coreAPI.js'     : ['coverage']
    },


    // test results reporter to use
    // reporters: ['progress'],
    reporters: ['progress', 'coverage', 'html', 'junit'],

    // the default configuration
    htmlReporter: {
      outputDir: 'karma_html',
      templatePath: 'node_modules/karma-html-reporter/jasmine_template.html'
    },

    coverageReporter: {
      dir: 'coverage/',

      reporters: [{
        type: 'html',
        subdir: 'report-html'
      }, {
        type: 'cobertura',
        subdir: '.',
        file: 'cobertura.xml'
      }]
    },

    junitReporter: {
      outputFile: 'test-results.xml'
    },

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  });
};