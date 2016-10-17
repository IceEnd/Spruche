var express = require('express');
var router = express.Router();
var request = require('request');
var glob = require('glob');

var usersDao = require('../dao/usersDao');
var classifyDao = require('../dao/classifyDao');
var blogsDao = require('../dao/blogsDao');
var tagsDao = require('../dao/tagsDao');

var util = require('../common/util');

var package = require('../package.json');

router.get('/*', function (req, res, next) {
  usersDao.getUserToken(req.cookies.id, req.cookies.token)
    .then(function (result) {
      if(result.length == 1) {
        next();
      } else {
        res.redirect('../login');
      }
    })
    .catch(function (error) {
      res.redirect('../login');
    });
});

/* Get home page */
router.get('/', function (req, res, next) {
  var user, type = 0;
  if (req.cookies.uid && req.cookies.type == 0) {
    usersDao.getUserById(req.cookies.uid)
      .then(function (result) {
        if (result.length != 0) {
          user = result[0];
          if (user.type == 0) {
            res.render('back/admin', { user: user });
          }
        }
        else {
          res.redirect('../login');
        }
      });
  }
  else {
    res.redirect('../login');
  }
});

router.get('/index', function (req, res, next) {
  var user, type = 0;
  if (req.cookies.uid && req.cookies.type == 0) {
    usersDao.getUserById(req.cookies.uid)
      .then(function (result) {
        if (result.length != 0) {
          user = result[0];
          if (user.type == 0) {
            res.render('back/index', { user: user });
          }
        }
        else {
          res.redirect('../login');
        }
      });
  }
  else {
    res.redirect('../login');
  }
});

/* 写博客 */
router.get('/write', function (req, res, next) {
  var user, type = 0;
  var classify;
  if (req.cookies.uid && req.cookies.type == 0) {
    classifyDao.getAllClassify()
      .then(function (result) {
        classify = result;
        return usersDao.getUserById(req.cookies.uid);
      })
      .then(function (result) {
        if (result.length != 0) {
          user = result[0];
          if (user.type == 0) {
            res.render('back/write', { classify: classify, edit: false });
          }
        }
        else {
          res.redirect('../login');
        }
      }, function (error) {
        res.redirect('error', '404');
      });
  }
  else {
    res.redirect('../login');
  }
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
      .catch(function (error) {
        res.send({type:false});
      })
  } else {
    res.send({type:false});
  }
});

router.post('/index/appInfo', function (req, res) {
  request.get("http://about.coolecho.net/appinfo/appInfo.json", {timeout: 2000}, function (err, response) {
    if(!err && response.statusCode == 200){
      var appInfo = JSON.parse(response.body);
      appInfo.version = package.version;
      console.log(appInfo);
      res.send({type: true, appInfo: appInfo});
    } else {
      console.log(err);
      res.send({type: false});
    }
  });
});

router.post('/write/*', function (req, res, next){
  if(req.cookies.uid && req.cookies.type == 0) {
    usersDao.getUserById(req.cookies.uid)
      .then(function (result) {
        if (result.length != 0) {
          next();
        }
        else {
          res.send({type:false});
        }
      });
  } else {
    res.send({type:false});
  }
});

/* 删除文章 */
router.post('/write/delarticle',function (req, res, next){
  blogsDao.deleteBlog(req.body.id)
    .then(function (result) {
      res.send({ type: true });
      res.end();
    })
    .catch(function (error) {
      res.send({ type: false });
      res.end();
    });
});

/* 保存发布 */
router.post('/write/sblog', function (req, res, next) {
  var blog = JSON.parse(req.body.blog);
  blog.view_num = 0;
  blog.publish_date = util.formatDate(new Date());
  blog.username = req.cookies.username;
  blog.user_id = req.cookies.uid;
  var blog_id, tags = [];
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
        for (var i = 0; i < blog.tags.length; i++) {
          for (var j = 0; j < result.length; j++) {
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
    .then(function (result) {
      res.send({ type: true, blog: blog_id });
      res.end();
    })
    .catch(function (error) {
      res.send({ type: false });
      res.end();
    });
});

/* 修改文章 */
router.post('/write/ablog', function (req, res, next) {
  var blog = JSON.parse(req.body.blog);
  var tags = [];
  var date = util.formatDate(new Date());
  blogsDao.alterBlog(blog)
    .then(function (result) {
      return tagsDao.getAllTags();
    })
    .then(function (result) {
      if (result.length == 0) {
        tags = blog.tags;
      }
      else {
        for (var i = 0; i < blog.tags.length; i++) {
          for (var j = 0; j < result.length; j++) {
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
    .then(function (result) {
      res.send({ type: true });
      res.end();
    })
    .catch(function (error) {
      res.send({ type: false });
      res.end();
    });
});

/* 添加文章分类 */
router.post('/write/addclassify', function (req, res, next) {
  classifyDao.addClassify(req.body.classify)
    .then(function (result) {
      res.send({ type: true, id: result.insertId });
      res.end();
    })
    .catch(function (error) {
      res.send({ type: false });
      res.end();
    });
});

/*获取文章列表*/
router.get('/allarticle', function (req, res, next) {
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
        res.render('back/allarticle', { blogs: result });
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
router.get('/editarticle', function (req, res, next) {
  var classify;
  if (req.cookies.uid && req.cookies.type == 0) {
    usersDao.getUserById(req.cookies.uid)
      .then(function (result) {
        if (result != 0 && result[0].type == 0) {
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
  var imgArr = [];
  var path;
  glob('./public/upload/images/**/*.?(jpeg|jpg|png|gif)', function (err, files) {
    for(var f in files){
      path = files[f].replace(/^\.\/public/, '');
      imgArr.push(path);
    }
    res.render('back/mediaImg', {images: imgArr});
  });
});

module.exports = router;