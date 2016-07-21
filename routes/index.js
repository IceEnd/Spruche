var express = require('express');
var router = express.Router();

var websiteDao = require('../dao/websiteDao');
var usersDao = require('../dao/usersDao');
var blogsDao = require('../dao/blogsDao');

var util = require('../common/util');

/* website install */
router.get('/start', function (req, res, next) {
  var start = false;
  var website;
  websiteDao.getWebSite()
    .then(function (result) {
      if (result[0].state == 0) {
        start = true;
      }
      else {
        website = result[0];
      }
    })
    .finally(function () {
      if (start) {
        res.render('front/start', { title: 'Spruche' });
      }
      else {
        res.redirect('/');
      }
    });
});

/* 首页 */
router.get('/', function (req, res, next) {
  var blogs, website, amount = 0;
  websiteDao.getWebSite()
    .then(function (result) {
      website = result[0];
      return blogsDao.getBlogByPage(0, 10);
    })
    .then(function (result) {
      res.render('front/index', { website: website, blogs: result });
    })
    .catch(function (error) {
      res.render('error', { message: '404', error: error });
    })
});

/* 加载更多文章 */
router.post('/loadmoreav', function (req, res, next) {
  var page = parseInt(req.body.page);
  blogsDao.getBlogByPage(page * 10, 10)
    .then(function (result) {
      res.send({ type: true, blogs: result });
    })
    .catch(function (error) {
      res.send({ type: false, error: error })
    })
});

/* 获取文章 */
router.get('/article/av*', function (req, res, next) {
  var reg = /\/article\/av\d+/gi;
  var flag = true;
  var url = req.originalUrl, article_id, website, blogs, prev, next;
  article_id = reg.exec(url);
  if (article_id) {
    article_id = article_id[0].substr(11);
  }
  else {
    flag = false;
  }

  if (flag) {
    websiteDao.getWebSite()
      .then(function (result) {
        website = result[0];
        return blogsDao.getPrev(article_id);
      })
      .then(function (result) {
        prev = result;
        return blogsDao.getNext(article_id);
      })
      .then(function (result) {
        next = result;
        return blogsDao.addViewNum(article_id);
      })
      .then(function (result) {
        return blogsDao.getBlogByID(article_id);
      })
      .then(function (result) {
        if (result.length == 0) {
          throw new Error('404');
        }
        else {
          res.renderPjax('front/article', { website: website, blog: result[0], blogs: blogs, prev: prev, next: next });
        }
      })
      .catch(function (error) {
        res.render('error', { message: 404, error: error });
      });
  }
  else {
    var error = {};
    error.status = '400';
    error.stack = '';
    res.render('error', { message: 400, error: error });
  }
});

/* login */
router.get('/login', function (req, res, next) {
  websiteDao.getWebSite()
    .then(function (result) {
      res.render('front/login', { title: 'Login', website: result[0] });
    })
});

/* 开通站点 */
router.post('/start', function (req, res, next) {
  var date = util.formatDate(new Date());
  var img = '/images/pic/head.jpg';
  websiteDao.startWebSite(req.body.website, req.body.email, date, req.body.domain)
    .then(function (result) {
      if (result) {
        return usersDao.regUser(req.body.username, req.body.password, req.body.email, img, date, 0, 0);
      }
    })
    .finally(function (result) {
      res.send(true);
      res.end();
    });
});

/* 登陆 */
router.post('/ulogin', function (req, res, next) {
  var date = util.formatDate(new Date());
  var user;
  var type = 0;
  usersDao.login(req.body.username, req.body.password)
    .then(function (result) {
      if (result.length != 0) {
        user = result[0];
        return usersDao.loginDate(user.id, date);
      }
      else {
        type = 1;
        return false;
      }
    })
    .then(function (result) {
      if (type == 0) {
        res.send({ type: 0, user: user })
      }
      else {
        res.send({ type: 1 });
      }
      res.end();
    }, function (err) {
      res.send({ type: 1 });
    });
});

module.exports = router;
