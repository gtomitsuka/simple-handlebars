/* by Gabriel Tomitsuka. Licensed under MIT license. */

//Node.js Modules
var fs = require('fs');
var path = require('path');

//NPM Modules
var Handlebars = require('handlebars');
var async = require('async');

module.exports = function(_settings) {
  var settings = _settings || {}; //Optimization

  var type = typeof settings.handlebars;
  if(type !== 'function' || type !== 'object')
    settings.handlebars = Handlebars;

  if(settings.extension == null)
    settings.extension = '.hbs';

  settings.caches = settings.caches === true || process.env.NODE_ENV !== 'development';

  var isReady = false;

  function handlePartials(array) {
    async.forEach(array, function(file, done) {
      fs.readFile(file, 'utf8', function(error, content) {
        if(error)
          throw error;

        settings.handlebars.registerPartial(path.basename(file, settings.extension), content);
        done();
      });
    }, function() {
      isReady = true;
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
          partials.push(path.join(settings.partials, file));
      })

      handlePartials(partials);
    });
  } else if(Array.isArray(settings.partials)) {
    handlePartials(settings.partials)
  } else if(settings.partials != null) {
    throw new Error('Handlebars\' partials are invalid.');
  } else {
    isReady = true;
  }

  var cache = [];
  function run(name, context, done) {
    if(isReady === false)
     return setTimeout(function() { run(name, context, done)}, 1)

    if(settings.caches == true && cache[name])
      return done(null, cache[name](context));

    fs.readFile(name, 'utf8', function(error, file) {
      if(error)
        done(error, null);

      var compiled = settings.handlebars.compile(file);

      if(settings.caches == true)
        cache[name] = compiled;

      done(null, compiled(context));
    });
  }

  run.registerHelper = function() {
    Handlebars.registerHelper.apply(Handlebars, arguments);
  }

  run.settings = settings;

  return run;
}
