var mysql = require('mysql');
var $conf = require('../database/mysqlDB.js');
var pool = mysql.createPool($conf.mysql);
var Q = require('q');

/**
 * 保存文章
 */
function saveBlog(blog) {
    const defer = Q.defer();
    pool.getConnection(function (err, connection) {
        connection.query('INSERT INTO blogs(id,title,content,summary,user_id,classify_id,classify_name,tags,view_num,comment_num,stick,state,publish_date,img) VALUE(0,?,?,?,?,?,?,?,?,?,?,?,?,?) ',
            [blog.title, blog.content, blog.summary, blog.user_id, blog.classify_id, blog.classify_name, blog.tags.join(','), 0, 0, 0, blog.state, blog.publish_date, blog.img], function (err, result) {
                if (!err) {
                    defer.resolve(result);
                }
                else {
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
function getBlogByPage(start, amount) {
    const defer = Q.defer();
    pool.getConnection(function (err, connection) {
        connection.query('select a.*, b.email, b.head_img, b.username from blogs as a left join users as b on (a.user_id = b.id) WHERE a.state = 0 AND a.stick = 0 group by a.id desc limit ' + start + ',' + amount, function (err, result) {
            if (!err) {
                defer.resolve(result);
            }
            else {
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
function getBlogByID(id,flag) {
    const defer = Q.defer();
    var str;
    if(flag){
        str = `select a.*, b.email, b.head_img, b.username from blogs as a left join users as b on (a.user_id = b.id) WHERE (a.state = 0 or a.state = 1) AND a.id = ${id}`;
    }else {
        str = `select a.*, b.email, b.head_img, b.username from blogs as a left join users as b on (a.user_id = b.id) WHERE a.state = 0 AND a.id = ${id}`;
    }
    pool.getConnection(function (err, connection) {
        connection.query(str, function (err, result) {
            if (!err) {
                defer.resolve(result);
            }
            else {
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
    const defer = Q.defer();
    pool.getConnection(function (err, connection) {
        connection.query('update blogs set view_num = view_num + 1 where id = ' + id, function (err, result) {
            if (!err) {
                defer.resolve(result);
            }
            else {
                console.log(err);
                defer(err);
            }
            connection.release();
        });
    });
    return defer.promise;
}

/**
 * 获取全部文章信息
 */
function getAllBlogInfo() {
    const defer = Q.defer();
    pool.getConnection(function (err, connection) {
        connection.query(`select a.id, a.title, a.classify_name, a.tags, a.view_num, a.publish_date, a.stick, b.username from blogs as a left join users as b on (a.user_id = b.id) where a.state = 0 or a.state = 1 group by a.id desc`, function (err, result) {
            if (!err) {
                defer.resolve(result);
            }
            else {
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
    const defer = Q.defer();
    pool.getConnection(function (err, connection) {
        connection.query('SELECT id,title FROM blogs WHERE id < ' + id + ' AND state = 0 ORDER BY id DESC LIMIT 1', function (err, result) {
            if (!err) {
                defer.resolve(result);
            }
            else {
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
    const defer = Q.defer();
    pool.getConnection(function (err, connection) {
        connection.query('SELECT id,title FROM blogs WHERE id > ' + id + ' AND state = 0 ORDER BY id ASC LIMIT 1', function (err, result) {
            if (!err) {
                defer.resolve(result);
            }
            else {
                console.log(err);
                defer.reject(err);
            }
            connection.release();
        });
    });
    return defer.promise;
}

/**
 * 修改文章
 */
function alterBlog(blog) {
    const defer = Q.defer();
    var query;
    if(typeof blog.state === 'undefined'){
        query = `UPDATE blogs set title = '${blog.title}', content = '${blog.content}', summary = '${blog.summary}', tags = '${blog.tags.join(',')}', classify_name = '${blog.classify_name}', classify_id = ${blog.classify_id}, img = '${blog.img}' where id = ${blog.id}`;
    } else {
        query = `UPDATE blogs set title = '${blog.title}', content = '${blog.content}', summary = '${blog.summary}', tags = '${blog.tags.join(',')}', classify_name = '${blog.classify_name}', classify_id = ${blog.classify_id}, img = '${blog.img}', state = ${blog.state} where id = ${blog.id}`;
    }
    pool.getConnection(function (err, connection) {
        connection.query(query, function (err, result) {
                if (!err) {
                    defer.resolve(result);
                }
                else {
                    console.log(err);
                    defer.reject(err);
                }
                connection.release();
            });
    });
    return defer.promise;
}

/**
 * 删除文章
 */
function deleteBlog(id){
    const defer = Q.defer();
    pool.getConnection(function (err, connection) {
        connection.query('UPDATE blogs set state = 100000 where id = '+id, function (err, result) {
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
 * 清空置顶
 */
function cleanStick() {
    const defer = Q.defer();
    pool.getConnection(function (err, connection) {
        connection.query('UPDATE blogs set stick = 0', function (err, result) {
            if(!err){
                defer.resolve(true);
            }
            else{
                defer.reject(err);
            }
            connection.release();
        });
    });
    return defer.promise;
}

/**
 * 取消置顶
 */
function cancelStick(id) {
    const defer = Q.defer();
    pool.getConnection(function (err, connection) {
        connection.query(`UPDATE blogs set stick = 0 where id = ${id}`, function (err, result) {
            if(!err){
                defer.resolve(true);
            }
            else{
                defer.reject(err);
            }
            connection.release();
        });
    });
    return defer.promise;
}

/**
 * 置顶
 */
function setStick(id) {
    const defer = Q.defer();
    pool.getConnection(function (err, connection) {
        connection.query(`UPDATE blogs set stick = 1 where id = ${id}`, function (err, result) {
            if(!err){
                defer.resolve(true);
            }
            else{
                defer.reject(err);
            }
            connection.release();
        });
    });
    return defer.promise;
}

/**
 * 获取置顶文章
 */
function getStick() {
    const defer = Q.defer();
    pool.getConnection(function (err, connection) {
        connection.query('select a.*, b.email, b.head_img, b.username from blogs as a left join users as b on (a.user_id = b.id) WHERE a.state = 0 AND a.stick = 1', function (err, result) {
            if(!err){
                defer.resolve(result);
            }
            else{
                defer.reject(err);
            }
            connection.release();
        });
    });
    return defer.promise;
}
module.exports = {
    saveBlog: saveBlog,                               //保存文章
    getBlogByPage: getBlogByPage,                     //获取分页文章
    getBlogByID: getBlogByID,                         //根据id获取博客
    addViewNum: addViewNum,                           //浏览次数自增
    getAllBlogInfo: getAllBlogInfo,                   //获取全部文章信息
    getPrev: getPrev,                                 //获取前一个文章
    getNext: getNext,                                 //获取下一个文章
    alterBlog: alterBlog,                             //修改博客
    deleteBlog: deleteBlog,                           //删除博客
    cleanStick: cleanStick,                           //清空置顶
    cancelStick: cancelStick,                         //取消置顶
    setStick: setStick,                               //设置置顶
    getStick: getStick,                               //获取置顶文章
}