module.exports = function (grunt) {
  grunt.initConfig({
    clean: {
      cleanAll: ['public/dist'],
      cleanJS: ['public/dist/main.js', 'public/dist/back.js']
    },
    concat: {
      options: {
      },
      frontDist: {
        src: ['public/javascripts/front/*.js', 'public/javascripts/common/*.js'],
        dest: 'public/dist/main.js'
      },
      backDist: {
        src: ['public/javascripts/back/*.js'],
        dest: 'public/dist/back.js'
      }
    },
    uglify: {
      frontJS: {
        src: 'public/dist/main.js',
        dest: 'public/dist/main.min.js'
      },
      backJS: {
        src: 'public/dist/back.js',
        dest: 'public/dist/back.min.js'
      }
    },
    cssmin: {
      frontCss: {
        src: 'public/stylesheets/style.css',
        dest: 'public/dist/main.min.css'
      },
      backCss: {
        src: 'public/stylesheets/back.css',
        dest: 'public/dist/back.min.css'
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-css');

  grunt.registerTask('default', ['clean:cleanAll', 'concat', 'uglify', 'cssmin', 'clean:cleanJS']);
}