var mysql = require('mysql');
var $conf = require('../database/mysqlDB.js');
var pool = mysql.createPool($conf.mysql);
var Q = require('q');

/**
 * 获取全部标签
 */
function getAllTags() {
    var defer = Q.defer();
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
    var defer = Q.defer();
    pool.getConnection(function (err,connection) {
        for(var i = 0; i < tags.length; i++){
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