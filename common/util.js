'use strict';
const crypto = require('crypto');
const mysql = require('mysql');
const $conf = require('../database/mysqlDB.js');
const pool = mysql.createPool($conf.mysql);
const Q = require('q');


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
 *
 * @type {query: string}
 */
function dbQuery(query, values, t) {
  const defer = Q.defer();
  let arr = [];
  if (values && values.length > 0) {
    arr = values;
  }
  pool.getConnection(function (err, connection) {
    connection.query(query, arr, function (err, result) {
      if (!err) {
        if (t) {
          defer.resolve(t);
        } else {
          defer.resolve(result);
        }
      }
      else {
        console.warn(err);
        defer.reject(err);
      }
      connection.release();
    });
  });
  return defer.promise;
}

module.exports = {
  hashStr: hashStr,                  //hash加密
  formatDate: formatDate,            //时间格式化
  dbQuery: dbQuery
}