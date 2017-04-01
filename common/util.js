'use strict';
const crypto = require('crypto');
const mysql = require('mysql');
const $conf = require('../config');
const pool = mysql.createPool($conf.mysql);
const request = require('request');


/**加密 */
function hashStr(str) {
  const hasher = crypto.createHash("md5");
  hasher.update(str);
  const hashmsg = hasher.digest('hex');
  return hashmsg;
}

/**时间格式化 */
function formatDate(date) {
  const str = ''+date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();
  return str;
}

/**
 * 轮子
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

module.exports = {
  hashStr: hashStr,                  //hash加密
  formatDate: formatDate,            //时间格式化
  dbQuery: dbQuery,
  requestGetApi: requestGetApi,
  requestPostApi: requestPostApi,
}