var gulp = require("gulp");
var ts = require("gulp-typescript");
var gulpSequence = require('gulp-sequence');
var tsProject = ts.createProject("./tsconfig.json");
var exec = require('child_process').exec;

var spawn = require('child_process').spawn;
var nodemon = require('gulp-nodemon');
var jsonServer = require("gulp-json-srv");
var del = require("del");

var server = jsonServer.create({
    port: 5000,
});

gulp.task("clean", function () {
    del(['dist']);
    var filter = function (extension) {
        return function (file) {
            return file.replace(/.ts$/, '.' + extension);
        };
    };
    return gulp.src("src/**/*.ts", function (err, files) {
        del(files.map(filter("js")));
        del(files.map(filter("js.map")));
    })
});


gulp.task('test', ['start'], function () {
    var cmd = spawn('npm', ['test'], {stdio: 'inherit'});
    return cmd.on('exit', function (code) {
        process.exit(code);
    });
});

gulp.task("build", function () {
    var tsResult = tsProject.src() // or tsProject.src()
        .pipe(tsProject());

    return tsResult.on('error', function () {
        process.exit(1)
    })
        .js.pipe(gulp.dest("dist"))

});

gulp.task("init-db", function () {
    return nodemon({
        script: "server/initDB.js",
        watch: ["!server/*.*"]
    });
});

gulp.task("json-server", function () {
    return gulp.src("server/database.json")
        .pipe(server.pipe());
});

gulp.task("auth-server", function () {
    return nodemon({
        script: "server/auth-server.js",
        watch: ["!server/*.*"]
    });
});

gulp.task("start", gulpSequence('init-db','json-server', 'auth-server'));

gulp.task('default', gulpSequence('clean', 'build', 'test'));