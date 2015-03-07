module.exports = function(grunt) {
    'use strict';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        mochaTest: {
            specs: {
                options: {
                    ui: 'bdd',
                    reporter: 'spec',
                    require: './specs/helpers/chai'
                },
                src: ['specs/**/*.spec.js']
            }
        },
        nodemon: {
            dev: {
                script: 'index.js'
            }
        }
    });

    /////////////////////////////////////////////

    grunt.loadNpmTasks('grunt-mocha-test');
    
    grunt.loadNpmTasks('grunt-nodemon');
    // Default task(s).
    grunt.registerTask('default', ['mochaTest', 'nodemon']);

    grunt.registerTask('mocha', ['mochaTest']);

};
