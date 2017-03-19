'use strict';

const dbQuery = require('../common/util').dbQuery;
/**
 * 获取全部标签
 */
function createUsers() {
  return dbQuery(`
  create table If Not Exists users(
        id INT NOT NULL AUTO_INCREMENT,
        email VARCHAR(100) NOT NULL,
        username VARCHAR(50) NOT NULL,
        password VARCHAR(100) NOT NULL,
        head_img VARCHAR(200),
        reg_date DATETIME NOT NULL,
        latest_time DATETIME,
        type INTEGER NOT NULL,
        state INTEGER NOT NULL,
        token VARCHAR(200),
        PRIMARY KEY (id),
        UNIQUE (username)
      )engine=innodb default CHARSET=utf8
  `);
}

function createClassify() {
  return dbQuery(`
  CREATE TABLE If Not Exists classify(
      id INT NOT NULL AUTO_INCREMENT,
      classify varchar(100),
      state int not null,
      PRIMARY KEY (id)
     )engine=innodb default CHARSET=utf8
  `);
}

function createBlogs() {
  return dbQuery(`
  CREATE TABLE If Not Exists blogs(
      id INT NOT NULL AUTO_INCREMENT,
      title VARCHAR(200) NOT NULL,
      content TEXT NOT NULL,
      summary TEXT NOT NULL,
      user_id INT NOT NULL,
      classify_id INT NOT NULL,
      classify_name varchar(100) NOT NULL,
      tags varchar(500),
      view_num int NOT NULL,
      comment_num int NOT NULL,
      img varchar(500),
      state INT NOT NULL,
      publish_date DATETIME NOT NULL,
      stick INT NOT NULL,
      PRIMARY KEY (id),
      FOREIGN KEY (user_id) REFERENCES users(id) on   delete   cascade   on   update   cascade,
      FOREIGN KEY (classify_id) REFERENCES classify(id)
    )engine=innodb default CHARSET=utf8
  `);
}

function createTags() {
  return dbQuery(`
  CREATE TABLE If Not Exists tags(
      id INT NOT NULL AUTO_INCREMENT,
      tags_name VARCHAR(100) NOT NULL,
      create_date DATETIME NOT NULL,
      state INT NOT NULL,
      PRIMARY KEY (id),
      UNIQUE(tags_name)
    )engine=innodb default CHARSET=utf8
  `);
}

function createComments() {
  return dbQuery(`
  CREATE TABLE If Not Exists comments(
      id INT NOT NULL AUTO_INCREMENT,
      blog_id INT NOT NULL,
      email varchar(100) not null,
      username VARCHAR(50) NOT NULL,
      website varchar(100) not null,
      user_img VARCHAR(100) NOT NULL,
      publish_date DATETIME NOT NULL,
      state INT NOT NULL,
      PRIMARY KEY(id),
      FOREIGN KEY (blog_id) REFERENCES blogs(id) on   delete   cascade   on   update   cascade
    )engine=innodb default CHARSET=utf8
  `);
}

function createReplayComments() {
  return dbQuery(`
  CREATE TABLE If Not Exists reply_comments(
      id INT NOT NULL AUTO_INCREMENT,
      blog_id INT NOT NULL,
      comments_id INT NOT NULL,
      content TEXT NOT NULL,
      email varchar(100) not null,
      username VARCHAR(50) NOT NULL,
      website varchar(100) not null,
      user_img VARCHAR(200) NOT NULL,
      publish_date DATETIME NOT NULL,
      state INT NULL,
      PRIMARY KEY (id),
      FOREIGN KEY (comments_id) REFERENCES comments(id) on   delete   cascade   on   update   cascade,
      FOREIGN KEY (blog_id) REFERENCES blogs(id) on   delete   cascade   on   update   cascade
    )engine=innodb default CHARSET=utf8
  `);
}

function createWebsite() {
  return dbQuery(`
  CREATE TABLE If Not Exists website(
      id INT NOT NULL AUTO_INCREMENT,
      name varchar(100),
      email varchar(200),
      description varchar(500),
      short_name varchar(100),
      create_date DATETIME,
      state int not null,
      domain varchar(500),
      PRIMARY KEY (id)
    )engine=innodb default CHARSET=utf8
  `);
}

function createFriends() {
  return dbQuery(`
  CREATE TABLE If Not Exists friends(
      id INT NOT NULL AUTO_INCREMENT,
      name varchar(100) NOT NULL,
      website varchar(100) NOT NULL,
      url varchar(100) NOT NULL,
      description varchar(500) NOT NULL,
      head varchar(100) NOT NULL,
      status int not null,
      create_date DATETIME NOT NULL,
      PRIMARY KEY (id)
    )engine=innodb default CHARSET=utf8
  `);
}

function initWebsite() {
  return dbQuery(`replace into website(id,state,short_name, description) value (1,0,'none','')`);
}

function initClassify() {
  return dbQuery(`replace into classify(id,classify,state) value (1,'未分类',0)`);
}

module.exports = {
  createUsers: createUsers,               // 用户表
  createClassify: createClassify,         // 分类
  createBlogs: createBlogs,
  createTags: createTags,
  createComments: createComments,
  createReplayComments: createReplayComments,
  createWebsite: createWebsite,
  createFriends: createFriends,
  initWebsite: initWebsite,
  initClassify: initClassify,
}