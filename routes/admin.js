var express = require('express');
var router = express.Router();

var usersDao = require('../dao/usersDao');
var classifyDao = require('../dao/classifyDao');
var blogsDao = require('../dao/blogsDao');
var tagsDao = require('../dao/tagsDao');

var util = require('../common/util');

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

/* 写博客 */
router.get('/write', function (req, res, next) {
    var user, type = 0;
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
                        res.render('back/write', { classify: classify,edit:false });
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
            return tagsDao.saveTags(tags,blog.publish_date);
        })
        .then(function (result) {
            res.send({type:true,blog:blog_id});
            res.end();
        })
        .catch(function (error) {
            res.send({type:false});
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


module.exports = router;