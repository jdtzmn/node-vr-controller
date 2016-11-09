const gulp = require('gulp')
const notify = require('gulp-notify')
const gls = require('gulp-live-server')
const uglify = require('gulp-uglify')
const uglifycss = require('gulp-uglifycss')
const sourcemaps = require('gulp-sourcemaps')
const standard = require('gulp-standard')
const concat = require('gulp-concat')
const babel = require('gulp-babel')

gulp.task('js', function () {
  return gulp.src(['www/lib/**/*.js'])
		.pipe(sourcemaps.init())
			.pipe(standard())
      .pipe(babel({
        presets: ['es2015']
      }))
			.pipe(uglify())
      .pipe(concat('scripts.min.js'))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('./www/dist/js'))
		.pipe(notify({message: 'JS has been compiled.', onLast: true}))
})

gulp.task('css', function () {
  return gulp.src('www/lib/css/**/*.css')
		.pipe(sourcemaps.init())
			.pipe(uglifycss())
			.pipe(concat('styles.min.css'))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('./www/dist/css'))
		.pipe(notify({message: 'CSS has been compiled.', onLast: true}))
})

gulp.task('serve', function () {
  var server = gls.new(['index.js'].concat(process.argv.splice(2)))
  server.start()

  gulp.watch(['www/lib/css/**/*.css', 'www/lib/js/**/*.js', 'www/**/*.html', 'lib/ffmpeg.js'], function (file) {
    setTimeout(function () {
      server.notify.apply(server, [file])
    }, 1000)
  })

  gulp.watch(['index.js', 'lib/ffmpeg.js'], function () {
    server.start.bind(server)()
  })
})

gulp.task('watch', function () {
  gulp.start(['js'])
  gulp.start(['css'])
  gulp.watch('www/lib/js/**/*.js', ['js'])
  gulp.watch('www/lib/css/**/*.css', ['css'])
})

gulp.task('default', function () {
  gulp.start(['watch'])
  gulp.start(['serve'])
})
