var mysql = require('mysql');
var $conf = require('../database/mysqlDB.js');
var pool = mysql.createPool($conf.mysql);
var Q = require('q');

/**
 * 保存文章
 */
function saveBlog(blog) {
    var defer = Q.defer();
    pool.getConnection(function (err,connection) {
        connection.query('INSERT INTO blogs(id,title,username,content,summary,user_id,classify_id,classify_name,tags,view_num,comment_num,state,publish_date,img) VALUE(0,?,?,?,?,?,?,?,?,?,?,?,?,?) ',
        [blog.title,blog.username,blog.content,blog.summary,blog.user_id,blog.classify_id,blog.classify_name,blog.tags.join(','),0,0,blog.state,blog.publish_date,blog.img],function (err,result) {
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
 * 获取分页文章
 */
function getBlogByPage(start,amount) {
    var defer = Q.defer();
    pool.getConnection(function (err,connection) {
        connection.query('select a.*,b.email,b.head_img from blogs as a left join users as b on (a.user_id = b.id) WHERE a.state = 0 group by a.id desc limit '+start+','+amount,function (err,result) {
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
 * 获取文章
 */
function getBlogByID(id) {
    var defer = Q.defer();
    pool.getConnection(function (err,connection) {
        connection.query('select a.*,b.email,b.head_img from blogs as a left join users as b on (a.user_id = b.id) WHERE a.state = 0 AND a.id = '+id,function (err,result) {
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
 * 浏览次数自增
 */
function addViewNum(id) {
    var defer = Q.defer();
    pool.getConnection(function (err,connection) {
        connection.query('update blogs set view_num = view_num + 1 where id = ' + id,function (err,result) {
            if(!err){
                defer.resolve(result);
            }
            else{
                console.log(err);
                defer(err);
            }
            connection.release();
        });
    });
    return defer.promise;
}

/**
 * 获取全部文章标题
 */
function getAllTitle() {
    var defer = Q.defer();
    pool.getConnection(function (err,connection) {
        connection.query('select id,title from blogs where state = 0',function (err,result) {
            if(!err){
                defer.resolve(result);
            }
            else{
                console.log(err);
                defer(err);
            }
            connection.release();
        });
    });
    return defer.promise;
}

/**
 * 获取前一个文章
 */
function getPrev(id) {
    var defer = Q.defer();
    pool.getConnection(function (err,connection) {
        connection.query('SELECT id,title FROM blogs WHERE id < '+id+' AND state = 0 ORDER BY id DESC LIMIT 1',function (err,result) {
            if(!err){
                defer.resolve(result);
            }
            else{
                console.log(err);
                defer(err);
            }
            connection.release();
        });
    });
    return defer.promise;
}

/**
 * 获取下一个文章
 */
function getNext(id) {
    var defer = Q.defer();
    pool.getConnection(function (err,connection) {
        connection.query('SELECT id,title FROM blogs WHERE id > '+id+' AND state = 0 ORDER BY id ASC LIMIT 1',function (err,result) {
            if(!err){
                defer.resolve(result);
            }
            else{
                console.log(err);
                defer(err);
            }
            connection.release();
        });
    });
    return defer.promise;
}

module.exports = {
    saveBlog:saveBlog,                               //保存文章
    getBlogByPage:getBlogByPage,                     //获取分页文章
    getBlogByID:getBlogByID,                         //根据id获取博客
    addViewNum:addViewNum,                           //浏览次数自增
    getAllTitle:getAllTitle,                         //获取全部文章标题
    getPrev:getPrev,                                 //获取前一个文章
    getNext:getNext,                                 //获取下一个文章
}