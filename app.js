'use strict';

const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const fs = require('fs');
const crypto = require('crypto');
const ueditor = require("ueditor");
const pjax = require("express-pjax");

const routes = require('./routes/index');
const users = require('./routes/users');
const admin = require('./routes/admin');
const ue = require('./routes/ueditor');
const comments = require('./routes/comments');

const theme = require('./config').theme;

const app = express();
// const accessLogStream = fs.createWriteStream('./logs/access.log', {flags: 'a'});
// const errorLogfile = fs.createWriteStream('./logs/error.log', {flags: 'a'});

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
// 静态资源
app.use(express.static(path.join(__dirname, 'public')));
app.use('/theme', express.static(path.join(__dirname, `views/front/themes/${theme}/public`)));
app.use(pjax());

app.use('/', routes);
app.use('/admin', admin);
app.use('/ueditor', ue);
app.use('/users', users);
app.use('/comments', comments);

// catch 404 and forward to error handler
app.use(function(req, res) {
  const err = new Error('Not Found');
  res.render('error', {
    message: err.message,
    error: err
  });
  // next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res) {
// const meta = '[' + new Date() + '] ' + req.url + '\n';
//  errorLogfile.write(meta + err.stack + '\n');
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;