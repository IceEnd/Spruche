'use strict';

const dbQuery = require('../common/util').dbQuery;
const formatDate = require('../common/util').formatDate;

function addFriend(friend) {
  return dbQuery('INSERT INTO friends(id,name,website,url,description,head,status,create_date) values(0,?,?,?,?,?,?,?)', [friend.name, friend.website, friend.url, friend.description, friend.head, 0, formatDate(new Date())]);
}

function getFriends() {
  return dbQuery('SELECT * from friends where status = 0');
}

function alterFriend(friend) {
  return dbQuery(`UPDATE friends set name = '${friend.name}', website = '${friend.website}', url = '${friend.url}', description = '${friend.description}', head = '${friend.head}' where id = ${friend.id}`);
}

function deleteFriend(id) {
  return dbQuery(`UPDATE friends set status = 1 where id = ${id}`);
}

module.exports = {
  addFriend: addFriend,
  getFriends: getFriends,
  alterFriend: alterFriend,
  deleteFriend: deleteFriend,
}