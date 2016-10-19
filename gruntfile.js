'use strict';

module.exports = function(grunt) {
    /* eslint-disable global-require */
    require('load-grunt-tasks')(grunt);
    /* eslint-enable global-require */

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        eslint: {
            target: ['*.js']
        },
        mochaTest: {
            options: {
                reporter: 'spec',
                recursive: true
            },
            src: 'test/**/*.js'
        }
    });

    // Default task(s).
    grunt.registerTask('default', ['eslint', 'mochaTest']);
    grunt.registerTask('test', ['mochaTest']);

};
