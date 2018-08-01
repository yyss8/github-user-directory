let plugins = [
    require('autoprefixer')
];

if ( process.env.NODE_ENV === 'production' ){
    plugins.push( require('cssnano')({zindex: false}) );
}

module.exports = {plugins};