const { mix } = require('laravel-mix');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel application. By default, we are compiling the Sass
 | file for the application as well as bundling up all the JS files.
 |
 */

mix.js('resources/assets/js/app.js', 'public/js')
   .sass('resources/assets/sass/app.scss', 'public/css')
   .less('node_modules/bootstrap-less/bootstrap/bootstrap.less', 'public/css/bootstrap.css', {rootpath:"/bah-bateu/webfonts/"})
   .less('resources/assets/less/adminlte-app.less','public/css/adminlte-app.css')
   .less('node_modules/toastr/toastr.less','public/css/toastr.css')
   .combine([
        'url(https://fonts.googleapis.com/css?family=Raleway:300,400,600)',
       'public/css/bootstrap.css',
       'node_modules/@fortawesome/fontawesome-free/css/all.css',
       'node_modules/admin-lte/dist/css/skins/_all-skins.css',
       'public/css/adminlte-app.css',
       'node_modules/icheck/skins/square/blue.css',
       'public/css/toastr.css'
   ], 'public/css/all.css')
   //APP RESOURCES
   .copy('resources/assets/img/*.*','public/img')
   //VENDOR RESOURCES
   .copy('node_modules/@google/markerclusterer/src/','public/js')
   .copy('node_modules/@fortawesome/fontawesome-free/webfonts/','public/webfonts/')
   .copy('node_modules/ionicons/dist/fonts/*.*','public/webfonts/')
   .copy('node_modules/admin-lte/bootstrap/fonts/*.*','public/webfonts/bootstrap')
   .copy('node_modules/admin-lte/dist/css/skins/*.*','public/css/skins')
   .copy('node_modules/admin-lte/dist/img','public/img')
   .copy('node_modules/admin-lte/plugins','public/plugins')
   .copy('node_modules/icheck/skins/square/blue.png','public/css')
   .copy('node_modules/icheck/skins/square/blue@2x.png','public/css');

if (mix.config.inProduction) {
  mix.version();
}