var gulp = require('gulp');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var autoprefixer = require('gulp-autoprefixer');
var babel = require('gulp-babel');
var concat = require('gulp-concat');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var minifycss = require('gulp-minify-css');
var sass = require('gulp-sass');
var csslint = require('gulp-csslint');
var cssComb = require('gulp-csscomb');
var cmq = require('gulp-combine-media-queries');
var frontnote = require('gulp-frontnote');
var minifyHtml = require('gulp-minify-html');
var iconfont = require('gulp-iconfont');
var consolidate = require('gulp-consolidate');
var clean = require('gulp-clean');
var notify = require('gulp-notify');
var deploy = require('gulp-gh-pages');
// var browserSync = require('browser-sync');
var browserSync = require('browser-sync').create();
var reload = browserSync.reload;

//////////////////////////////////////////
// CUSTOM GLOBALS
//////////////////////////////////////////

// DEFAULT PATHS
var paths = {
 srcDir: "./src/",
 buildDir: "./build/",
 srcStyles: './src/styles/**/*.{scss,sass}',
 buildStyles: './build/styles/',
 srcVendorScripts: './src/scripts/vendor/**/*.js',
 buildVendorScripts: './build/scripts/vendor/',
 srcScripts: './src/scripts/**/*.js',
 buildScripts: './build/scripts/',
 srcTemplates: './src/**/*.html', '!./src/index.html',
 buildTemplates: './build/views/',
 srcImages: './src/images/**/*',
 buildImages: './build/images/'
};

//////////////////////////////////////////
// TASKS
//////////////////////////////////////////

// BROWSER SYNC TASK
/* Static Server Setup */
gulp.task('browser-sync', ['clean'],function() {
  browserSync({
    server: {
       baseDir: paths.srcDir
    }
  });
});
/* Reload And Stream Setup */
gulp.task('reload',function(){
	reload({stream:true});
});

// CLEAN TASK
/* Deletes Build Directory */
gulp.task('clean', function() {
 return gulp.src(paths.buildDir)
 .pipe(clean());
 .pipe(notify('CLEAN TASK FINISHED'));
});

// COPY TO BUILD TASK
/* Copy Extra Files From src To build */
gulp.task('copy', ['clean'], function() {
 /* Copy Index.html */
 gulp.src(paths.srcDir + 'index.html')
  .pipe(gulp.dest(paths.buildDir + 'index.html'));
  .pipe(notify('COPY TASK FINISHED'));
});

// SASS TASK
gulp.task('sass', ['clean'],function(){
	gulp.src([ paths.srcStyles ])
		.pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
			}
		}))
    /* Builds Out StyleSheet Docs To Build Folder */
		.pipe(frontnote({
			out: './build/styles/docs/'
		}))
		.pipe(sass())
		.pipe(autoPrefixer())
		.pipe(cssComb())
		.pipe(cmq())
		.pipe(csslint())
    /* TO DO: ADD STYLISH REPORTER */
		.pipe(csslint.reporter())
		.pipe(concat('styles.css'))
		.pipe(gulp.dest(paths.buildStyles))
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(minifyCss())
		.pipe(gulp.dest(paths.buildStyles))
		.pipe(notify('SASS TASK FINISHED'));
});

// VENDOR SCRIPTS TASK
/* Builds Concat/Uglified Vendor Scripts File */
gulp.task('vendorScripts', ['clean'],function(){
	gulp.src([ paths.srcVendorScripts ])
		.pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
			}
		}))
		.pipe(concat('vendor.js'))
		.pipe(jshint())
  		.pipe(jshint.reporter('default'))
    .pipe(babel())
		.pipe(gulp.dest(paths.buildVendorScripts))
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(uglify())
		.pipe(gulp.dest(paths.buildVendorScripts))
  	.pipe(notify('VENDOR SCRIPTS TASK FINISHED'));
});

// SCRIPTS TASK
/* Builds Concat/Uglified Scripts File */
gulp.task('scripts', ['clean'],function(){
	gulp.src([ paths.srcScripts ])
		.pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
			}
		}))
		.pipe(concat('scripts.js'))
    /* TO DO: ADD STYLISH REPORTER */
		.pipe(jshint())
  		.pipe(jshint.reporter('default'))
    .pipe(babel())
		.pipe(gulp.dest(paths.buildScripts))
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(uglify())
		.pipe(gulp.dest(paths.buildScripts))
  	.pipe(notify('SCRIPTS TASK FINISHED'));
});

// TEMPLATES TASK
gulp.task('templates', ['clean'],function(){
  /* Ignores Index.html */
	gulp.src([ paths.srcTemplates ])
		.pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
			}
		}))
		.pipe(minifyHtml())
		.pipe(gulp.dest(paths.buildTemplates))
		.pipe(notify('TEMPLATES TASK FINISHED'));
});

// IMAGES TASK
gulp.task('images', ['clean'],function(){
	gulp.src([ paths.srcImages ])
		.pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
			}
		}))
    .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
    .pipe(gulp.dest(paths.buildImages));
    .pipe(notify('IMAGE TASK FINISHED'));
});

// FONTS TASK
gulp.task('iconfont', ['clean'],function(){
	gulp.src(['./src/fonts/**/*.svg'])
		.pipe(iconfont({
			fontName: 'font'
		}))
		.on('codepoints', function(codepoints) {
			var options = {
				glyphs: codepoints,
				fontName: 'font',
				fontFamily: 'font',
				className: 'icon',
				timestamp: Date.now()
			};
			gulp.src('./src/fonts/template/**/*.css')
				.pipe(consolidate('lodash', options))
				.pipe(rename({
					basename:'font'
				}))
				.pipe(gulp.dest('./build/fonts/template'));
			gulp.src('./src/fonts/template/**/*.html')
				.pipe(consolidate('lodash', options))
				.pipe(rename({
					basename:'font'
				}))
				.pipe(gulp.dest('./build/fonts/template'));
		})
		.pipe(gulp.dest('./build/fonts/'));
    .pipe(notify('FONTS TASK FINISHED'));
});

// DEFAULT GULP TASK
/* Builds Dev Environment */
gulp.task('default', ['browser-sync'], function(){
	browserSync.init({
        server: paths.srcDir
    });
  gulp.watch(paths.srcVendorScripts,['vendorScripts','reload']);
	gulp.watch(paths.srcScripts,['scripts','reload']);
	gulp.watch(paths.srcStyles,['sass','reload']);
	gulp.watch(paths.srcTemplates,['templates','reload']);
	gulp.watch(paths.srcImages,['images','reload']);
	gulp.watch('./src/fonts/**/*.svg',['iconfont','reload']);
  .pipe(notify('DEFAULT TASK RUNNING'));
});

// DEPLOY TASK
/* TO DO: BUILD TO PROD ENVIRONMENT */
gulp.task('deploy', function () {
  return gulp.src("./build/**/*")
    .pipe(deploy())
    .pipe(notify('DEPLOY TASK COMPLETE'));
});
