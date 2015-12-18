module.exports = function(grunt) {
	
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		concat: {
			options: {
				seperator: ';'
			},

			fuglyclient: {
				src: [],
				dest: 'public/dist/client.js'
			}
		},
		
		nodemon: {
			dev: {
				script: sever.js
			}
		},

		uglify: {
			fuglyclient: {
				files: {
					'public/dist/client.min.js': ['public/dist/client.js']
				}
			}
		},

		cssmin: {
      		fuglycss: {
        		files: {
        			'public/dist.style.min.css': ['public/style.css']
        		}
      		}
    	},

    	shell: {
    		prodServer: {
    		}
    	}

	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-mocha-test');
	grunt.loadNpmTasks('grunt-shell');
	grunt.loadNpmTasks('grunt-nodemon');


	grunt.registerTask('default', ['uglify']);

}: