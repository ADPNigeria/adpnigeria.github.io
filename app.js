const express = require('express'),
path = require('path'),
favicon = require('serve-favicon'),
logger = require('morgan'),
cookieParser = require('cookie-parser'),
bodyParser = require('body-parser'),
mongoose = require('mongoose'),
mongojs = require('mongojs'),
fs = require('fs'),
CodeGen = require('node-code-generator'),
hbs = require('nodemailer-express-handlebars'),
multer = require('multer'),
countries = require('country-list')(),
bcrypt = require('bcrypt'),
mkdirp = require('mkdirp'),
md5 = require('md5'),
moment = require('moment'),
momenttz = require('moment-timezone'),
nodemailer = require('nodemailer'),
crypto = require('crypto');


var index = require('./routes/index');
// var users = require('./routes/users');
var about = require('./routes/about');
var blogs = require('./routes/blogs');
var contact = require('./routes/contact');
var structure = require('./routes/structure');
var register = require('./routes/register');
var members = require('./routes/members');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
// app.use('/users', users);
app.use('/about', about);
app.use('/blogs', blogs);
app.use('/contact', contact);
app.use('/register', register);
app.use('/structure', structure);
app.use('/members', members);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('You probably missed the road, Sorry about please go back home');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
