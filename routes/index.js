const express = require('express');
const router = express.Router();

const websiteDao = require('../dao/websiteDao');
const usersDao = require('../dao/usersDao');
const blogsDao = require('../dao/blogsDao');
const tagsDao = require('../dao/tagsDao');
const dbDao = require('../dao/dbDao');

const util = require('../common/util');

/* website install */
router.get('/start', function (req, res) {
  var start = false;
  var website;
  dbDao.createUsers()
    .then(function () {
      return dbDao.createClassify();
    })
    .then(function () {
      return dbDao.createBlogs();
    })
    .then(function () {
      return dbDao.createTags();
    })
    .then(function () {
      return dbDao.createComments();
    })
    .then(function () {
      return dbDao.createReplayComments();
    })
    .then(function () {
      return dbDao.createWebsite();
    })
    .then(function () {
      return dbDao.createFriends();
    })
    .then(function () {
      return dbDao.initWebsite();
    })
    .then(function () {
      return dbDao.initClassify();
    })
    .then(function () {
      return websiteDao.getWebSite();
    })
    .then(function (result) {
      if (result[0].state == 0) {
        start = true;
      }
      else {
        website = result[0];
      }
    })
    .then(function () {
      if (start) {
        res.render('front/start', { title: '初号机神经同步' });
      }
      else {
        res.redirect('/');
      }
    })
    .catch(function (err) {
      console.log(err);
      res.render('error', { message: '数据表创建失败，请联系作者' });
    })
});

/* 首页 */
router.get('/', function (req, res) {
  var website, blogs;
  websiteDao.getWebSite()
    .then(function (result) {
      website = result[0];
      return blogsDao.getStick();
    })
    .then(function (result) {
      blogs = result;
      return blogsDao.getBlogByPage(0, 9);
    })
    .then(function (result) {
      blogs = blogs.concat(result);
      res.render('front/index', { website: website, blogs: blogs });
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
router.get('/article/av*', function (req, res) {
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
        return blogsDao.getBlogByID(article_id, false);
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
router.post('/start', function (req, res) {
  var date = util.formatDate(new Date());
  var img = '/images/pic/head.jpg';
  websiteDao.startWebSite(req.body.website, req.body.email, date, req.body.domain)
    .then(function (result) {
      if (result) {
        return usersDao.regUser(req.body.username, req.body.password, req.body.email, img, date, 0, 0);
      }
    })
    .finally(function () {
      res.send(true);
      res.end();
    });
});

/* 登陆 */
router.post('/ulogin', function (req, res, next) {
  var date = util.formatDate(new Date());
  var user;
  var type = 0;
  usersDao.login(req.body.email, req.body.password)
    .then(function (result) {
      if (result.length != 0) {
        user = result[0];
        delete user.password;
        delete user.state;
        delete user.reg_date;
        return usersDao.loginDate(user.id, date);
      }
      else {
        type = 1;
        return false;
      }
    })
    .then(function (result) {
      if (type == 0) {
        user.token = result;
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

/* 留言板 */
router.get('/messageboard', function (req, res, next) {
  websiteDao.getWebSite()
    .then(function (result) {
      res.renderPjax('front/messageboard', { website: result[0] });
    })
    .catch(function (error) {
      res.render('error', { message: 404, error: error });
    });
});

/* 友人帐 */
router.get('/friendslink', function (req, res) {
  var website;
  websiteDao.getWebSite()
    .then(function (result) {
      website = result[0];
      return friendsDao.getFriends();
    })
    .then(function (result) {
      res.renderPjax('front/friendslink', { website: website, friends: result });
    })
    .catch(function (error) {
      res.render('error', { message: 404, error: error });
    });
});

/* 获取标签 */
router.post('/tags', function (req, res){
  tagsDao.getAllTags()
    .then(function (result) {
      res.send({ type: true, tags: result});
    })
    .catch(function (error) {
      res.send({ type: false });
    });
});

module.exports = router;
