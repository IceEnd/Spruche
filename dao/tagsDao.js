'use strict';

const mysql = require('mysql');
const $conf = require('../database/mysqlDB.js');
const pool = mysql.createPool($conf.mysql);
const Q = require('q');

/**
 * 获取全部标签
 */
function getAllTags() {
    const defer = Q.defer();
    pool.getConnection(function (err,connection) {
        connection.query('select * from tags where state = 0',function (err,result) {
            if(!err){
                defer.resolve(result);
            }
            else{
                console.log(err);
                defer.reject(err);
            }
            connection.release();
        });
    });
    return defer.promise;
}

/**
 * 插入新标签
 */
function saveTags(tags,date) {
    const defer = Q.defer();
    pool.getConnection(function (err,connection) {
        for(let i = 0; i < tags.length; i++){
            (function (i) {
                connection.query('INSERT INTO tags(id,tags_name,create_date,state) VALUES(0,?,?,?)',
                [tags[i],date,0],function (err,result) {
                    if(!err){
                        if(i == tags.length - 1){
                            defer.resolve(true);
                            connection.release();
                        }   
                    }
                    else{
                        console.log(err);
                        defer.reject(err);
                        connection.release();
                    }
                });
            })(i);
        }
    })
}

module.exports = {
    getAllTags:getAllTags,                                         //获取全部标签
    saveTags:saveTags                                              //插入新标签
}