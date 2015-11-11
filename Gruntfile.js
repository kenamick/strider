/**
 * Strider Build
 */
'use strict';

var LIVERELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({port: LIVERELOAD_PORT});
var serveStatic = require('serve-static');
var path = require('path');
var pkg = require('./package.json');
var mountFolder = function (connect, dir) {
  return connect().use('/', serveStatic(path.resolve(dir)));
};

module.exports = function (grunt) {
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
  grunt.initConfig({
    watch: {
      scripts: {
        files: [
          'src/**',
          'assets/**',
          'index.html'
        ],
        options: {
          spawn: false,
          livereload: LIVERELOAD_PORT
        },
        tasks: ['build-craftydev']
        // tasks: ['build']
      }
    },
    connect: {
      options: {
        port: 8000,
        // change this to '0.0.0.0' to access the server from outside
        hostname: '0.0.0.0' //'localhost'
      },
      livereload: {
        options: {
          middleware: function (connect) {
            return [
              lrSnippet,
              mountFolder(connect, 'dist')
            ];
          }
        }
      }
    },
    open: {
      server: {
        path: 'http://localhost:8000'
      }
    },
    clean: {
      game: [
        'dist/game.js',
        'dist/lib/crafty.js',
        'dist/lib/gj-js-api.js'
      ],
      dist: [
        'dist/*'
      ]
    },
    copy: {
      dist: {
        files: [
          // includes files within path and its sub-directories
          { expand: true, src: ['assets/images/*.png', 'assets/images/*.gif', 'assets/images/*.jpg'], dest: 'dist/' },
          { expand: true, src: ['assets/sfx/*.ogg', 'assets/sfx/*.m4a'], dest: 'dist/' },
          { expand: true, src: ['assets/fonts/*'], dest: 'dist/' },
          { expand: true, flatten: true, src: ['lib/*'], dest: 'dist/lib/' },
          { expand: true, flatten: true, src: ['LICENSE'], dest: 'dist/' },
          { expand: true, src: ['index.html'], dest: 'dist/' }
        ]
      },
      crafty: {
        files: [
          { expand: true, flatten: true, src: ['Crafty/crafty.js'], dest: 'dist/lib/' },
          { expand: true, src: ['index.html'], dest: 'dist/' }
        ]
      },
      crx: {
        files: [
          {expand: true, src: ['src/chrome.js'], dest: 'dist/', flatten: true},
          {expand: true, src: ['manifest.json'], dest: 'dist/', flatten: true},
          {expand: true, src: ['assets/crx/*.png'], dest: 'dist/', flatten: true}
        ]
      },      
    },
    concat: {
      options: {
        separator: ';',
      },
      dist: {
        src: ['src/traps.js', 'src/loader.js', 'src/menu.js', 'src/game.js'],
        dest: 'dist/game.js',
      },
    },
    replace: {
      dist: {
        options: {
          patterns: [
            {
              match: /@@VERSION/g,
              replacement: pkg.version
            }
          ]
        },
        files: [
          {expand: true, flatten: true, src: ['dist/game.js'], dest: 'dist/'}
        ]
      }
    },
    // browserify: {
    //   build: {
    //     // options: {
    //     //   ignore: ['lodash']
    //     // },
    //     src: ['src/*.js'],
    //     dest: 'dist/game.js'
    //   }
    // },
    uglify: {
      dist: {
        options: {
          report: 'min',
          preserveComments: false,
          banner: '<%= grunt.file.read("src/header.txt") %>'
        },
        files: {
          'dist/game.min.js': ['dist/game.js']
        }
      }
    },
    processhtml: {
      dist: {
        files: {
          'dist/index.html': ['index.html']
        }
      }
    },
    compress: {
      main: {
        options: {
          archive: 'strider-v' + pkg.version + '.zip'
        },
        files: [
          {expand: true, cwd: 'dist/', src: ['**/*']}, 
        ]
      }
    }
  });

  grunt.registerTask('build', ['concat', 'replace', 'copy']);
  grunt.registerTask('build-craftydev', ['concat', 'replace', 'copy:crafty']);
  grunt.registerTask('serve', ['build', 'connect:livereload', 'open', 'watch']);
  grunt.registerTask('default', ['serve']);
  grunt.registerTask('prod', ['build', 'uglify', 'processhtml', 'clean:game']);
  grunt.registerTask('zip', ['prod', 'compress']);
  grunt.registerTask('crx', ['prod', 'copy:crx']);
};
