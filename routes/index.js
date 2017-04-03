'use strict';
const express = require('express');
const router = express.Router();

const websiteDao = require('../dao/websiteDao');
const usersDao = require('../dao/usersDao');
const blogsDao = require('../dao/blogsDao');
const tagsDao = require('../dao/tagsDao');
const dbDao = require('../dao/dbDao');
const friendsDao = require('../dao/friendsDao');
const commentsDao = require('../dao/commentsDao');

const util = require('../common/util');
const formatDate = require('../common/util').formatDate;
const requestPostApi = util.requestPostApi;
const requestGetApi = util.requestGetApi;
const theme = require('../config').theme;

const wbApp = require('../config').wbApp;

/* website install */
router.get('/start', async function (req, res) {
  let start = false;
  try {
    await dbDao.createUsers();
    await dbDao.createClassify();
    await dbDao.createBlogs();
    await dbDao.createTags();
    await dbDao.createComments();
    await dbDao.createWebsite();
    await dbDao.createFriends();
    await dbDao.initWebsite();
    await dbDao.initClassify();
    const website = await websiteDao.getWebSite();
    if (website[0].state === 0) {
      res.render('front/themes/default/start', { title: '初号机神经同步' });
    } else {
      res.redirect('/', {website: website});
    }
  } catch (ex) {
    console.warn(err);
    res.render('error', { message: '数据表创建失败，请联系作者' });
  }
});

/* 首页 */
router.get('/', async (req, res) => {
  try {
    const result = await websiteDao.getWebSite();
    const website = result[0];
    const stick = await blogsDao.getStick();
    const blogList = await blogsDao.getBlogByPage(0, 10);
    let blogs = stick.concat(blogList);
    const cvPromises = blogs.map(async blog => {
      const commentsView = await commentsDao.getPageCommentsAcount(`/article/av${blog.id}`);
      blog.commentsView = commentsView;
      return blog;
    });
    blogs = await Promise.all(cvPromises);
    res.render(`front/themes/${theme}/index`, { website: website, blogs: blogs });
  } catch (ex) {
    console.warn(ex);
    res.render('error', { message: '404', error: ex });
  }
});

/* 加载更多文章 */
router.post('/loadmoreav', async (req, res) => {
  const page = parseInt(req.body.page);
  try {
    let blogs = await blogsDao.getBlogByPage(page * 10, 10);
    const cvPromises = blogs.map(async blog => {
      const commentsView = await commentsDao.getPageCommentsAcount(`/article/av${blog.id}`);
      blog.commentsView = commentsView;
      return blog;
    });
    blogs = await Promise.all(cvPromises);
    res.send({ type: true, blogs: blogs });
  } catch (ex) {
    console.warn(ex);
    res.send({ type: false, error: ex });
  }
});

/* 获取文章 */
router.get('/article/av*', async (req, res) => {
  const reg = /\/article\/av\d+/gi;
  let url = req.originalUrl, article_id, website, blog, stickBlog, prev, next, stick = false;
  article_id = reg.exec(url);
  try {
    if (article_id) {
      article_id = article_id[0].substr(11);
    } else {
      throw new Error('url错误');
    }
    let result = await websiteDao.getWebSite();
    const website = result[0];
    result = await blogsDao.getBlogByID(article_id, false);
    if (!result || result.length === 0) {
      throw new Error('文章不存在');
    }
    blog = result[0];
    if (blog.stick === 1) {
      stick = 1;
    }
    result = await blogsDao.getPrev(article_id, stick);
    prev = result;
    result = await blogsDao.getNext(article_id, stick, stickBlog);
    next = result;
    await blogsDao.addViewNum(article_id);
    const commentsView = await commentsDao.getPageCommentsAcount(`/article/av${blog.id}`);
    res.renderPjax(`front/themes/${theme}/article`, { website: website, blog: blog, prev: prev, next: next, commentsView: commentsView });
  } catch (ex) {
    let error = {};
    error.status = '400';
    error.stack = '';
    res.render('error', { message: 400, error: error });
  }
});

/* login */
router.get('/login', function (req, res, next) {
  websiteDao.getWebSite()
    .then(function (result) {
      res.render(`front/themes/${theme}/login`, { title: 'Login', website: result[0] });
    })
});

/* 开通站点 */
router.post('/start', function (req, res) {
  const date = util.formatDate(new Date());
  const img = '/images/pic/head.jpg';
  websiteDao.startWebSite(req.body.website, req.body.email, date, req.body.domain)
    .then(function (result) {
      if (result) {
        return usersDao.regUser(req.body.username, req.body.password, req.body.email, img, date, 0, 0);
      }
    })
    .then(function () {
      res.send(true);
      res.end();
    })
    .catch(function (error) {
      res.send(false);
      res.end();
    });
});

/* 登陆 */
router.post('/ulogin', function (req, res, next) {
  const form = JSON.parse(req.body.form);
  const date = util.formatDate(new Date());
  let user;
  let expires = 1;
  if (form.remeber) {
    expires = 7;
  }
  expires = util.formatDate(new Date((new Date()).valueOf() + (expires * 24 * 3600 * 1000)));
  usersDao.login(form.email, form.password)
    .then(function (result) {
      if (result.length !== 0) {
        user = result[0];
        delete user.password;
        delete user.state;
        delete user.reg_date;
        return usersDao.loginDate(user.id, date, expires);
      }
      else {
        throw new Error('用户不存在');
      }
    })
    .then(function (result) {
      user.token = result;
      user.expires = new Date(expires).valueOf();
      res.send({ type: 0, user: user });
      res.end();
    }).catch(function (error) {
    console.warn(error);
    res.send({ type: 1 });
    res.end()
  });
});

/* 留言板 */
router.get('/messageboard', function (req, res, next) {
  websiteDao.getWebSite()
    .then(function (result) {
      res.renderPjax(`front/themes/${theme}/messageboard`, { website: result[0] });
    })
    .catch(function (error) {
      res.render('error', { message: 404, error: error });
    });
});

/* 友人帐 */
router.get('/friendslink', function (req, res) {
  let website;
  websiteDao.getWebSite()
    .then(function (result) {
      website = result[0];
      return friendsDao.getFriends();
    })
    .then(function (result) {
      res.renderPjax(`front/themes/${theme}/friendslink`, { website: website, friends: result });
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

router.get('/wbconnect', function (req, res) {
  res.render('front/themes/default/connect');
});

router.post('/wbconnect', function (req, res) {
  const form = JSON.parse(req.body.form);
  let data = {
    client_id: wbApp.appKey,
    client_secret: wbApp.appSecret,
    grant_type: 'authorization_code',
    code: form.code,
    redirect_uri: form.redirectUri
  };
  const user = {};
  requestPostApi('https://api.weibo.com/oauth2/access_token', data)
    .then(function (result) {
      if (result !== null) {
        user.accessToken = result;
        user.accessToken.expiresDate = formatDate(new Date((new Date()).valueOf() + (10 * 24 * 3600 * 1000)));
        return requestGetApi(`https://api.weibo.com/2/users/show.json?access_token=${result.access_token}&uid=${result.uid}`);
      } else {
        throw new Error('连接失败');
      }
    })
    .then(function (result) {
      if (result !== null) {
        user.info = result;
        return usersDao.getWBUser(user.info.id);
      } else {
        throw new Error('连接失败');
      }
    })
    .then(function (result) {
      if (result.length === 0) {
        return usersDao.registerWBUser(user);
      } else {
        return usersDao.updateWBUserInfo(user);
      }
    })
    .then(function (result) {
      return usersDao.getWBUser(user.info.id);
    })
    .then(function (result) {
      const userInfo = result[0];
      delete userInfo.password;
      if (result) {
        res.send({
          retCode: 0,
          retMsg: '',
          retData: userInfo
        });
        res.end();
      } else {
        throw new Error('连接失败');
      }
    })
    .catch(function (error) {
      console.log(error);
      res.send({
        retCode: -1,
        retMsg: '英灵召唤失败，请重新召唤',
        retData: {}
      });
      res.end();
    });
});

module.exports = router;

