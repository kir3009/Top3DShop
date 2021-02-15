let project_folder = require("path").basename(__dirname)
let source_folder = "src"

let path = {
    build: {
        html:project_folder + "/",
        css:project_folder + "/css/",
        js:project_folder + "/js/",
        img:project_folder + "/img/",
        fonts:project_folder + "/fonts/",
    },
    src: {
        html:source_folder + "/*.html",
        css:source_folder + "/scss/style.scss",
        js:source_folder + "/js/script.js",
        img:source_folder + "/img/**/*.{jpg,png,svg,webp,ico,gif}",
        fonts:source_folder + "/fonts/*.woff2",
    },
    watch: {
        html:source_folder + "/**/*.html",
        css:source_folder + "/scss/**/*.scss",
        js:source_folder + "/js/**/*.js",
        img:source_folder + "/img/**/*.{jpg,png,svg,webp,ico,gif}",
        fonts:source_folder + "/fonts/*.woff2",
    },
    clean: "./" + project_folder + "/"
}

let {src,dest} = require('gulp'),
    gulp = require('gulp'),
    browsersync = require("browser-sync").create(),
    fileincklude = require("gulp-file-include"),
    del = require('del'),
    scss = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    group_media = require('gulp-group-css-media-queries'),
    clean_css = require('gulp-clean-css'),
    rename = require('gulp-rename'),
    css_comb = require('gulp-csscomb'),
    imagemin = require('gulp-imagemin'),
    svgSprite = require('gulp-svg-sprite'),
    htmlhint = require('gulp-htmlhint'),
    htmlmin = require('gulp-htmlmin')

function browserSync(params){
    browsersync.init({
        server:{
            baseDir: "./" + project_folder + "/"
        },
        port: 3000,
        open:true,
        notify:false
    })
}

function html() {
    return src(path.src.html)
        .pipe(fileincklude())
        .pipe(htmlhint())
        .pipe(htmlmin())
        .pipe(dest(path.build.html))
        .pipe(browsersync.stream())
}

function css() {
    return src(path.src.css)
        .pipe(
            scss({
                outputStyle:"expanded"
            })
        )
        .pipe(autoprefixer({
            overrideBrowserslist: ["last 5 versions"],
            cascade:"true"
        }))
        .pipe(group_media())
        .pipe(css_comb())
        .pipe(dest(path.build.css))
        .pipe(clean_css())
        .pipe(rename({
            extname:".min.css"
        }))
        .pipe(dest(path.build.css))
        .pipe(browsersync.stream())
}

function images() {
    return src(path.src.img)
        // .pipe(imagemin({
        //     interlaced: true,
        //     progressive: true,
        //     optimizationLevel: 3,
        //     svgoPlugins: [
        //         {
        //             removeViewBox: true
        //         }
        //     ]
        // }))
        .pipe(dest(path.build.img))
        .pipe(browsersync.stream())
}

function fonts() {
    return src(path.src.fonts)
        .pipe(dest(path.build.fonts))
}

gulp.task('svgSprite', function () {
    return gulp.src([source_folder + '/img/iconsprite/*.svg']) // svg files for sprite
        .pipe(svgSprite({
                mode: {
                    stack: {
                        sprite: "../icons/icons.svg", //sprite file name
                        example:true
                    }
                }
            }
        ))        .pipe(dest(path.build.img))

});


function watchFiles(params){
    gulp.watch([path.watch.html],html);
    gulp.watch([path.watch.css],css);
    gulp.watch([path.watch.img],images);

}

function clean(params){
    return del(path.clean)
}

let build = gulp.series(clean, gulp.parallel(css,images,html,fonts));
let watch = gulp.parallel(build, watchFiles, browserSync);

exports.fonts = fonts;
exports.images = images;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;
