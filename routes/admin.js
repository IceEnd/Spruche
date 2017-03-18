'use strict';
const express = require('express');
const router = express.Router();
const request = require('request');
const glob = require('glob');

const usersDao = require('../dao/usersDao');
const classifyDao = require('../dao/classifyDao');
const blogsDao = require('../dao/blogsDao');
const tagsDao = require('../dao/tagsDao');
const websiteDao = require('../dao/websiteDao');
const friendsDao = require('../dao/friendsDao');

const util = require('../common/util');
const upload = require('../common/upload');

const packageInfo = require('../package.json');

const blogImgUpload = upload.blogImgUpload.single('blogimg');
const friendImgUpload = upload.friendImgUpload.single('friendhead');

router.get('/*', function (req, res, next) {
  usersDao.getUserToken(req.cookies.id, req.cookies.token)
    .then(function (result) {
      if(result.length === 1 && result[0].type === 0) {
        next();
      } else {
        res.redirect('../login');
      }
    })
    .catch(function () {
      res.redirect('../login');
    });
});

/* Get home page */
router.get('/', function (req, res) {
  let user;
  usersDao.getUserById(req.cookies.uid)
    .then(function (result) {
      if (result.length !== 0 && result[0].type === 0 ) {
        user = result[0];
        res.render('back/admin', { user: user });
      }
      else {
        res.redirect('../login');
      }
    });
});

router.get('/index', function (req, res) {
  let user;
  usersDao.getUserById(req.cookies.uid)
    .then(function (result) {
      if (result.length !== 0 && result[0].type === 0) {
        user = result[0];
        res.render('back/index', { user: user });
      }
      else {
        res.redirect('../login');
      }
    });
});

/* 写博客 */
router.get('/write', function (req, res) {
  let user, classify;
  classifyDao.getAllClassify()
    .then(function (result) {
      classify = result;
      return usersDao.getUserById(req.cookies.uid);
    })
    .then(function (result) {
      if (result.length !== 0 && result[0].type === 0) {
        user = result[0];
        res.render('back/write', { classify: classify, edit: false });
      }
      else {
        res.redirect('../login');
      }
    })
    .catch(function (error) {
      res.redirect('error', '404');
    });
});

router.post('/*', function (req, res, next) {
  if(req.cookies.uid && req.cookies.type == 0) {
    usersDao.getUserToken(req.cookies.id, req.cookies.token)
      .then(function (result) {
        if (result.length == 1) {
          next();
        } else {
          res.send({type:false});
        }
      })
      .catch(function () {
        res.send({type:false});
      })
  } else {
    res.send({type:false});
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

router.post('/write/*', function (req, res, next){
  usersDao.getUserById(req.cookies.uid)
    .then(function (result) {
      if (result.length != 0) {
        next();
      }
      else {
        res.send({type:false});
      }
    });
});

/* 删除文章 */
router.post('/write/delarticle',function (req, res, next){
  blogsDao.deleteBlog(req.body.id)
    .then(function () {
      res.send({ type: true });
      res.end();
    })
    .catch(function () {
      res.send({ type: false });
      res.end();
    });
});

/* 保存发布 */
router.post('/write/sblog', function (req, res, next) {
  const blog = JSON.parse(req.body.blog);
  blog.view_num = 0;
  blog.publish_date = util.formatDate(new Date());
  blog.user_id = req.cookies.uid;
  let blog_id, tags = [];
  blogsDao.saveBlog(blog)
    .then(function (result) {
      blog_id = result.insertId;
      return tagsDao.getAllTags();
    })
    .then(function (result) {
      if (result.length == 0) {
        tags = blog.tags;
      }
      else {
        for (let i = 0; i < blog.tags.length; i++) {
          for (let j = 0; j < result.length; j++) {
            if (blog.tags[i] == result[j].tags_name)
              break;
            if (j == result.length - 1) {
              tags.push(blog.tags[i]);
            }
          }
        }
      }
      return tagsDao.saveTags(tags, blog.publish_date);
    })
    .then(function () {
      res.send({ type: true, blog: blog_id });
      res.end();
    })
    .catch(function () {
      res.send({ type: false });
      res.end();
    });
});

/* 修改文章 */
router.post('/write/ablog', function (req, res, next) {
  const blog = JSON.parse(req.body.blog);
  let tags = [];
  const date = util.formatDate(new Date());
  blogsDao.alterBlog(blog)
    .then(function (result) {
      return tagsDao.getAllTags();
    })
    .then(function (result) {
      if (result.length == 0) {
        tags = blog.tags;
      }
      else {
        for (let i = 0; i < blog.tags.length; i++) {
          for (let j = 0; j < result.length; j++) {
            if (blog.tags[i] == result[j].tags_name)
              break;
            if (j == result.length - 1) {
              tags.push(blog.tags[i]);
            }
          }
        }
      }
      return tagsDao.saveTags(tags, date);
    })
    .then(function () {
      res.send({ type: true });
      res.end();
    })
    .catch(function (error) {
      res.send({ type: false, retMsg: error });
      res.end();
    });
});

/* 添加文章分类 */
router.post('/write/addclassify', function (req, res) {
  classifyDao.addClassify(req.body.classify)
    .then(function (result) {
      res.send({ type: true, id: result.insertId });
      res.end();
    })
    .catch(function () {
      res.send({ type: false });
      res.end();
    });
});

/* 上传特色图片 */
router.post('/write/blogimgupload', function (req, res) {
  blogImgUpload(req, res, function (err) {
    if (err) {
      res.send({ retCode: '500'});
      res.end();
    } else {
      blogsDao.setImage(`/upload/img/blog/${req.file.filename}`, req.body.id)
        .then(function () {
          res.send({
            retCode: '0',
            retData: {
              url: `/upload/img/blog/${req.file.filename}`
            }
          });
        })
        .catch(function () {
          res.send({retCode: '500'});
          res.end();
        });
    }
  });
});

/* 设置特色图片 */
router.post('/write/setblogimg', function (req, res) {
  blogsDao.setImage(req.body.url, req.body.id)
    .then(function () {
      res.send({
        retCode: '0',
        retData: {
          url: req.body.url
        }
      });
    })
    .catch(function () {
      res.send({retCode: '500'});
      res.end();
    });
});

/* 置顶文章 */
router.post('/write/stickarticle', function (req, res) {
  blogsDao.cleanStick()
    .then(function (result) {
      if (result) {
        return blogsDao.setStick(req.body.id);
      } else {
        throw new Error('清除置顶失败');
      }
    })
    .then(function (result) {
      if (result) {
        res.send({ type: true });
        res.end();
      } else {
        throw new Error('设置置顶失败');
      }
    })
    .catch(function () {
      res.send({ type: false });
      res.end();
    });
});

/* 取消置顶 */
router.post('/write/notstickarticle', function (req, res) {
  blogsDao.cleanStick()
    .then(function (result) {
      if (result) {
        res.send({ type: true });
        res.end();
      } else {
        throw new Error('清除置顶失败');
      }
    })
    .catch(function () {
      res.send({ type: false });
      res.end();
    });
});

/*获取文章列表*/
router.get('/allarticle', function (req, res) {
  let blogs;
  if (req.cookies.uid && req.cookies.type == 0) {
    usersDao.getUserById(req.cookies.uid)
      .then(function (result) {
        if (result != 0) {
          return blogsDao.getAllBlogInfo();
        }
        else {
          throw new Error('403');
        }
      })
      .then(function (result) {
        blogs = result;
        return websiteDao.getWebSite();
      })
      .then(function (result) {
        res.render('back/allarticle', { blogs: blogs, website: result[0] });
      })
      .catch(function (error) {
        res.render('error', { message: 403, error: error });
      });
  }
  else {
    res.redirect('../login');
  }
});


/*修改文章页面*/
router.get('/editarticle', function (req, res) {
  let classify;
  if (req.cookies.uid && req.cookies.type == 0) {
    usersDao.getUserById(req.cookies.uid)
      .then(function (result) {
        if (result.length != 0 && result[0].type == 0) {
          return classifyDao.getAllClassify();
        }
        else {
          throw new Error('403');
        }
      })
      .then(function (result) {
        classify = result;
        return blogsDao.getBlogByID(req.query.id,true);
      })
      .then(function (result) {
        res.render('back/write', { classify: classify, edit: true, blog: result[0] });
      })
      .catch(function (error) {
        res.render('error', { message: 403, error: error });
      });
  }
  else {
    res.redirect('../login');
  }
});

/*获取所有图片*/
router.get('/media', function (req, res) {
  let imgArr = [];
  let path;
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

router.post('/friendsconfig/addfriend', function (req, res) {
  friendImgUpload(req, res, function (err) {
    if (err) {
      res.send({
        retCode: '500'
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
      friendsDao.addFriend(friend)
        .then(function () {
          res.send({
            retCode: '0',
            retData: {
              friend: friend
            }
          });
        })
        .catch(function () {
          res.send({retCode: '500'});
          res.end();
        });
    }
  });
});

router.post('/friendsconfig/alterfriend', function (req, res) {
  friendImgUpload(req, res, function (err) {
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
      friendsDao.alterFriend(friend)
        .then(function () {
          res.send({retCode: '0'});
          res.end();
        })
        .catch(function () {
          res.send({retCode: '500'});
          res.end();
        });
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
      console.log(error);
      res.send({retCode: '500'});
      res.end();
    });
});

// 更新个人信息
router.post('/updateuser', function (req, res){
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
router.post('/updatews', function (req, res){
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

module.exports = router;