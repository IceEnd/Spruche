var mysql = require('mysql');
var $conf = require('../database/mysqlDB.js');
var pool = mysql.createPool($conf.mysql);
var Q = require('q');

var util = require('../common/util');

/**
 * 注册用户
 */
function regUser(username,password,email,img,date,type,state) {
    var defer = Q.defer();
    password = util.hashStr(password);
    pool.getConnection(function (err,connection) {
        connection.query('INSERT INTO users(id,username,password,email,head_img,reg_date,type,state) VALUES(0,?,?,?,?,?,?,?)',
        [username,password,email,img,date,type,state],function (err,result) {
            if(!err){
                defer.resolve(true);
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
 * 用户登录
 */
function login(username,password) {
    var defer = Q.defer();
    password = util.hashStr(password+'');
    pool.getConnection(function (err,connection) {
        connection.query('SELECT * FROM users where username = "'+username+'" AND password = "'+password+'" AND state = 0',function (err,result) {
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
 * 更新最近登陆日期
 */
function loginDate(id,date) {
   var defer = Q.defer();  
   pool.getConnection(function (err,connection){
       connection.query('UPDATE users set latest_time = "'+date+'" where id = '+id,function (err,result) {
           if(!err){
                defer.resolve(true);
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
 * 查询用户信息
 */
function getUserById(id) {
    var defer = Q.defer();
     pool.getConnection(function (err,connection){
        connection.query('SELECT * FROM users WHERE id = '+id+' AND state = 0',function (err,result) {
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

module.exports = {
    regUser:regUser,              //注册用户
    login:login,                  //用户登录
    loginDate:loginDate,          //更新最近登陆日期
    getUserById:getUserById,      //查询用户信息
}