/* unit tests */

var path = require('path');
var assert = require('assert');
var hbs = require('../index');
var express = require('express');
var request = require('supertest');

//for custom implementation testing
var Handlebars = require('handlebars');

describe('hbs()', function() {
  it('works without arguments', function() {
    var instance = hbs();
    assert.equal(typeof instance, 'function');
    assert.equal(typeof instance.registerHelper, 'function');
    assert.equal(instance.settings.handlebars, Handlebars);
  });

  it('works with arguments', function() {
    var instance = hbs({
      caches: true
    });

    assert.equal(typeof instance, 'function');
    assert.equal(typeof instance.registerHelper, 'function');
    assert.equal(instance.settings.handlebars, Handlebars);
    assert.equal(instance.settings.caches, true);
  });

  it('works when called with app.engine() args', function(done) {
    var instance = hbs();
    var random = Math.random();

    instance(path.join(__dirname, '..', 'test-data', 'simple.hbs'), {
      test: random
    }, function(error, response) {
      if(error)
        throw error;

      assert.equal(response, random);
      done();
    });
  });

  it('works with partials', function(done) {
    var instance = hbs({
      partials: path.join(__dirname, '..', 'test-data', 'partials')
    });

    var random = Math.random();

    instance(path.join(__dirname, '..', 'test-data', 'partial-needed.hbs'), {
      test: random
    }, function(error, response) {
      if(error)
        throw error;

      assert.equal(response, '<!DOCTYPE html>\n' + random + '\n');
      done();
    });
  });

  describe('#registerHelper()', function() {
    it('helper works', function(done) {
      var instance = hbs();

      var random = Math.random();
      instance.registerHelper('getRandom', function() {
        return random;
      });

      instance(path.join(__dirname, '..', 'test-data', 'get-random.hbs'), {}, function(error, response) {
        if(error)
          throw error;

        assert.equal(response, random);
        done();
      });
    });
  });
});

describe('express()', function() {
  var app = express();

  app.engine('hbs', hbs({
    partials: path.join(__dirname, '..', 'test-data', 'partials')
  }));

  app.set('views', path.join(__dirname, '..', 'test-data'));

  app.get('/', function(req, res) {
    res.render('simple.hbs', {test: req.query.id})
  });

  it('responds to request as expected', function(done) {
    var random = Math.random();

    request(app)
    .get('/?id=' + random)
    .end(function(error, response) {
      if(error)
        throw error;

      assert.equal(response.text, random)
      done();
    });
  });
});
