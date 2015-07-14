/* by Gabriel Tomitsuka. Licensed under MIT license. */

//Node.js Modules
var fs = require('fs');
var path = require('path');

//NPM Modules
var Handlebars = require('handlebars');
var async = require('async');

module.exports = function(_settings){
  var settings = _settings; //Optimization
  if(settings.handlebars == null)
    settings.handlebars = Handlebars;

  if(settings.extension == null)
    settings.extension = '.hbs';

  if(typeof settings.caches !== 'boolean')
    settings.caches = process.env.NODE_ENV === 'production' ? true : false;

  function handlePartials(array){
    async.forEach(array, function(file, done){
      fs.readFile(file, 'utf8', function(error, content){
        if(error)
          throw error;

        settings.handlebars.registerPartial(path.basename(file, settings.extension), content);
        done();
      });
    });
  }

  //Setup partials
  if(typeof settings.partials === 'string'){
    fs.readdir(settings.partials, function(error, files){
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
  }else if(Array.isArray(settings.partials)){
    handlePartials(settings.partials)
  }else if(settings.partials != null){
    throw new Error('Handlebars\' partials are invalid.');
  }

  var cache = [];
  return function(name, context, done){
    if(settings.caches == true && cache[name])
      return done(null, cache[name](context));

    fs.readFile(name, 'utf8', function(error, file){
      if(error)
        done(error, null);

      if(settings.caches == true)
        cache[name] = settings.handlebars.compile(file);

      done(null, cache[name](context));
    });
  }
}
