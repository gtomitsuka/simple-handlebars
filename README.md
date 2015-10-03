# simple-handlebars
[![Build Status](https://travis-ci.org/gtomitsuka/simple-handlebars.svg)](https://travis-ci.org/gtomitsuka/simple-handlebars)

`npm install simple-handlebars`

simple-handlebars is a Handlebars engine designed for simplicity, made for [express](http://expressjs.com). It supports partials, multiple extensions(like `.hbs` and `.handlebars`) and view caching for a maximum performance.

# How to Use

```javascript
var app = require('express')();
var hbs = require('simple-handlebars');

app.engine('hbs', hbs({
  partials: __dirname + '/views/partials',
  extension: '.hbs'
}));
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');
```

# API

## hbs(options)
options:

`partials` - an array or a string. If it is a string, reads it as a directory and

`extension` - the file extension you're using. Usually `.hbs` or `.handlebars`. By default uses `.hbs`. This property is ignored if you send an array to `partials`

`handlebars` - if you need a different Handlebars implementation. By default uses [handlebars](http://npmjs.com/package/handlebars)

`caches` - By default, simple-handlebars only caches if process.env.NODE_ENV is 'production'.
