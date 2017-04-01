'use strict';

const dbQuery = require('../common/util').dbQuery;

const mysql = require('mysql');
const $conf = require('../config');
const pool = mysql.createPool($conf.mysql);

/**
 * 获取全部标签
 */
function getAllTags() {
  return dbQuery('select * from tags where state = 0');
}

/**
 * 插入新标签
 */
function saveTags(tags,date) {
  return pool.getConnection(function (err,connection) {
    const promises = tags.map((tag, index) => {
      return (new Promise(function (resolve, reject) {
        connection.query('INSERT INTO tags(id,tags_name,create_date,state) VALUES(0,?,?,?)', [tag,date,0],function (err) {
          if(!err){
            resolve(true);
          }
          else{
            reject(err);
          }
        });
      }))
    });
    return Promise.all(promises)
      .then(function () {
        connection.release();
        return true;
      });
  });
  // const defer = Q.defer();
  // pool.getConnection(function (err,connection) {
  //   for(let i = 0; i < tags.length; i++){
  //     (function (i) {
  //       connection.query('INSERT INTO tags(id,tags_name,create_date,state) VALUES(0,?,?,?)',
  //         [tags[i],date,0],function (err,result) {
  //           if(!err){
  //             if(i == tags.length - 1){
  //               defer.resolve(true);
  //               connection.release();
  //             }
  //           }
  //           else{
  //             defer.reject(err);
  //             connection.release();
  //           }
  //         });
  //     })(i);
  //   }
  // })
}

module.exports = {
    getAllTags:getAllTags,                                         //获取全部标签
    saveTags:saveTags                                              //插入新标签
}