'use strict';

const dbQuery = require('../common/util').dbQuery;
const hashStr = require('../common/util').hashStr;

/**
 * 注册用户
 */
function regUser(username,password,email,img,date,type,state) {
  const pwd = hashStr(password);
  return dbQuery('INSERT INTO users(id,username,password,email,head_img,reg_date,type,state) VALUES(0,?,?,?,?,?,?,?)', [username, pwd, email, img, date, type, state]);
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
function loginDate(id,date) {
  const token = hashStr("id:"+date);
  return dbQuery(`UPDATE users set latest_time = '${date}', token = '${token}' where id = ${id}`, [], token);
}

/**
 * 查询用户信息
 */
function getUserById(id) {
  return dbQuery(`SELECT * FROM users WHERE id = '${id}' AND state = 0`);
}

/**
 * 判断用户登录状态
 */
function getUserToken(id, token) {
  return dbQuery(`SELECT * FROM users where id = id AND state = 0 AND token = '${token}'`);
}

/**
 * 更新用户信息
 */
function updateInfo(user) {
  return dbQuery(`UPDATE users SET email = '${user.email}', username = '${user.username}' where id = ${user.id} AND state = 0`);
}

module.exports = {
    regUser: regUser,              //  注册用户
    login: login,                  //  用户登录
    loginDate: loginDate,          //  更新最近登陆日期
    getUserById: getUserById,      //  查询用户信息
    getUserToken: getUserToken,    //  获取登录态
    updateInfo: updateInfo,        //  更新用户信息
}