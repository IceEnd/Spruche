'use strict';

const dbQuery = require('../common/util').dbQuery;

const mysql = require('mysql');
const $conf = require('../config');
const formatDate = require('../common/util').formatDate;

/**
 * 导入多说评论
 */
async function importDS(posts) {
  const sqls = [];
  for (let i = 0; i < posts.length; i++) {
    let {post_id, thread_key, message, likes, created_at, updated_at, author_email, author_name, ip} = posts[i];
    if (thread_key !== 'messageboard' && thread_key !== 'friendslink') {
      thread_key = `/article/av${posts[i].thread_key}`;
    } else {
      thread_key = `/${thread_key}`;
    }
    post_id = post_id || '0';
    author_email = author_email || '名字丢了';
    author_name = author_name || '';
    author_name = author_name.replace(/"/g, '\\"');
    message = message || '';
    created_at = formatDate(new Date(created_at)) || formatDate(new Date('1970-01-01T08:00:00+08:00'));
    updated_at = formatDate(new Date(updated_at)) || formatDate(new Date('1970-01-01T08:00:00+08:00'));
    likes = likes || 0;
    const head_img = `/images/pic/defaulthead${Math.ceil(Math.random() * 6)}.png`;
    sqls.push(`INSERT INTO comments(thread_key, ds_username,ds_id,ds_dafault_img,email,message,create_time,update_time,ip,type,state) VALUES ('${thread_key}', "${author_name}", '${post_id}', '${head_img}', '${author_email}', "${message}", '${created_at}', '${updated_at}', '${ip}', 1, 0) ON DUPLICATE KEY UPDATE message = "${message}"`);
    console.log(message);
  }
  try {
    const connection = await mysql.createConnection($conf.mysql);
    await connection.connect();
    for (let i = 0; i < sqls.length; i++) {
      await connection.query(sqls[i]);
    }
    return Promise.resolve(true);
  } catch (ex) {
    return Promise.reject(ex);
  }
}

/**
 * 获取页面评论个数
 */
async function getPageCommentsAcount(threadKey) {
  try {
    const amountPromise = dbQuery(`SELECT COUNT(*) FROM comments where thread_key = '${threadKey}' AND parents = 0 AND state = 0`);
    const countPromise = dbQuery(`SELECT COUNT(*) FROM comments where thread_key = '${threadKey}' AND state = 0`);
    const amount = await amountPromise;
    const count = await countPromise;
    return Promise.resolve({
      amount: amount[0]['COUNT(*)'],
      count: count[0]['COUNT(*)']
    });
  } catch (ex) {
    return Promise.reject(ex);
  }
}

function getSigleNoteComment(threadKey, id) {
  return dbQuery(`SELECT a.*, b.username, b.email from comments as a left join users as b on (a.user_id = b.id) WHERE a.thread_key = '${threadKey}' AND a.state = 0 AND a.id = ${id} GROUP BY a.id DESC`);
}

/**
 * 获取页面评论
 */
async function getPageComments(threadKey, start, pageNumber, childrenNumber) {
  let comments = [];
  try {
    comments = await dbQuery(`select a.*, b.username, b.head_img, b.wb_id, b.url, count(c.id) like_amount, count(d.id) hate_amount from comments as a left join users as b on (a.user_id = b.id) left join user_like_comments as c on (a.id = c.comments_id AND c.state = 1) left join user_hate_comments as d on (a.id = d.comments_id AND d.state = 1) where a.thread_key = '${threadKey}' AND a.state = 0 AND a.parents = 0 GROUP by a.id DESC LIMIT ${start}, ${pageNumber}`);
    const childrenPromises = comments.map(async comment => {
      const children = await dbQuery(`select a.*, b.username, b.head_img, b.wb_id, b.url, count(c.id) like_amount from comments as a left join users as b on (a.user_id = b.id) left join user_like_comments as c on (a.id = c.comments_id AND c.state = 1) where a.parents = '${comment.id}' AND a.state = 0 GROUP by a.id ASC LIMIT 0, 3`);
      comment.children = children;
      return comment;
    });
    comments = await Promise.all(childrenPromises);
    const childrenAmountPromises = comments.map(async comment => {
      const cAmount = await dbQuery(`SELECT COUNT(*) FROM comments where parents = ${comment.id} AND state = 0`);
      comment.childrenAmount = cAmount[0]['COUNT(*)'];
      return comment
    });
    comments = await Promise.all(childrenAmountPromises);
    return Promise.resolve(comments);
  } catch (ex) {
    return Promise.reject(ex);
  }
}

async function getPageCommentsById(threadKey, id) {
  let comments = [];
  try {
    comments = await dbQuery(`select a.*, b.username, b.head_img, b.wb_id, b.url, count(c.id) like_amount, count(d.id) hate_amount from comments as a left join users as b on (a.user_id = b.id) left join user_like_comments as c on (a.id = c.comments_id AND c.state = 1) left join user_hate_comments as d on (a.id = d.comments_id AND d.state = 1) where a.thread_key = '${threadKey}' AND a.state = 0 AND a.id = ${id} GROUP by a.id DESC`);
    const childrenPromises = comments.map(async comment => {
      const children = await dbQuery(`select a.*, b.username, b.head_img, b.wb_id, b.url, count(c.id) like_amount from comments as a left join users as b on (a.user_id = b.id) left join user_like_comments as c on (a.id = c.comments_id AND c.state = 1) where a.parents = '${comment.id}' AND a.state = 0 GROUP by a.id ASC LIMIT 0, 3`);
      comment.children = children;
      return comment;
    });
    comments = await Promise.all(childrenPromises);
    const childrenAmountPromises = comments.map(async comment => {
      const cAmount = await dbQuery(`SELECT COUNT(*) FROM comments where parents = ${comment.id} AND state = 0`);
      comment.childrenAmount = cAmount[0]['COUNT(*)'];
      return comment
    });
    comments = await Promise.all(childrenAmountPromises);
    return Promise.resolve(comments);
  } catch (ex) {
    return Promise.reject(ex);
  }
}

/**
 * 添加评论
 */
async function addComments(data) {
  try {
    return await dbQuery('INSERT INTO comments(id,thread_key,title,user_id,parents,rpid,message,create_time,agent,ip,type,state) VALUES(0,?,?,?,?,?,?,?,?,?,?,?)', data);
  } catch (ex) {
    return Promise.reject(ex);
  }
}

/**
 * 获取子级评论
 */
async function getChildren(pid, childrenNumber, page) {
  try {
    const children = await dbQuery(`select a.*, b.username, b.head_img, b.wb_id, b.url, count(c.id) like_amount from comments as a left join users as b on (a.user_id = b.id) left join user_like_comments as c on (a.id = c.comments_id AND c.state = 1) where a.parents = '${pid}' AND a.state = 0 GROUP by a.id ASC LIMIT ${(page - 1) * childrenNumber}, ${childrenNumber}`);
    let childrenAmount = await dbQuery(`SELECT COUNT(*) FROM comments where parents = ${pid} AND state = 0`);
    childrenAmount = childrenAmount[0]['COUNT(*)'];
    return Promise.resolve({
      children: children,
      childrenAmount: childrenAmount,
      current: page
    });
  } catch (ex) {
    return Promise.reject(ex);
  }
}

/**
 * likeAction
 */
async function likeAction(cid, threadKey, uid) {
  try {
    const hate = await dbQuery(`SELECT * FROM user_hate_comments WHERE comments_id = ${cid} AND user_id = ${uid}`);
    if (hate.length !== 0) {
      await dbQuery(`UPDATE user_hate_comments set state = 0 WHERE comments_id = ${cid} AND user_id = ${uid}`);
    }
    const likeRecord = await dbQuery(`SELECT * FROM user_like_comments WHERE comments_id = ${cid} AND user_id = ${uid}`);
    if (likeRecord.length === 0) {
      const data = [
        threadKey,
        cid,
        uid,
        formatDate(new Date()),
        1
      ];
      await dbQuery('INSERT INTO user_like_comments(id,thread_key,comments_id,user_id,create_time,state) VALUES (0,?,?,?,?,?)', data);
    } else {
      let state = 1;
      if (likeRecord[0].state === 1) {
        state = 0;
      }
      await dbQuery(`UPDATE user_like_comments set state = ${state} WHERE comments_id = ${cid} AND user_id = ${uid}`);
    }
    const likeAmount = await dbQuery(`SELECT COUNT(*) amount FROM user_like_comments WHERE  comments_id = ${cid} AND user_id = ${uid} AND state = 1`);
    const hateAmount = await dbQuery(`SELECT COUNT(*) amount FROM user_hate_comments WHERE  comments_id = ${cid} AND user_id = ${uid} AND state = 1`);
    return Promise.resolve({
      like: likeAmount[0].amount,
      hate: hateAmount[0].amount
    });
  } catch (ex) {
    return Promise.reject(ex);
  }
}

/**
 * hateAction
 */
async function hateAction(cid, threadKey, uid) {
  try {
    const like = await dbQuery(`SELECT * FROM user_like_comments WHERE comments_id = ${cid} AND user_id = ${uid}`);
    if (like.length !== 0) {
      await dbQuery(`UPDATE user_like_comments set state = 0 WHERE comments_id = ${cid} AND user_id = ${uid}`);
    }
    const hateRecord = await dbQuery(`SELECT * FROM user_hate_comments WHERE comments_id = ${cid} AND user_id = ${uid}`);
    if (hateRecord.length === 0) {
      const data = [
        threadKey,
        cid,
        uid,
        formatDate(new Date()),
        1
      ];
      await dbQuery('INSERT INTO user_hate_comments(id,thread_key,comments_id,user_id,create_time,state) VALUES (0,?,?,?,?,?)', data);
    } else {
      var state = 1;
      if (hateRecord[0].state === 1) {
        state = 0;
      }
      await dbQuery(`UPDATE user_hate_comments set state = ${state} WHERE comments_id = ${cid} AND user_id = ${uid}`);
    }
    const likeAmount = await dbQuery(`SELECT COUNT(*) amount FROM user_like_comments WHERE  comments_id = ${cid} AND user_id = ${uid} AND state = 1`);
    const hateAmount = await dbQuery(`SELECT COUNT(*) amount FROM user_hate_comments WHERE  comments_id = ${cid} AND user_id = ${uid} AND state = 1`);
    return Promise.resolve({
      like: likeAmount[0].amount,
      hate: hateAmount[0].amount
    });
  } catch (ex) {
    return Promise.reject(ex);
  }
}

module.exports = {
  importDS: importDS,                                // 导入多说评论
  getPageComment: getPageComments,                   // 获取页面评论
  getPageCommentsAcount: getPageCommentsAcount,      // 获取页面评论数量
  addComments: addComments,                          // 添加评论
  getChildren: getChildren,                          // 获取子级评论
  likeAction: likeAction,                            // 点赞操作
  hateAction: hateAction,                            // 踩操作
  getSigleNoteComment,
  getPageCommentsById,
};