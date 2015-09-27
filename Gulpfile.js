var gulp = require('gulp'),
    connect = require('gulp-connect'),
    stylus = require('gulp-stylus'),
    notify = require('gulp-notify'),
    nib = require('nib'),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    inject = require('gulp-inject'),
    wiredep = require('wiredep').stream,
    templateCache = require('gulp-angular-templatecache'),
    gulpif = require('gulp-if'),
    minifyCss = require('gulp-minify-css'),
    useref = require('gulp-useref'),
    uglify = require('gulp-uglify'),
    uncss = require('gulp-uncss');

// Servidor web de desarrollo
gulp.task('server', function() {
    connect.server({
        root: 'app',
        hostname: '0.0.0.0',
        port: 8080,
        livereload: true
    });
});

// Pre-procesa archivos Stylus a CSS y recarga los cambios
gulp.task('css', function() {
    gulp.src('./app/stylesheets/main.styl')
        .pipe(stylus({
            use: nib()
        }))
        .pipe(gulp.dest('./app/stylesheets'))
        .pipe(connect.reload());
});

// Recarga el navegador cuando hay cambios en el HTML
gulp.task('html', function() {
    gulp.src('./app/**/*.html')
        .pipe(connect.reload());
});

// Busca errores en el JS y nos los muestra por pantalla
gulp.task('jshint', function() {
    return gulp.src('./app/scripts/**/*.js')
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'));
});

// Busca en las carpetas de estilos y javascript los archivos que hayamos creado
// para inyectarlos en el index.html
gulp.task('inject', function() {
    var sources = gulp.src(['./app/scripts/**/*.js', './app/stylesheets/**/*.css']);
    return gulp.src('index.html', {
            cwd: './app'
        })
        .pipe(inject(sources, {
            read: false,
            ignorePath: '/app'
        }))
        .pipe(gulp.dest('./app'));
});

// Inyecta las librerias que instalemos vía Bower
gulp.task('bower', function() {
    gulp.src('./app/index.html')
        .pipe(wiredep({
            directory: './app/lib'
        }))
        .pipe(gulp.dest('./app'));
});

// Vigila cambios que se produzcan en el código
// y lanza las tareas relacionadas
gulp.task('watch', function(event) {

    var css_watcher = gulp.watch(['./app/stylesheets/**/*.styl'], ['css']);
    css_watcher.on('change', function(event) {
        notification('CSS', event); // Funcion que manda una notificación a la pantalla
    });

    var html_watcher = gulp.watch(['./app/**/*.html'], ['html']);
    html_watcher.on('change', function(event) {
        notification('HTML', event);
    });

    var jshint_watcher = gulp.watch(['./app/scripts/**/*.js', './Gulpfile.js'], ['jshint', 'inject']);
    jshint_watcher.on('change', function(event) {
        notification('JShint', event);
    });

    var wiredep_watcher = gulp.watch(['./bower.json'], ['bower']);
    wiredep_watcher.on('change', function(event) {
        notification('Bower Insertado', event)
    });

});

// Cacheamos las templates de angular
// Crea el archivo templates.js en los scripts con el contenido de las plantillas
gulp.task('templates', function() {
    gulp.src('./app/views/**/*.tpl.html')
        .pipe(templateCache({
            root: 'views/',
            module: 'blog.templates',
            standalone: true
        }))
        .pipe(gulp.dest('./app/scripts'));
});

// Comprime los archivos
gulp.task('compress', function() {
    gulp.src('./app/index.html')
        .pipe(useref.assets())
        .pipe(gulpif('*.js', uglify({
            mangle: false
        })))
        .pipe(gulpif('*.css', minifyCss()))
        .pipe(gulp.dest('./dist'));
});

// Copia los ficheros de fontawesome y quita los comentarios de wiredep
gulp.task('copy', function() {
    gulp.src('./app/index.html')
        .pipe(useref())
        .pipe(gulp.dest('./dist'));

    gulp.src('./app/lib/font-awesome/fonts/**')
        .pipe(gulp.dest('./dist/fonts'));
});

// Elimina las clases de fontawesome y bootstrap que no se usan reduciendo el style.min.css
gulp.task('uncss', function() {
    gulp.src('./dist/css/style.min.css')
        .pipe(uncss({
            html: ['./app/index.html', './app/views/post-detail.tpl.html', './app/views/post-list.tpl.html']
        }))
        .pipe(gulp.dest('./dist/css'));
});

//Monta un servidor de producción para poder probar la minificacion del css y js
gulp.task('server-dist', function() {
    connect.server({
        root: 'dist',
        hostname: '0.0.0.0',
        port: 8090,
        livereload: true
    });
});

gulp.task('build', ['templates', 'compress', 'copy', 'uncss']);
gulp.task('default', ['server', 'inject', 'bower', 'watch']);

//Función auxiliar para mandar notificaciones a la pantalla de OS X
function notification(msg, event) {
    return gulp.src('').pipe(notify({
        title: msg,
        message: 'Archivo ' + event.path + ' fue ' + event.type,
    }));
}
