'use strict';

const mysql = require('mysql');
const $conf = require('../database/mysqlDB.js');
const pool = mysql.createPool($conf.mysql);
const Q = require('q');
const util = require('../common/util');

function addFriend(friend) {
  const defer = Q.defer();
  pool.getConnection(function (err,connection) {
    connection.query('INSERT INTO friends(id,name,website,url,description,head,status,create_date) values(0,?,?,?,?,?,?,?)',
      [friend.name, friend.website, friend.url, friend.description, friend.head, 0, util.formatDate(new Date())], function (err,result) {
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

function getFriends() {
  const defer = Q.defer();
  pool.getConnection(function (err, connection) {
    connection.query('SELECT * from friends where status = 0', function (err, result) {
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

function alterFriend(friend) {
  const defer = Q.defer();
  pool.getConnection(function (err, connection) {
    connection.query(`UPDATE friends set name = '${friend.name}', website = '${friend.website}', url = '${friend.url}', description = '${friend.description}', head = '${friend.head}' where id = ${friend.id}`, function (err, result) {
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

function deleteFriend(id) {
  const defer = Q.defer();
  pool.getConnection(function (err, connection) {
    connection.query(`UPDATE friends set status = 1 where id = ${id}`, function (err, result) {
      if (!err) {
        defer.resolve(result);
      }
      else {
        console.log(error);
        defer.reject(err);
      }
      connection.release();
    });
  });
  return defer.promise;
}

module.exports = {
  addFriend: addFriend,
  getFriends: getFriends,
  alterFriend: alterFriend,
  deleteFriend: deleteFriend,
}