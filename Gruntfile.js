module.exports = function(grunt) {
	'use strict';

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			build: {
				src: 'js/backbone.responsiverouter.js',
				dest: 'dist/backbone.responsiverouter.min.js'
			}
		},
		jshint: {
			files: ['js/**/*.js'],
			options: {
				jshintrc: true
			}
		},
		copy: {
			main: {
				cwd: 'js/',
				src: '*.js',
				dest: 'dist/',
				filter: 'isFile',
				flatten: true
			},
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-testem');
	grunt.loadNpmTasks('grunt-release');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-copy');

	grunt.registerTask('default', ['jshint', 'copy', 'uglify']);

};