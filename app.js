var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var fs = require('fs');
var crypto = require('crypto');
var ueditor = require("ueditor");
var pjax = require("express-pjax");

var routes = require('./routes/index');
var users = require('./routes/users');
var admin = require('./routes/admin');
var ue = require('./routes/ueditor');

var app = express();
// var accessLogStream = fs.createWriteStream('./logs/access.log', {flags: 'a'});
// var errorLogfile = fs.createWriteStream('./logs/error.log', {flags: 'a'});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('.html',require('ejs').__express);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
//app.use(logger('combined', {stream: accessLogStream}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(pjax());

app.use('/', routes);
app.use('/users', users);
app.use('/admin',admin);
app.use('/ueditor',ue);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  var meta = '[' + new Date() + '] ' + req.url + '\n';
//  errorLogfile.write(meta + err.stack + '\n');
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;