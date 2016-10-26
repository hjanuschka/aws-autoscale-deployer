module.exports = function(grunt) {
    /* eslint-disable */
    require('load-grunt-tasks')(grunt);
    /* eslint-enable */

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        eslint: {
            target: ['.']
        },
        mochaTest: {
            options: {
                reporter: 'spec',
                recursive: true
            },
            src: 'test/**/*.js'
        },
        env: {
            dev: {
                NODE_ENV: 'dev',
                AWS_ACCESS_KEY_ID: 'access_key',
                AWS_SECRET_ACCESS_KEY: 'secret_key'
            }
        }
    });

    // Default task(s).
    grunt.registerTask('default', ['eslint', 'test']);
    grunt.registerTask('test', ['env:dev', 'mochaTest']);

};
