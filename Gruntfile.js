
var stylesheetsDir = 'public/stylesheets';
var javascriptDir = 'public/javascripts';
var path = require('path');

module.exports = function(grunt){
  
  // load plugins
  [
    'grunt-cafe-mocha',
    'grunt-contrib-jshint',
    'grunt-exec',
    'grunt-link-checker',
    'grunt-contrib-stylus',
    'grunt-autoprefixer',
    'grunt-contrib-cssmin',
    'grunt-contrib-jade',
    'grunt-contrib-uglify',
    'grunt-contrib-watch',
    'grunt-hashres',
    'grunt-lint-pattern'
  ].forEach(function(task){
    grunt.loadNpmTasks(task);
  });

  // configure plugins
  grunt.initConfig({
    
    jshint: {
      app: ['app.js', 'bin/www', 'routes/*.js', 'public/javascripts/**/*.js', 'lib/**/*.js', 'views/**/*.js', '!public/javascripts/**/*.min.*.js'],
      qa: ['Gruntfile.js', 'public/qa/**/*.js', 'qa/**/*.js']
    },

    exec: {
      startServer:  
      //{cmd: 'node ./bin/wwwTest &'},
      {cmd: 'pm2 start ./bin/wwwTest -f'},
      assetsPreload:
        {cmd: 'node ./assets-preload.js'},
      //{cmd: 'sh ./restart.sh'},
      linkchecker:
        {cmd: 'linkchecker http://127.0.0.1'},
      endServer:
      //{cmd: 'sudo kill -9 "$(ps -aux | grep wwwTest| grep node | awk \'{ print $2 }\')"'},
      {cmd: 'pm2 delete ./bin/wwwTest'},
    },

    linkChecker: {
      dev: {
         site: '127.0.0.1',
         options: {
           initialPort: 3001,
	         timeout: 10000,
           listenerTTL: 10000,
           /*callback: function(crawler) {
              crawler.addFetchCondition(function(url) {
                return url != 'http:/127.0.0.1:3001/fonts/glyphicons-halflings-regular.woff2'; 
              });
           }*/
         }  
      }
    },

    cafemocha: {
      tdd: { src: 'qa/unit/*-test.js', options: { ui: 'tdd', timeout: 5000 }, },
      bdd: { src: 'qa/spec/*-test.js', options: { ui: 'bdd', timeout: 5000 }, },
      stress: { src: 'qa/stress/*-test.js', options: { ui: 'bdd', timeout: 5000 }, },
      api: { src: 'qa/api/*-test.js', options: { ui: 'bdd', timeout: 5000 }, }
    },

    stylus: {
      compile: {
        options: {
	     paths: ['/views'],
         // urlfunc: 'embedurl', // use embedurl('test.png') in our code to trigger Data URI embedding
          use: [

              //TODO: inject ennvironmet to use in _st function
              require('./lib/stylus-functions')  // add function st to obtain url(...) resource string
          ],

          import: [ 
            'nib/*'  
          ]
        },
        files: {
          'public/stylesheets/style.css' : 'views/_css/style.styl',
          'public/stylesheets/stylus-example.css' : 'views/stylus-example/css/stylus-example.styl'
        }
      }
    },

    autoprefixer: {
      compile: {
        files: {
          'public/stylesheets/style.css' : 'public/stylesheets/style.css',
          'public/stylesheets/stylus-example.css' : 'public/stylesheets/stylus-example.css'
        }
      }
    }, 

    cssmin: {
      /*clean: {
        files: {
          'public/stylesheets/style.min.css' : 'public/stylesheets/style.css',
          'public/stylesheets/stylus-example.min.css' : 'public/stylesheets/stylus-example.css'
        }
      }*/
      combine: {
        files: {
          'public/stylesheets/style.css': 'public/stylesheets/*.css'
        }
      },
      minify: {
          src: 'public/stylesheets/style.css',
          dest: 'public/stylesheets/style.min.css'
        }
    },

    jade: {
      compile: {
        options: {
          basedir: "/home/node/expressApp/views/"
        },
        files: [{
          expand: true,
          cwd: "views",
          src: "*.jade",
          dest: "html",
          ext: ".html"}]
      }
    },

    uglify: {
      /*project: {
        options: {
          mangle: false
        },
        files: {
          'public/javascripts/index.min.js': 'views/_js/index.js',
          'public/javascripts/stylus-example.min.js': 'views/stylus-example/js/stylus-example.js'          
        }
      }*/
      all: {
        files: {
          'public/javascripts/index.min.js': ['views/_js/*.js', 'views/**/js/*.js']
        }
      }
    },

    watch: {
      stylus: {
        files: [ 'views/**/*.styl' ],
        tasks: ['stylus', 'autoprefixer', 'cssmin', 'hashres']
      }
     /* jade: {
        files: [ 'views/*.jade' ],
        tasks: ['jade']
      }*/
    },

    hashres: {
      options: {
        fileNameFormat: '${name}.${hash}.${ext}'
      },
      all: {
          src: ['public/javascripts/index.min.js',
                'public/stylesheets/style.min.css',
                ],
          dest: ['views/_layouts/main.jade']
      }
    },


    lint_pattern: {
      view_statics : {
        options: {
          rules: [
            {
              pattern: /link\((.)*href=(?!["']#\{_st\()(?!["']\/assets\/)(?!file\.url)(?!["']\/vendor\/mocha\/)/,
              message: 'Un-mapped static resource found in <link>'
            },
            {
              pattern: /script\((.)*src=(?!["']#\{_st\()(?!["']\/assets\/)(?!file\.url)(?!["']\/vendor\/mocha\/)(?!["']\/vendor\/chai\/)(?!["']\/tests\/)/,
              message: 'Un-mapped static resource found in <script>'
            },
            {
              pattern: /img\((.)*src=["'](?!#\{_st\()/,
              message: 'Un-mapped static resource found in <img>'
            }
          ]
        },
        files: {
          src: [
            'views/**/*.jade'
          ]
        }
      },
      css_statics: {
        options: {
          rules: [
            {
              pattern: /url\(/,
              message: 'Un-mapped static found in stylus property'
            }
          ]
        },
        files: {
          src: [
              'views/**/*.styl'
          ]
        }
      }
    }

  });


  // Hack per poder correr algunes tasques amb force i altre no

  var previous_force_state = grunt.option("force");

  grunt.registerTask("force",function(set){
      if (set === "on") {
          grunt.option("force",true);
      }
      else if (set === "off") {
          grunt.option("force",false);
      }
      else if (set === "restore") {
          grunt.option("force",previous_force_state);
      }
  });


  // register tasks
  grunt.registerTask('test', ['jshint', 'lint_pattern', 'exec:assetsPreload', 'force:on', 'exec:startServer', 'exec:linkchecker', 'exec:endServer', 'force:off', 'cafemocha']);
  grunt.registerTask('deploy', ['stylus', 'autoprefixer', 'cssmin', 'uglify', 'hashres']);
  
};
