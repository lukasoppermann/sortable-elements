'use strict';
/* ---------- */
/* setup */
var gulp = require('gulp');
var rename = require('gulp-rename');
var del = require('del');
var bump = require('gulp-bump');
var semver = require('semver');
var shell = require('gulp-shell');
var minimist = require('minimist');
var prompt = require('gulp-prompt');
var jshint = require('gulp-jshint');
var jscs = require('gulp-jscs');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var strip = require('gulp-strip-code');
/* ---------- */
/* linting */
gulp.task('lint', function() {
  gulp.src([
    'src/sortable-elements.src.js'
  ])
    .pipe(jscs())
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'))
    ;
});
/* ---------- */
/* build */
gulp.task('build-version', function() {
  // clear dist
  del.sync('./dist/*', {force: true});
  // copy files to dist
  gulp.src(['src/sortable-elements.src.js'])
    .pipe(strip({
        //jscs:disable
        start_comment: 'start-testing',
        end_comment: 'end-testing'
        //jscs:enable
    }))
    .pipe(rename('sortable-elements.js'))
    .pipe(gulp.dest('./dist'))
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(uglify())
    .pipe(jshint())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist'))
    // remove umd
    .on('end', function() {
      del.sync('./src/sortable-elements.js', {force: true});
    });

});
/* bump version */
gulp.task('bump-version', function() {
  var msg = 'Are you sure you want to bump the version to ';
  if (process.argv.slice(2) === 'publish') {
    msg = 'Are you sure you want to publish the version ';
  }

  var args = minimist(process.argv.slice(3));
  var v = args.v || args.version;
  if (v === undefined) {
    v = semver.inc(require('./package.json').version, 'patch');
  }

  return gulp.src(['./package.json', './bower.json'])
    .pipe(prompt.confirm(msg + v))
    .pipe(bump({version: v}))
    .pipe(gulp.dest('./'));
});

gulp.task('add-files', ['bump-version'], function() {
  var v = require('./package.json').version;
  return gulp.src([])
    .pipe(shell([
      "git add ./package.json ./bower.json ./dist/* && git commit -m 'bump to version v"+v+"'"
    ]))
});
/* tag version */
gulp.task('tag-version', ['add-files'], function() {
  var args = minimist(process.argv.slice(3));
  var v = args.v || args.version;
  if (v === undefined) {
    delete require.cache[require.resolve('./package.json')];
    v = require('./package.json').version;
  }
  return gulp.src('')
    .pipe(shell([
      'git tag v' + v
    ]));
});
/* publish version */
gulp.task('publish-version', ['tag-version'], function() {
  return gulp.src('')
    .pipe(shell([
      'git push --tags'
    ])
  );
});
/* ---------- */
/* tasks */
gulp.task('test', ['lint']);
gulp.task('build', ['build-version', 'test']);
gulp.task('publish', ['bump-version', 'add-files', 'tag-version', 'publish-version']);
