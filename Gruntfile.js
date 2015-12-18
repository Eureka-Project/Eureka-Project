module.exports = function(grunt) {
	
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		concat: {
			options: {
				seperator: ';'
			},
			
			fuglyclient: {

			},

			fuglylib: {

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
					//file path here
				}
			},
			fuglylib: {
				files: { 
					//file path here
				}
			}
		},

		cssmin: {
      		fuglycss: {
        		files: {
        			//file path here
        		}
      		}
    	}
	});

	grunt.loapNpmTasks('grunt-contrib-uglify');
	grunt.registerTask('default', ['uglify']);

}: