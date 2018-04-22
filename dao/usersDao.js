'use strict';

const dbQuery = require('../common/util').dbQuery;
const hashStr = require('../common/util').hashStr;
const formatDate = require('../common/util').formatDate;

/**
 * 注册用户
 */
function regUser(username,password,email,img,date,type,state) {
  const pwd = hashStr(password);
  return dbQuery(`INSERT INTO users(id,username,password,email,head_img,reg_date,type,state) VALUES(0,'${username}','${pwd}','${email}','${img}','${date}',type,state)`);
}

/**
 * 用户登录
 */
function login(email,password) {
  const pwd = hashStr(password);
  return dbQuery(`SELECT * FROM users where email = "${email}" AND password = "${pwd}" AND state = 0`)
}

/**
 * 更新最近登陆日期
 */
function loginDate(id, date, expires) {
  const token = hashStr("id:"+date);
  return dbQuery(`UPDATE users set latest_time = '${date}', token = '${token}', expires = '${expires}' where id = ${id}`, [], token);
}

/**
 * 查询用户信息
 */
function getUserById(id) {
  return dbQuery(`SELECT * FROM users WHERE id = '${id}' AND state = 0`);
}

/**
 * 获取管理员信息
 */
function getAdmin() {
  return dbQuery('SELECT * FROM users WHERE state = 0 AND type = 0');
}

/**
 * 判断用户登录状态
 */
function getUserToken(uid, token) {
  return dbQuery(`SELECT * FROM users where id = ${uid} AND state = 0 AND token = '${token}'`);
}

/**
 * 更新用户信息
 */
function updateInfo(user) {
  return dbQuery(`UPDATE users SET email = '${user.email}', username = '${user.username}' where id = ${user.id} AND state = 0`);
}

// 查询微博用户
function getWBUser(wbUid) {
  return dbQuery(`SELECT * FROM users WHERE wb_id = "${wbUid}" AND type = 100 AND state = 0`);
}

// 注册微博用户
function registerWBUser(user) {
  let wbVerfied = 2;
  if (user.info.verified) {
    wbVerfied = 1;
  } else {
    wbVerfied = 0;
  }
  const data = [
    user.info.name,
    'orangeecho',
    '',
    user.info.avatar_large,
    formatDate(new Date()),
    user.info.location,
    user.info.url,
    user.info.idstr,
    user.info.profile_url,
    user.info.description,
    wbVerfied,
    user.info.gender,
    100,
    0,
    user.accessToken.access_token,
    formatDate(new Date()),
    user.accessToken.expiresDate
  ];
  return dbQuery('INSERT INTO users(id,username,password,email,head_img,reg_date,location,url,wb_id,wb_url,description,wb_verfied,gender,type,state,token,latest_time,expires) VALUES(0,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)', data);
}

function updateWBUserInfo(user) {
  let wbVerfied = 2;
  if (user.info.verified) {
    wbVerfied = 1;
  } else {
    wbVerfied = 0;
  }
  const {name, avatar_large, location, url, description, gender, idstr} = user.info;
  const {access_token, expiresDate} = user.accessToken;
  const lasted = formatDate(new Date());
  return dbQuery(`UPDATE users set username = '${name}', head_img = '${avatar_large}', location = '${location}', url = '${url}', description = '${description}', gender = '${gender}', token = '${access_token}', expires = '${expiresDate}', latest_time = '${lasted}', wb_verfied = ${wbVerfied} where wb_id = '${idstr}'`);
}

function updateEmail(id, email) {
  return dbQuery(`UPDATE users set email = '${email}' WHERE id = ${id}`);
}

module.exports = {
  regUser,
  login,
  loginDate,
  getUserById,
  getAdmin,
  getUserToken,
  updateInfo,
  getWBUser,
  registerWBUser,
  updateWBUserInfo,
  updateEmail,
}