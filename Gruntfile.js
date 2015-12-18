module.exports = function(grunt) {
	
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

    // watch: {
    //   scripts: {
    //     files: [
    //     	'public/app/**/*.js',
    //       'public/app/controllers/**/*.js',
    //       'public/app/services/**/*.js'
    //    //    'server/**/*.js',
    //    //    'server/db/**/*.js',
    //    //    'server/links/**/*.js',
    // 			// 'server/users/**/*.js',

    //     ],
    //     tasks: [
    //       'concat',
    //       'uglify'
    //     ]
    //   },

    //   css: {
    //     files: 'public/*.css',
    //     tasks: ['cssmin']
    //   }
    // },

		concat: {
			options: {
				seperator: ';'
			},

			fuglyclient: {
				src: ['public/app/app.js', 'public/app/controllers/auth.js', 'public/app/controllers/home.js', 'public/app/services/authServices.js', 'public/app/services/data.js'],
				dest: 'public/dist/client.js'
			},

			fuglyserver: {
				src: ['server/helpers.js', 'server/db/configdb.js', 'server/links/linksContoller.js', 'server/links/linksRoute.js', 'server/users/usersController.js', 'server/users/usersRoutes.js'],
				dest: 'server/dist/server.js'
			}
		},
		
		// nodemon: {
		// 	dev: {
		// 		script: server.js
		// 	}
		// },

		uglify: {
			fuglyclient: {
				files: {
					'public/dist/client.min.js': ['public/dist/client.js']
				}
			},
			fuglyserver: {
				files: {
					'server/dist/server.min.js': ['server/dist/server.js']
				}
			}
		},

		cssmin: {
      		fuglycss: {
        		files: {
        			'public/dist.style.min.css': ['public/style.css']
        		}
      		}
    	}
    	
    	// shell: {
    	// 	prodServer: {
    	// 	}
    	// }

	});

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-shell');
	grunt.loadNpmTasks('grunt-nodemon');


	grunt.registerTask('default', ['concat', 'uglify']);

};