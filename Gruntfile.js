'use strict';
module.exports = function(grunt) {

	var semver = require( 'semver' );

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			dev: {
				options: {
					banner: '/*! <%= pkg.name %> v<%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
					beautify: true,
					mangle: false
				},
				files: {
					'dist/backbone.responsiverouter.js': ['js/backbone.responsiverouter.js']
				}
			},
			min: {
				options: {
					banner: '/*! <%= pkg.name %> v<%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
				},
				files: {
					'dist/backbone.responsiverouter.min.js': ['js/backbone.responsiverouter.js']
				}
			}
		},
		jshint: {
			files: ['js/**/*.js'],
			options: {
				jshintrc: true
			}
		},
		testem: {
			env1: {
				src: [
					'js/*.js',
					'test/*.js'
				],
				options: {
					parallel: 8,
					launch_in_ci: ['PhantomJS'],
					launch_in_dev: ['Chrome'],
					test_page: 'test/index.html'
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-testem');
	grunt.loadNpmTasks('grunt-release');
	grunt.loadNpmTasks('grunt-contrib-jshint');

	grunt.registerTask('default', ['jshint', 'bump', 'uglify']);

	grunt.registerTask('bump', 'Bumps version nr of pkg.', function(part) {
		if(!part) part = 'patch';
		var version = semver.inc(grunt.config.get('pkg.version'), part);
		grunt.config.set('pkg.version', version);
	});

};