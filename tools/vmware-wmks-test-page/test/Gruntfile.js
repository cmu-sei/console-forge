/*********************************************************
 * Copyright (C) 2015 VMware, Inc. All rights reserved.
 *********************************************************/
module.exports = function(grunt) {
   require('load-grunt-tasks')(grunt);
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        karma: {
              unit: {
                configFile: './config/karma.conf.js',
                singleRun: true,
                autoWatch: true,
                logLevel: 'DEBUG'
              }
        }
    });

    // unit test target
    grunt.registerTask('test', ['karma:unit']);
    grunt.registerTask('default', ['karma:unit']);
};
