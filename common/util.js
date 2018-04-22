'use strict';
const crypto = require('crypto');
const mysql = require('mysql');
const $conf = require('../config');
const pool = mysql.createPool($conf.mysql);
const request = require('request');
const fs = require('fs');
const path = require('path');


/**
 * @description 字符串加密
 * @param {string} str 待加密字符串
 */
function hashStr(str) {
  const hasher = crypto.createHash("md5");
  hasher.update(str);
  const hashmsg = hasher.digest('hex');
  return hashmsg;
}

function getFormatNumber(num) {
  if (num < 10) {
    return `0${num}`;
  }
  return `${num}`;
}

function getFormatDate(date) {
  const y = date.getFullYear();
  const m = getFormatNumber(date.getMonth() + 1);
  const d = getFormatNumber(date.getDate());
  const h = getFormatNumber(date.getHours());
  const min = getFormatNumber(date.getMinutes());
  const s = getFormatNumber(date.getSeconds());
  return `${y}-${m}-${d} ${h}:${min}:${s}`;
}

/**时间格式化 */
function formatDate(date) {
  const str = ''+date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();
  return str;
}

/**
 * @description mysql 方法
 * @type {query: string, varlues: array, t: any}
 */
function dbQuery(query, values, t) {
  let arr = [];
  if (values && values.length > 0) {
    arr = values;
  }
  return (new Promise(function (resolve, reject) {
    pool.getConnection(function (err, connection) {
      connection.query(query, arr, function (err, result) {
        if (!err) {
          if (t) {
            resolve(t);
          } else {
            resolve(result);
          }
        }
        else {
          console.warn(err);
          reject(err);
        }
        connection.release();
      });
    });
  }));
}

function requestGetApi(url, timeout) {
  return (new Promise(function (resolve, reject) {
    request(url, {timeout: timeout}, function (err, response) {
      if(!err && response.statusCode == 200) {
        resolve(JSON.parse(response.body));
      } else {
        reject(err)
      }
    });
  }));
}

function requestPostApi(url, data) {
  return (new Promise(function (resolve, reject) {
    request.post({url, form: data}, function (err, response) {
      if(!err) {
        resolve(JSON.parse(response.body));
      } else {
        reject(err)
      }
    });
  }));
}

/**
 * @description 创建多级文件夹
 * @param {syting} dirpath 路径
 * @param {int} mode mode
 */
function mkdirsSync (dirpath, mode) { 
  try {
    if (!fs.existsSync(dirpath)) {
      let pathtmp;
      dirpath.split(/[/\\]/).forEach(function (dirname) {
        if (pathtmp) {
          pathtmp = path.join(pathtmp, dirname);
        } else {
          pathtmp = dirname;
        }
        if (!fs.existsSync(pathtmp)) {
          if (!fs.mkdirSync(pathtmp, mode)) {
            return false;
          }
        }
      });
    }
    return true; 
  } catch(e) {
    console.error(e);
    return false;
  }
}

module.exports = {
  hashStr,                  //hash加密
  formatDate,            //时间格式化
  dbQuery,
  requestGetApi,
  requestPostApi,
  mkdirsSync,
  getFormatDate,
}