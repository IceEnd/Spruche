'use strict';

const express = require('express');
const router = express.Router();

const commentsDao = require('../dao/commentsDao');
const usersDao = require('../dao/usersDao');
const websiteDao = require('../dao/websiteDao');
const {getFormatDate, formatDate} = require('../common/util');

const {sendMail,sender} = require('../common/email');

router.post('/getcomments', async (req, res) => {
  const form = JSON.parse(req.body.form);
  try {
    const comments = await commentsDao.getPageComment(form.threadKey, 0, form.pageNumber, form.childrenNumber);
    const page = await commentsDao.getPageCommentsAcount(form.threadKey);
    let targetComments = [];
    if (form.cpid) {
      targetComments = await commentsDao.getPageCommentsById(form.threadKey, parseInt(form.cpid, 10));
    }
    res.send({
      retCode: 0,
      retMsg: '',
      retData: {
        comments: comments,
        targetComments,
        page: page
      }
    });
    res.end();
  } catch (ex) {
    console.warn(ex);
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
    const {uid, token, username} = req.cookies;
    let {rid, pid} = form;
    if (rid < 0) {
      rid = 0;
    }
    if (pid < 0) {
      pid = 0;
    }
    const users = await usersDao.getUserToken(uid, token);
    if (!(users.length === 1 && users[0].state === 0 && new Date(users[0].expires) > new Date())) {
      throw new Error('登陆超时');
    }
    if (users[0].type !== 0 && form.email) { // 更新用户email
      await usersDao.updateEmail(uid, form.email);
    }
    const formatUid = parseInt(uid, 10);
    const date = getFormatDate(new Date());
    const data = [
      form.threadKey,
      form.title,
      formatUid,
      pid,
      rid,
      form.message,
      date,
      form.userAgent,
      '',                                   //  ip
      0,                                    //  type
      0                                     //  state
    ];
    const insert = await commentsDao.addComments(data);
    const commentId = insert.insertId; // 新的评论id
    let dbResult = await usersDao.getAdmin();
    const admin = dbResult[0];
    dbResult = await websiteDao.getWebSite();
    const website = dbResult[0];
    const url = `${req.protocol}://${req.get('host')}`;
    if (pid !== 0) {
      dbResult = await commentsDao.getSigleNoteComment(form.threadKey, pid);
    }
    if (rid !== 0) {
      dbResult = await commentsDao.getSigleNoteComment(form.threadKey, pid);
    }
    const commentInfo = {
      threadKey: form.threadKey,
      title: form.title,
      url,
      username,
      message: form.message,
      pid,
      rid,
      date,
      uid: formatUid,
      commentId,
    };
    if (pid !== 0) {
      dbResult = await commentsDao.getSigleNoteComment(form.threadKey, pid);
      commentInfo.pUsername = dbResult[0].username;
      commentInfo.pUserId = dbResult[0].user_id;
      commentInfo.pDate = getFormatDate(dbResult[0].create_time);
      commentInfo.pMessage = dbResult[0].message;
      commentInfo.pEmail = dbResult[0].email;
    }
    if (rid !== 0) {
      dbResult = await commentsDao.getSigleNoteComment(form.threadKey, rid);
      commentInfo.rUsername = dbResult[0].username;
      commentInfo.rUserId = dbResult[0].user_id;
      commentInfo.rDate = getFormatDate(dbResult[0].create_time);
      commentInfo.rMessage = dbResult[0].message;
      commentInfo.rEmail = dbResult[0].email;
    }
    sender(admin, commentInfo, website);
    res.send({
      retCode: 0,
      retMsg: '',
      retDate: {}
    });
  } catch (ex) {
    console.warn(ex);
    res.send({
      retCode: -1,
      retMsg: '服务器忙，请稍后再试',
      retDate: {}
    });
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

// 评论点赞
router.post('/like', async (req, res) => {
  try {
    const form = JSON.parse(req.body.form);
    const {cid, threadKey} = form;
    const {uid, token} = req.cookies;
    const users = await usersDao.getUserToken(uid, token);
    if  (!(users.length === 1 && users[0].state === 0 && new Date(users[0].expires) > new Date())) {
      throw new Error('登陆超时');
    }
    const amount = await commentsDao.likeAction(cid, threadKey, uid);
    res.send({
      retCode: 0,
      retMeg: '',
      retData: {
        amount: amount
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

// 踩评论
router.post('/hate', async (req, res) => {
  try {
    const form = JSON.parse(req.body.form);
    const {cid, threadKey} = form;
    const {uid, token} = req.cookies;
    const users = await usersDao.getUserToken(uid, token);
    if  (!(users.length === 1 && users[0].state === 0 && new Date(users[0].expires) > new Date())) {
      throw new Error('登陆超时');
    }
    const amount = await commentsDao.hateAction(cid, threadKey, uid);
    res.send({
      retCode: 0,
      retMeg: '',
      retData: {
        amount: amount
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
