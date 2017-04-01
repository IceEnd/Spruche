'use strict';

const express = require('express');
const router = express.Router();

const commentsDao = require('../dao/commentsDao');
const usersDao = require('../dao/usersDao');
const formatDate = require('../common/util').formatDate;

router.post('/getcomments', async (req, res) => {
  const form = JSON.parse(req.body.form);
  try {
    const comments =  await commentsDao.getPageComment(form.threadKey, 0, form.pageNumber, form.childrenNumber);
    const page = await commentsDao.getPageCommentsAcount(form.threadKey);
    res.send({
      retCode: 0,
      retMsg: '',
      retData: {
        comments: comments,
        page: page
      }
    });
    res.end();
  } catch (ex) {
    console.log(ex);
    res.send({
      retCode: -1,
      retMsg: '获取评论失败',
      retData: {}
    });
    res.end();
  }
});

router.post('/getCommentsByPage', async (req, res) => {
  const form = JSON.parse(req.body.form);
  try {
    const {threadKey, pageNumber, childrenNumber, target} = form;
    const comments = await commentsDao.getPageComment(threadKey, pageNumber * (target - 1), pageNumber, childrenNumber);
    res.send({
      retCode: 0,
      retMsg: '',
      retData: {
        comments: comments
      }
    });
    res.end();
  } catch (ex) {
    res.send({
      retCode: -1,
      retMsg: '获取评论失败',
      retData: {}
    });
    res.end();
  }
});

router.post('/sendComments', async (req, res) => {
  try {
    const form = JSON.parse(req.body.form);
    const {uid, token} = req.cookies;
    let {rid, pid} = form;
    if (rid < 0) {
      rid = 0;
    }
    if (pid < 0) {
      pid = 0;
    }
    const users = await usersDao.getUserToken(uid, token);
    if  (!(users.length === 1 && users[0].state === 0 && new Date(users[0].expires) > new Date())) {
      throw new Error('登陆超时');
    }
    const data = [
      form.threadKey,
      form.title,
      parseInt(uid, 10),
      pid,
      rid,
      form.message,
      formatDate(new Date()),
      form.userAgent,
      '',                                   //  ip
      0,                                    //  type
      0                                     //  state
    ];
    await commentsDao.addComments(data);
    res.send({
      retCode: 0,
      retMsg: '',
      retDate: {}
    })
  } catch (ex) {
    console.warn(ex);
    res.send({
      retCode: -1,
      retMsg: '服务器忙，请稍后再试',
      retDate: {}
    });
    res.end();
  }
});

router.post('/getChildrenCommentsByPage', async (req, res) => {
  try {
    const {parents, childrenNumber, page} = JSON.parse(req.body.form);
    const result = await commentsDao.getChildren(parents, childrenNumber, page);
    res.send({
      retCode: 0,
      retMeg: '',
      retData: {
        comments: result
      }
    });
    res.end();
  } catch (ex) {
    console.warn(ex);
    res.send({
      retCode: -1,
      retMsg: '服务器忙，请稍后再试',
      retDate: {}
    });
    res.end();
  }
});

module.exports = router;