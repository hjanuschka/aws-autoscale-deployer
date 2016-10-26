module.exports = function (grunt) {
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
        }
    });

    // Default task(s).
    grunt.registerTask('default', ['eslint', 'mochaTest']);
    grunt.registerTask('test', ['mochaTest']);

};
