/* by Gabriel Tomitsuka. Licensed under MIT license. */

//NPM Modules
var Handlebars = require('handlebars');
var async = require('async');

module.exports = function(_settings){
  var settings = _settings; //Optimization
  if(settings.handlebars == null)
    settings.handlebars = Handlebars;

  if(settings.extension == null)
    settings.extension = '.hbs';

  if(settings.caches == null || process.env.NODE_ENV === 'development')
    settings.caches = false;

  function handlePartials(array) {
    async.forEach(array, function(file, done) {
      fs.readFile(file, 'utf8', function(error, content) {
        if(error)
          throw error;

        settings.handlebars.registerPartial(path.basename(file, ext), content);
        done();
      });
    });
  }

  //Setup partials
  if(typeof settings.partials === 'string') {
    fs.readdir(settings.partials, function(error, files) {
      if(error)
        throw error;

      var partials = []; //Verifies extension
      files.forEach(function(file){
        var ext = path.extname(file);
        if(ext === settings.extension)
          partials.push(file);
      })

      handlePartials(partials);
    });
  }else if(Array.isArray(settings.partials)) {
    handlePartials(settings.partials)
  }else if(settings.partials != null) {
    throw new Error('Handlebars\' partials are invalid.');
  }

  var cache = [];
  return function(name, context, done) {
    if(settings.caches == true && cache[name])
      return done(null, cache[name](context));

    fs.readFile(name, 'utf8', function(error, file) {
      if(error)
        done(error, null);

      var compiled = settings.handlebars.compile(file);

      if(settings.caches == true){
        cache[name] = compiled;

      done(null, compiled(context));
    });
  }
}
