module.exports = function(grunt) {
  "use strict";

  grunt.initConfig({
    clean: ["dist"],
    copy: {
      build: {
        files: [
          {
            expand: true,
            cwd: "./public",
            src: ["**"],
            dest: "./dist/public"
          },
          {
            expand: true,
            cwd: "./views",
            src: ["**"],
            dest: "./dist/views"
          }
        ]
      }
    },
    ts: {
      default: {
        outDir: "dist/src",
        src: ["src/\*\*/\*.ts", "!src/.baseDir.ts"],
        options: {
          "module": "commonjs",
          "target": "es6",
          "sourceMap": false,
          "rootDir": "src"
        }
      }
    },
    watch: {
      ts: {
        files: ["src/\*\*/\*.ts"],
        tasks: ["ts", "express"]
      },
      views: {
        files: ["views/**/*.pug"],
        tasks: ["copy"]
      },
      options: {
        "livereload":  true,
        "spawn": false
      }
    },
    express: {
      options: {
        // Override defaults here
      },
      default: {
        options: {
          script: './bin/www'
        }
      }
    }
  });

  grunt.loadNpmTasks("grunt-contrib-clean");
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-ts");
  grunt.loadNpmTasks('grunt-express-server');
  grunt.loadNpmTasks("grunt-contrib-watch");

  grunt.registerTask("default", [
    "clean",
    "copy",
    "ts",
    "express",
    "watch"
  ]);

};