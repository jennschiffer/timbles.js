module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      all: 'timbles.js'
    },
    jscs: {
      src: 'timbles.js',
      options: {
        config: '.jscsrc',
        verbose: true // Create output with rule names
      }
    }
  });

  // Load the JSHint and JSCS plugins.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-jscs');

  // Default task(s).
  grunt.registerTask('default', ['jshint', 'jscs']);
};
