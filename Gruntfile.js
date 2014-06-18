module.exports = function(grunt) {

  grunt.initConfig({
    jshint: {
      all: ['public/js/*.js']
    },
    watch: {
      files: [
        'Gruntfile.js',
        'public/js/*.js',
        'public/index.html'
      ],
//      tasks: ['jshint'],
      options: {
        livereload: true
      }
    }
  });

//  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default');
//  grunt.registerTask('default', ['jshint']);
};
