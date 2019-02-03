var sciezka = {
    styles: {
        src:   'src/css/**/*.css',
        min:   'src/css/*.min.css',
        minmap:'src/css/*.min.css.map',
        dest:  'dist/assets/styles/'
    },
    sass: {
        src:   'src/sass/**/*.scss',
        main:  'src/sass/main.scss'
    },
    scripts: {
        src:   'src/scripts/**/*.js',
        min:   'src/scripts/*.min.js',
        minmap:'src/scripts/*.min.js.map',
        dest:  'dist/assets/scripts/',
        bundle:'dist/assets/scripts/bundle.js',
        confjs:'src/index.js',
    },
    typescript: {
        src:   'src/scripts/*.ts',
        dest:  'dist/assets/scripts/'
    },
    images: ['assets/img/**/*'],
    content:  {
        src:   'src/**/*.html',
        dest:  'dist/'
    }
};


var gulp             = require('gulp');
var gutil            = require('gulp-util');
var timereq          = require("time-require");
var uglify           = require('gulp-uglify');
var uglifycss        = require('gulp-uglifycss');
var concat           = require('gulp-concat');
var sass             = require('gulp-sass');
var sourcemaps       = require('gulp-sourcemaps');
var removeEmptyLines = require('gulp-remove-empty-lines');
var stripCssComments = require('gulp-strip-css-comments');
var wait             = require('gulp-wait');
var gulpenv          = require('gulp-env');
var rename           = require('gulp-rename');
var gulpSequence     = require('gulp-sequence');
var browserSync      = require('browser-sync').create();
var ts               = require('gulp-typescript');
var autoprefixer     = require('gulp-autoprefixer');
// var webpack       = require('webpack-stream');
var webpack          = require('webpack');
var webpackConfig    = require("./webpack.config.js");
var file             = require('gulp-file');




// **********************************
// Obsługa błędów
// **********************************
function errorLog (error) {
    console.error.bind(error);
    this.emit('end');
}



/**********************************************************************************
 * Live Reload via 'BrowserSync'
 */
gulp.task('serve',['webpack','sass','scripts','styles','typescript','content'],function() {

    console.log(' ');
    console.log('███ MODE: ███ ' + process.env.NODE_ENV.toUpperCase());
    console.log(' ');
    console.log('████████████████████████████████████████████████████████████████████████');
    console.log('████████████████████████ S T A R T -  L I V E  S R V. ██████████████████');
    console.log('████████████████████████████████████████████████████████████████████████');
    console.log('████████████████████████████████████████████████████████████████████████');
    browserSync.init({
        server: "./dist/",
        notify: true,
        // reloadDelay: 2000,
        // proxy: "http:/192.168.0.1"
    });

    gulp.watch([sciezka.typescript.src], ['typescript']);                       // zmiany w type script
    gulp.watch([sciezka.scripts.confjs], ['webpack','scripts']);                // zmiany w bandlu js
    gulp.watch([sciezka.scripts.src,'!'+sciezka.scripts.min], ['scripts']);     // zmiany w plikach js
    gulp.watch([sciezka.styles.src, '!'+sciezka.styles.min],['styles']).on('change', browserSync.reload);        // zmiany w plikach styli css
    gulp.watch(sciezka.sass.src, function() { gulpSequence('sass','styles')() }).on('change', browserSync.reload); // zmiany w plikach sassowych
//  gulp.watch(sciezka.sass.src, ['sass']);                                     // zmiany w plikach sassowych
//  gulp.watch(sciezka.sass.src, ['sass']);                                     // zmiany w plikach sassowych
    gulp.watch(sciezka.content.src, ['content']);                               // zmiany w plikach html
    gulp.watch(sciezka.scripts.min).on('change', browserSync.reload);           // zmiany w finalnym pliku js
    gulp.watch(sciezka.content.src).on('change', browserSync.reload);           // zmiany w plikach html
});



// **********************************
// HTML
// Command line: gulp content
// **********************************
gulp.task('content', function () {
  return gulp.src(sciezka.content.src)
    .pipe(gulp.dest(sciezka.content.dest));
});





// **********************************
// Webpack
// Command line: gulp webpack
// **********************************
var newConfWebpack = Object.create(webpackConfig);                              // tworzymy kopie webpack config
console.log(newConfWebpack);
gulp.task('webpack', function(callback) {
    newConfWebpack.devtool = "sourcemap";                                       // modyfikacja domyślnego webpack config. dostępne opcje:  sourcemap|source-map|nosources-source-map|eval|cheap-eval-source-map|cheap-source-map|
    newConfWebpack.mode = "development";
    webpack(newConfWebpack).run(function(err, stats) {
        if(err) throw new gutil.PluginError("webpack", err);                    // obsługa wyjątków i zwrot błędu
        gutil.log("[webpack]", stats.toString({colors: true}));                 // statystyka z budowy bundla
        callback();                                                             // funkcja wywołująca funkcję statystyki
    });
});


// **********************************
// Kompilacja/transkrypcja TypeScript
// Command line: gulp typescript
// **********************************
gulp.task('typescript', function () {
    return gulp.src(sciezka.typescript.src)
        .pipe(sourcemaps.init())                                                // dołączenie map
        .pipe(ts({
            noImplicitAny: true,                                                //
            target: 'ES5',                                                      //
            // sortOutput: true                                                 //
        }))
        .pipe(gulp.dest(sciezka.typescript.dest));                              // ścieżka zapisu przekompilowanego pliku
});



// **********************************
// Minifijacja JS
// Command line: gulp scripts
// **********************************
gulp.task('scripts', function(){
    console.log('------------------- Make all in one for JS');
    return gulp.src(['!'+sciezka.scripts.min, sciezka.scripts.src])
    //.pipe(webpack(require('./webpack.config.js')))                            // webpack-stream (niestety nie obsługuje mi tworzenia bundla i musze użyć pełnego webpacka)
        .pipe(sourcemaps.init())                                                // inicjujemy mapę
        .pipe(uglify())                                                         // kompresujemy
        .pipe(concat('scripts.min.js'))                                         // pakujemy do jednego
        .pipe(sourcemaps.write())                                               // generujemy mapę
        .pipe(gulp.dest(sciezka.scripts.dest));                                 // ścieżka zapisu
        //.pipe(browserSync.reload({stream: true}))                             // auto reload

});



// **********************************
// Compile SASS
// Command line: gulp saas
// **********************************
gulp.task('sass', function(){
    console.log('------------------- Compile SASS');
    return gulp.src(sciezka.sass.main)
        .pipe(sass({
            outputStyle:'nested',                                               // sposób prezentowania kodu [nested,compact,expanded,compressed]
            sourceComments:false,                                               // wstawia komentarze z liniami do scss-a
            sourceMap:true                                                      // podaje lokalizacje źródła map
        }).on('error', sass.logError))
        .pipe(sourcemaps.init())
        .pipe(sourcemaps.write('.',{                                            // inicjujemy mapę
            includeContent:true,                                                // inicjujemy mapę
            sourceRoot: 'source'                                                // inicjujemy mapę
        }))
        .pipe(removeEmptyLines())
        //.pipe(stripCssComments({preserve: true}))                             // kastruje komentarze  [false, true] w zaleznosci czy maja zostawiaæ wazne  /*! ... */
        .pipe(gulp.dest(sciezka.styles.dest));                                  // ścieżka zapisu
});



// **********************************
// Minifijacja CSS
// Command line: gulp styles
// **********************************
gulp.task('styles', function(){
    console.log('------------------- Make all in one copmress CSS');
    return gulp.src([sciezka.styles.src,'!'+sciezka.styles.min])
        .pipe(sourcemaps.init())
        .pipe(concat('styles.min.css'))                                         // pakujemy do jednego
        .pipe(uglifycss({                                                       // kompresujemy
            "maxLineLen": 80,                                                   // kompresujemy
            "uglyComments": true                                                // kompresujemy
        }))                                                                     // kompresujemy
        .pipe(sourcemaps.write('.',{                                            // inicjujemy mapę
            includeContent:true,                                                // inicjujemy mapę
            sourceRoot: 'source'                                                // inicjujemy mapę
        }))
        .pipe(gulp.dest(sciezka.styles.dest))                                   // ścieżka zapisu
        .pipe(browserSync.reload({stream: true}));                              // auto reload
});







gulp.task('produkcja', function(){
    let enviroment = gulpenv.set({
        NODE_ENV: 'produkcja'
    });
});
gulp.task('development', function(){
    let enviroment = gulpenv.set({
        NODE_ENV: 'development'
    });
});


// **********************************
// Default Task
// **********************************
gulp.task('default',['development','serve']);
gulp.task('prod',['produkcja']);
gulp.task('dev',['development']);


