/**
 * 后台博客管理路由
 */

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
const commentsDao = require('../dao/commentsDao');
const websiteDao = require('../dao/websiteDao');

const util = require('../common/util');
const upload = require('../common/upload');

const blogImgUpload = upload.blogImgUpload.single('blogimg');

/* 写博客 */
async function getWrite(req, res) {
  try {
    let user, classify;
    classify = await classifyDao.getAllClassify();
    const userResult = await usersDao.getUserById(req.cookies.uid);
    if (userResult.length !== 0 && userResult[0].type === 0) {
      user = userResult[0];
      res.render('back/write', { classify: classify, edit: false });
      res.end();
    } else {
      res.redirect('../login');
      res.end();
    }
  } catch (ex) {
    console.log(ex);
    res.redirect(404, 'error');
  }
}

/* 删除文章 */
async function delArticle(req, res, next) {
  try {
    await blogsDao.deleteBlog(req.body.id);
    res.send({ type: true });
    res.end();
  } catch (ex) {
    res.send({ type: false });
    res.end();
  }
}

/* 保存文章 */
async function saveArticle(req, res) {
  try {
    const blog = JSON.parse(req.body.blog);
    blog.view_num = 0;
    blog.publish_date = util.formatDate(new Date());
    blog.user_id = req.cookies.uid;
    let blog_id, tags = [];
    const saveResult = await blogsDao.saveBlog(blog);
    blog_id = saveResult.insertId;
    const tagResult = tagsDao.getAllTags();
    if (tagResult.length === 0) {
      tags = blog.tags;
    } else {
      for (let i = 0; i < blog.tags.length; i++) {
        for (let j = 0; j < tagResult.length; j++) {
          if (blog.tags[i] == tagResult[j].tags_name)
            break;
          if (j == tagResult.length - 1) {
            tags.push(blog.tags[i]);
          }
        }
      }
    }
    await tagsDao.saveTags(tags, blog.publish_date);
    res.send({ type: true, blog: blog_id });
    res.end();
  } catch (ex) {
    res.send({ type: false });
    res.end();
  }
}

/* 修改文章 */
async function alterArticle(req, res) {
  try {
    const blog = JSON.parse(req.body.blog);
    let tags = [];
    const date = util.formatDate(new Date());
    await blogsDao.alterBlog(blog);
    const tagsResult = await tagsDao.getAllTags();
    if (tagsResult.length == 0) {
      tags = blog.tags;
    } else {
      for (let i = 0; i < blog.tags.length; i++) {
        for (let j = 0; j < tagsResult.length; j++) {
          if (blog.tags[i] == tagsResult[j].tags_name)
            break;
          if (j == tagsResult.length - 1) {
            tags.push(blog.tags[i]);
          }
        }
      }
    }
    await tagsDao.saveTags(tags, date);
    res.send({ type: true });
    res.end();
  } catch (ex) {
    console.log(ex);
    res.send({ type: false });
    res.end();
  }
}

/* 添加文章分类 */
async function addClassify(req, res) {
  try {
    const result = await classifyDao.addClassify(req.body.classify);
    res.send({ type: true, id: result.insertId });
    res.end();
  } catch (ex) {
    console.log(ex);
    res.send({ type: false });
    res.end();
  }
}

/* 上传特色图片 */
function imgUpload(req, res) {
  const floaderExists = util.mkdirsSync('./public/upload/img/blog', 0o777);
  if (!floaderExists) { // 创建文件夹失败
    res.send({
      retCode: '500',
      retMsg: '文件夹创建失败',
    });
    res.end();
  }
  blogImgUpload(req, res, async (err) => {
    if (err) {
      res.send({ retCode: '500'});
      res.end();
    } else {
      try {
        await blogsDao.setImage(`/upload/img/blog/${req.file.filename}`, req.body.id);
        res.send({
          retCode: '0',
          retData: {
            url: `/upload/img/blog/${req.file.filename}`
          }
        });
        res.end();
      } catch (ex) {
        res.send({retCode: '500'});
        res.end();
      }
    }
  });
}

/* 设置特色图片 */
async function setImg(req, res) {
  try {
    await blogsDao.setImage(req.body.url, req.body.id);
    res.send({
      retCode: '0',
      retData: {
        url: req.body.url
      }
    });
    res.end();
  } catch (ex) {
    res.send({retCode: '500'});
    res.end();
  }
}

/* 置顶文章 */
async function stickArticle(req, res) {
  try {
    const cleanResult = await blogsDao.cleanStick();
    if (cleanResult) {
      await blogsDao.setStick(req.body.id);
      res.send({ type: true });
      res.end();
    } else {
      throw new Error('清除置顶失败');
    }
  } catch (ex) {
    console.log(ex);
    res.send({ type: false });
    res.end();
  }
}

/* 取消置顶 */
async function notStickArticle(req, res) {
  try {
    const result = await blogsDao.cleanStick();
    if (!result) {
      throw new Error('清除置顶失败');
    }
    res.send({ type: true });
    res.end();
  } catch (ex) {
    res.send({ type: false });
    res.end();
  }
}

/*获取文章列表*/
async function getAllarticle(req, res) {
  let blogs;
  try {
    blogs = await blogsDao.getAllBlogInfo();
    const cvPromises = blogs.map(async blog => {
      const commentsView = await commentsDao.getPageCommentsAcount(`/article/av${blog.id}`);
      blog.commentsView = commentsView;
      return blog;
    });
    blogs = await Promise.all(cvPromises);
    const website = await websiteDao.getWebSite();
    res.render('back/allarticle', { blogs: blogs, website: website[0] });
  } catch (ex) {
    res.render('error', { message: 500, error: ex });
  }
}

/*修改文章页面*/
async function editArticle(req, res) {
  try {
    const classify = await classifyDao.getAllClassify();
    const blog = await blogsDao.getBlogByID(req.query.id,true);
    res.render('back/write', { classify: classify, edit: true, blog: blog[0] });
    res.end();
  } catch (ex) {
    console.log(ex);
    res.render('error', { message: 403, error: error });
    res.end();
  }
}

module.exports = {
  getWrite,
  delArticle,
  saveArticle,
  alterArticle,
  addClassify,
  imgUpload,
  setImg,
  stickArticle,
  notStickArticle,
  getAllarticle,
  editArticle,
};
