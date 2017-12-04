'use strict';

const express = require('express');
const router = express.Router();
const request = require('request');
const glob = require('glob');
const fs = require('fs');
const path = require('path');

const usersDao = require('../dao/usersDao');
const classifyDao = require('../dao/classifyDao');
const blogsDao = require('../dao/blogsDao');
const tagsDao = require('../dao/tagsDao');
const websiteDao = require('../dao/websiteDao');
const friendsDao = require('../dao/friendsDao');
const commentsDao = require('../dao/commentsDao');

const util = require('../common/util');
const upload = require('../common/upload');

const packageInfo = require('../package.json');

const friendImgUpload = upload.friendImgUpload.single('friendhead');

const article = require('./article');

router.get('/*', async (req, res, next) => {
  try {
    const result = await usersDao.getUserToken(req.cookies.uid, req.cookies.token);
    if(result.length === 1 && result[0].type === 0 && new Date(result[0].expires) > new Date()) {
      next();
    } else {
      res.redirect('../login');
      res.end();
    }
  } catch (ex) {
    res.redirect('../login');
    res.end();
  }
});

router.post('/*', async (req, res, next) => {
  if(req.cookies.uid && req.cookies.type == 0) {
    try {
      const result = await usersDao.getUserToken(req.cookies.uid, req.cookies.token);
      if (result.length == 1 && result[0].type === 0 && new Date(result[0].expires) > new Date()) {
        next();
      } else {
        throw new Error('登陆态出错');
      }
    } catch (ex) {
      res.send({type:false});
      res.end();
    }
  } else {
    res.send({type:false});
    res.end();
  }
});

/* Get home page */
router.get('/', async (req, res) => {
  try {
    const result = await usersDao.getUserById(req.cookies.uid);
    res.render('back/admin', { user: result[0] });
  } catch (ex) {
    res.redirect('../login');
  }
});

router.get('/index', async (req, res) => {
  try {
    const result = await usersDao.getUserById(req.cookies.uid);
    res.render('back/index', { user: result[0] });
  } catch (ex) {
    res.redirect('../login');
  }
});

router.post('/index/appInfo', function (req, res) {
  request.get("http://about.coolecho.net/appinfo/appInfo.json", {timeout: 2000}, function (err, response) {
    if(!err && response.statusCode == 200){
      const appInfo = JSON.parse(response.body);
      appInfo.version = packageInfo.version;
      res.send({type: true, appInfo: appInfo});
    } else {
      res.send({type: false});
    }
  });
});

/* 写博客 */
router.get('/write', article.getWrite);

/* 删除文章 */
router.post('/write/delarticle', article.delArticle);

/* 保存发布 */
router.post('/write/saveartile', article.saveArticle);

/* 修改文章 */
router.post('/write/alterarticle', article.alterArticle);

/* 添加文章分类 */
router.post('/write/addclassify', article.addClassify);

/* 上传特色图片 */
router.post('/write/artileimgupload', article.imgUpload);

/* 设置特色图片 */
router.post('/write/setblogimg', article.setImg);

/* 置顶文章 */
router.post('/write/stickarticle', article.stickArticle);

/* 取消置顶 */
router.post('/write/notstickarticle', article.notStickArticle);

/*获取文章列表*/
router.get('/allarticle', article.getAllarticle);

/*修改文章页面*/
router.get('/editarticle', article.editArticle);

/*获取所有图片*/
router.get('/media', function (req, res) {
  let path, imgArr = [];
  glob('./public/upload/images/**/*.?(jpeg|jpg|png|gif)', function (err, files) {
    for(let f in files){
      path = files[f].replace(/^\.\/public/, '');
      imgArr.push(path);
    }
    res.render('back/mediaImg', {images: imgArr});
  });
});


// 设置页面
router.get('/wsconfig', function (req, res) {
  let user;
  usersDao.getUserById(req.cookies.uid)
    .then(function (result) {
      if (result.length != 0) {
        user = result[0];
        return websiteDao.getWebSite();
      }
      else {
        throw new Error('403');
      }
    })
    .then(function (result) {
      res.render('back/wsconfig', { user: user, website: result[0] });
    })
    .catch(function (error) {
      res.render('error', { message: 403, error: error });
    });
});

// 友情链接管理
router.get('/friendsconfig', function (req, res) {
  friendsDao.getFriends()
    .then(function (result) {
      res.render('back/friendsconfig', { friends: result });
    })
    .catch(function () {
      res.render('error', '500');
    });
});

/**
 * @description 新增友情链接
 */
router.post('/friendsconfig/addfriend', function (req, res) {
  const floaderExists = util.mkdirsSync('./public/upload/img/friends', 0o777);
  if (!floaderExists) { // 创建文件夹失败
    res.send({
      retCode: '500',
      retMsg: '文件夹创建失败',
    });
    res.end();
  }
  friendImgUpload(req, res, async (err) => {
    if (err) {
      res.send({
        retCode: '500',
        retMsg: '图片上传失败',
      });
      res.end();
    } else {
      const friend = {
        name: req.body.friendName,
        url: req.body.friendsUrl,
        website: req.body.friendWebsite,
        description: req.body.friendDescription,
        head: `/upload/img/friends/${req.file.filename}`
      };
      try {
        await friendsDao.addFriend(friend);
        res.send({
          retCode: '0',
          retData: {
            friend: friend
          }
        });
        res.end();
      } catch (ex) {
        res.send({retCode: '500'});
        res.end();
      }
    }
  });
});

router.post('/friendsconfig/alterfriend', function (req, res) {
  friendImgUpload(req, res, async (err) => {
    if (err) {
      res.send({retCode: '500'});
      res.end();
    } else {
      const friend = {
        id: req.body.id,
        name: req.body.friendName,
        url: req.body.friendsUrl,
        website: req.body.friendWebsite,
        description: req.body.friendDescription
      };
      if (req.body.head !== undefined) {
        friend.head = req.body.head;
      } else {
        friend.head = `/upload/img/friends/${req.file.filename}`;
      }
      try {
        await friendsDao.alterFriend(friend);
        res.send({retCode: '0'});
        res.end();
      } catch (e) {
        res.send({retCode: '500'});
        res.end();
      }
    }
  });
});

router.post('/friendsconfig/delete', function (req, res) {
  friendsDao.deleteFriend(req.body.id)
    .then(function () {
      res.send({retCode: '0'});
      res.end();
    })
    .catch(function (error) {
      res.send({retCode: '500'});
      res.end();
    });
});

// 更新个人信息
router.post('/wsc/updateuser', function (req, res){
  const user = JSON.parse(req.body.user);
  usersDao.updateInfo(user)
    .then(function () {
      res.send({ type: true });
    })
    .catch(function (error) {
      res.send({ type: false, error: error });
      res.end();
    });
});

// 更新网站信息
router.post('/wsc/updatews', function (req, res){
  const website = JSON.parse(req.body.website);
  websiteDao.updateInfo(website)
    .then(function () {
        res.send({ type: true });
    })
    .catch(function (error) {
        res.send({ type: false, error: error });
        res.end();
    });
});

// 导入多说评论
router.post('/wsc/importds', function (req, res) {
  const resData = {
    retCode: 0,
    retMsg: '',
    retData: {}
  };
  let data;
  try {
    data = fs.readFileSync(path.resolve('./data/export.json'), 'utf-8');
    data = JSON.parse(data);
  } catch (ex) {
    resData.retCode = -1;
    resData.retMsg =  '文件不存在';
  }
  if (data) {
    return commentsDao.importDS(data.posts)
      .then(function () {
        res.send(resData);
        res.end();
      })
      .catch(function () {
        resData.retCode = 100001;
        resData.retMsg =  '导入失败';
      });
  }
  res.send(resData);
  res.end();
});

module.exports = router;