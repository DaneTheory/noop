var gulp = require('gulp');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');
var babel = require("gulp-babel");
var concat = require('gulp-concat');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var minifyCss = require('gulp-minify-css');
var sass = require('gulp-sass');
var csslint = require('gulp-csslint');
var minifyHtml = require('gulp-minify-html');
var iconfont = require('gulp-iconfont');
var consolidate = require('gulp-consolidate');
var clean = require('gulp-clean');
var notify = require('gulp-notify');
var deploy = require('gulp-gh-pages');
var uncss = require('gulp-uncss');
var nano = require('gulp-cssnano');
var stylish = require('jshint-stylish');
var size = require('gulp-filesize');
var imageminJpegoptim = require('imagemin-jpegoptim');
var imageminSvgo = require('imagemin-svgo');
var imageminWebp = require('imagemin-webp');
var imageminGifsicle = require('imagemin-gifsicle');
var imageminOptipng = require('imagemin-optipng');
// var browserSync = require('browser-sync');
var browserSync = require('browser-sync');
var reload = browserSync.reload;

//////////////////////////////////////////
// CUSTOM GLOBALS
//////////////////////////////////////////

// DEFAULT PATHS
var paths = {
 srcDir: "./src/",
 buildDir: "./build/",
 srcStyles: './src/styles/**/*.+(scss|sass)',
 buildStyles: './build/styles/',
 srcVendorScripts: './src/scripts/vendor/**/*.js',
 buildVendorScripts: './build/scripts/vendor/',
 srcScripts: './src/scripts/custom/**/*.js',
 buildScripts: './build/scripts/custom/',
 srcTemplates: './src/views/**/*.html',
 buildTemplates: './build/views/',
 srcImages: './src/images/**/*',
 buildImages: './build/images/'
};

//////////////////////////////////////////
// TASKS
//////////////////////////////////////////

//////////////////
// Browser Reload
//////////////////

// BROWSER SYNC TASK
/* Static Server DEV Setup */
gulp.task('bsDev',function() {
  browserSync.init({
        server: paths.srcDir,
        port: 8800
  })
});
/* Static Server PROD Setup */
gulp.task('bsProd', ['buildMaster'],function() {
  browserSync.init({
        server: paths.buildDir,
        port: 8880
  })
});
/* Reload And Stream Setup */
gulp.task('reload',function(){
	reload({stream:true});
});


//////////////////
// Cleaning
//////////////////

// MAIN CLEAN TASK
/* Deletes Build Directory */
gulp.task('clean', function() {
 return gulp.src(paths.buildDir)
 .pipe(clean())
 .pipe(notify('MAIN CLEAN TASK FINISHED'));
});

// STYLES CLEAN TASK
/* Deletes Styles Directory */
gulp.task('stylesClean', function() {
 return gulp.src(paths.buildStyles)
 .pipe(clean())
 .pipe(notify('STYLES CLEAN TASK FINISHED'));
});

// VENDOR SCRIPTS CLEAN TASK
/* Deletes Vendor Scripts Directory */
gulp.task('vendorScriptsClean', function() {
 return gulp.src(paths.buildVendorScripts)
 .pipe(clean())
 .pipe(notify('VENDOR SCRIPTS CLEAN TASK FINISHED'));
});

// CUSTOM SCRIPTS CLEAN TASK
/* Deletes Custom Scripts Directory */
gulp.task('customScriptsClean', function() {
 return gulp.src(paths.buildScripts)
 .pipe(clean())
 .pipe(notify('CUSTOM SCRIPTS CLEAN TASK FINISHED'));
});

// TEMPLATES CLEAN TASK
/* Deletes Views Directory */
gulp.task('templatesClean', function() {
 return gulp.src(paths.buildTemplates)
 .pipe(clean())
 .pipe(notify('TEMPLATES CLEAN TASK FINISHED'));
});

// INDEX CLEAN TASK
/* Deletes index.html */
gulp.task('indexClean', function() {
 return gulp.src(paths.buildDir + 'index.html')
 .pipe(clean())
 .pipe(notify('INDEX CLEAN TASK FINISHED'));
});

// IMAGES CLEAN TASK
/* Deletes Images Folder in Build Directory */
gulp.task('imagesClean', function() {
 return gulp.src(paths.buildImages)
 .pipe(clean())
 .pipe(notify('IMAGES CLEAN TASK FINISHED'));
});


//////////////////
// File Copy
//////////////////

// MAIN COPY TO BUILD TASK
/* Copy Extra Files From src To build */
gulp.task('copy', ['clean'], function() {
 /* Copy Index.html */
 gulp.src(paths.srcDir)
  .pipe(gulp.dest(paths.buildDir))
  .pipe(notify('COPY TASK FINISHED'));
});

// COPY INDEX TO BUILD TASK
/* Copy Index.html File From src To build */
gulp.task('copyIndex', ['indexClean'], function() {
 /* Copy Index.html */
 gulp.src(paths.srcDir + 'index.html')
  .pipe(gulp.dest(paths.buildDir))
  .pipe(notify('COPY INDEX TASK FINISHED'));
});


//////////////////
// Styles
//////////////////

// STYLES TASK
gulp.task('styles', ['stylesClean'],function(){
	return gulp.src([ paths.srcStyles ])
    .pipe(sourcemaps.init())
    .pipe(sass({
      errLogToConsole: true
    }))
    .pipe(autoprefixer())
    .pipe(csslint())
    /* TO DO: ADD STYLISH REPORTER */
    .pipe(concat('styles.css'))
    .pipe(uncss({
      html: ['./src/**/*.html']
    }))
    .pipe(csslint.reporter())
    .pipe(sourcemaps.write("/maps"))
		.pipe(gulp.dest(paths.buildStyles))
    .pipe(rename({
		    suffix: '.min'
		  }))
		.pipe(minifyCss())
    .pipe(nano())
    .pipe(gulp.dest(paths.buildStyles))
    .pipe(notify('STYLES TASK FINISHED'))
});


//////////////////
// Scripts
//////////////////

// VENDOR SCRIPTS TASK
/* Builds Concat/Uglified Vendor Scripts File */
gulp.task('vendorScripts', ['vendorScriptsClean'],function(){
	return gulp.src([ paths.srcVendorScripts ])
		.pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
			}
		}))
    .pipe(babel())
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'))
		.pipe(concat('vendor.js'))
		.pipe(gulp.dest(paths.buildVendorScripts))
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'))
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(uglify())
		.pipe(gulp.dest(paths.buildVendorScripts))
  	.pipe(notify('VENDOR SCRIPTS TASK FINISHED'));
});

// SCRIPTS TASK
/* Builds Concat/Uglified Scripts File */
gulp.task('scripts', ['customScriptsClean'],function(){
	return gulp.src([ paths.srcScripts ])
		.pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
			}
		}))
    .pipe(babel())
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'))
		.pipe(concat('scripts.js'))
		.pipe(gulp.dest(paths.buildScripts))
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'))
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(uglify())
		.pipe(gulp.dest(paths.buildScripts))
  	.pipe(notify('SCRIPTS TASK FINISHED'));
});


//////////////////
// HTML
//////////////////

// TEMPLATES TASK
gulp.task('templates', ['templatesClean'],function(){
  /* Ignores Index.html */
	return gulp.src([ paths.srcTemplates ])
		.pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
			}
		}))
		.pipe(minifyHtml())
		.pipe(gulp.dest(paths.buildTemplates))
		.pipe(notify('ALL TEMPLATES TASK FINISHED'));
});

// INDEX TEMPLATE TASK
gulp.task('indexTemplate', ['indexClean', 'copyIndex'],function(){
  /* Ignores Index.html */
	return gulp.src([ paths.srcTemplates + 'index.html' ])
		.pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
			}
		}))
		.pipe(minifyHtml())
		.pipe(gulp.dest(paths.buildDir))
		.pipe(notify('INDEX.HTML BUILD TASK FINISHED'));
});


//////////////////
// IMAGES
//////////////////

// IMAGES OPTIMIZATION TASK
gulp.task('imageOpti', ['imagesClean'],function(){
	return gulp.src([ paths.srcImages ])
		.pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
			}
		}))
    .pipe(cache(imagemin({
        optimizationLevel: 5,
        progressive: true,
        interlaced: true,
        multipass: true,
        use: [
           imageminJpegoptim(),
           imageminSvgo(),
           imageminWebp({quality: 50}),
           imageminGifsicle({interlaced: true})
        ]
      })))
    .pipe(size())
    .pipe(gulp.dest(paths.buildImages))
});

// IMAGE BUILD TASK
gulp.task('images', ['imageOpti'],function(){
  return gulp.src([ paths.buildImages ])
  .pipe(size())
  .pipe(notify('IMAGES OPTIMIZED'))
});



// FONTS TASK
// gulp.task('iconfont', ['clean'],function(){
// 	gulp.src(['./src/fonts/**/*.svg'])
// 		.pipe(iconfont({
// 			fontName: 'font'
// 		}))
// 		.on('codepoints', function(codepoints) {
// 			var options = {
// 				glyphs: codepoints,
// 				fontName: 'font',
// 				fontFamily: 'font',
// 				className: 'icon',
// 				timestamp: Date.now()
// 			};
// 			gulp.src('./src/fonts/template/**/*.css')
// 				.pipe(consolidate('lodash', options))
// 				.pipe(rename({
// 					basename:'font'
// 				}))
// 				.pipe(gulp.dest('./build/fonts/template'));
// 			gulp.src('./src/fonts/template/**/*.html')
// 				.pipe(consolidate('lodash', options))
// 				.pipe(rename({
// 					basename:'font'
// 				}))
// 				.pipe(gulp.dest('./build/fonts/template'));
// 		})
// 		.pipe(gulp.dest('./build/fonts/'))
//     .pipe(notify('FONTS TASK FINISHED'));
// });

// DEFAULT GULP TASK
/* Builds Dev Environment */
gulp.task('default', ['bsDev'], function() {
  gulp.watch(paths.srcTemplates + 'index.html',['indexTemplate','reload']);
  gulp.watch(paths.srcTemplates,['templates','reload']);
  gulp.watch(paths.srcStyles,['styles','reload']);
  gulp.watch(paths.srcVendorScripts,['vendorScripts','reload']);
	gulp.watch(paths.srcScripts,['scripts','reload']);

	gulp.watch(paths.srcImages,['images','reload']);
	// gulp.watch('./src/fonts/**/*.svg',['iconfont','reload'])
  console.log("SERVER FROM SRC");
});

/* Server Run PROD Environment */
gulp.task('runProd', ['bsProd'], function() {
  console.log("SERVER FROM BUILD");
});

/* Master BUILD */
gulp.task('buildMaster', ['indexTemplate','templates','styles','vendorScripts','scripts','images'], function() {
  return gulp.src([ paths.srcDir ])
    .pipe(notify('MASTER BUILD'))
  .pipe(gulp.dest(paths.buildDir))
});

// DEPLOY TASK
/* TO DO: BUILD TO PROD ENVIRONMENT */
gulp.task('deploy', function () {
  return gulp.src("./build/**/*")
    .pipe(deploy())
    .pipe(notify('DEPLOY TASK COMPLETE'));
});
