var mysql = require('mysql');
var $conf = require('../database/mysqlDB.js');
var pool = mysql.createPool($conf.mysql);
var Q = require('q');

var util = require('../common/util');

/**get website info */
function getWebSite() {
    var defer = Q.defer();

    pool.getConnection(function (err, connection) {
        connection.query('SELECT * FROM website WHERE id = 1', function (err, result) {
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
 * 开通站点
 */
function startWebSite(website,email,date,domain) {
    var defer = Q.defer();
    pool.getConnection(function (err,connection) {
        connection.query('UPDATE website set name ="'+website+'",email = "'+email+'",create_date = "'+date+'", domain = "'+domain+'" ,state = 1 where id = 1',function (err,result) {
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
 * 更新信息
 */
function updateInfo(ws) {
    var defer = Q.defer();
    pool.getConnection(function (err, connection) {
        connection.query(`UPDATE website SET name = '${ws.name}', description = '${ws.description}', short_name = '${ws.short_name}' where id = 1`, function (err, result) {
            if(!err){
                defer.resolve(result);
            } else {
                console.warn(err);
                defer.reject(err);
            }
            connection.release();
        });
    });
    return defer.promise;
}

module.exports = {
    getWebSite: getWebSite,        //  获取站点信息
    startWebSite: startWebSite,    //  开通站点
    updateInfo: updateInfo,        //  更新信息
}