'use strict';

const dbQuery = require('../common/util').dbQuery;
/**
 * 获取全部标签
 */
function createUsers() {
  return dbQuery(`
  create table If Not Exists users(
    id INT NOT NULL AUTO_INCREMENT,
    email VARCHAR(20) NOT NULL DEFAULT '',
    username VARCHAR(20) NOT NULL,
    password VARCHAR(100) NOT NULL,
    head_img VARCHAR(50),
    reg_date DATETIME NOT NULL,
    latest_time DATETIME,
    expires DATETIME NOT NULL DEFAULT '1970-01-01 08:00:00',
    location VARCHAR(10) DEFAULT '',
    url VARCHAR(20) DEFAULT '',
    wb_id VARCHAR(20) DEFAULT '',
    wb_url VARCHAR(20) DEFAULT '',
    description VARCHAR(100) DEFAULT '',
    wb_verfied INT DEFAULT 2,
    gender VARCHAR(1) DEFAULT 'n',
    type INTEGER NOT NULL,
    state INTEGER NOT NULL,
    token VARCHAR(50) DEFAULT '',
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
    thread_key VARCHAR(50) NOT NULL,
    title VARCHAR(50) NOT NULL DEFAULT '',
    user_id INT NOT NULL DEFAULT 0,
    parents INT NOT NULL DEFAULT 0,
    rpid INT NOT NULL DEFAULT 0,
    ds_username VARCHAR(20) DEFAULT '',
    ds_id VARCHAR(30) DEFAULT '',
    ds_dafault_img VARCHAR(30) DEFAULT '',
    email VARCHAR(50) DEFAULT '',
    message TEXT NOT NULL,
    agent VARCHAR(100) DEFAULT '',
    likes INT NOT NULL DEFAULT 0,
    hates INT NOT NULL DEFAULT 0,
    create_time DATETIME NOT NULL DEFAULT '1970-01-01 08:00:00',
    update_time DATETIME DEFAULT '1970-01-01 08:00:00',
    ip VARCHAR(20),
    type INT NOT NULL,
    state INT NOT NULL,
    PRIMARY KEY(id)
  )engine=innodb default CHARSET=utf8mb4
  `);
}

function createUserLikeComments() {
  return dbQuery(`
  CREATE TABLE user_like_comments(
    id INT NOT NULL AUTO_INCREMENT,
    thread_key VARCHAR(50) NOT NULL,
    comments_id INT NOT NULL,
    user_id INT NOT NULL,
    create_time DATETIME NOT NULL DEFAULT '1970-01-01 08:00:00',
    state INT NOT NULL,
    PRIMARY KEY(id)
  )engine=innodb default CHARSET=utf8;
  `);
}

function createUserHateComments() {
  return dbQuery(`
  CREATE TABLE user_hate_comments(
    id INT NOT NULL AUTO_INCREMENT,
    thread_key VARCHAR(50) NOT NULL,
    comments_id INT NOT NULL,
    user_id INT NOT NULL,
    create_time DATETIME NOT NULL DEFAULT '1970-01-01 08:00:00',
    state INT NOT NULL,
    PRIMARY KEY(id)
  )engine=innodb default CHARSET=utf8;
  `);
}

function createReplayComments() {
  return dbQuery(`
  CREATE TABLE If Not Exists reply_comments(
    id INT NOT NULL AUTO_INCREMENT,
    comments_id INT NOT NULL,
    thread_key VARCHAR(50) NOT NULL,
    title VARCHAR(50) NOT NULL DEFAULT '',
    user_key INT NOT NULL,
    message TEXT NOT NULL,
    agent VARCHAR(100) DEFAULT '',
    like_num INT NOT NULL DEFAULT 0,
    hate_num INT NOT NULL DEFAULT 0,
    create_time DATETIME NOT NULL,
    ip VARCHAR(15) NOT NULL DEFAULT '',
    status INT NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (comments_id) REFERENCES comments(id) on   delete   cascade   on   update   cascade
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
  return dbQuery(`replace into website(id,state,description) value (1,0,'')`);
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
  createUserLikeComments: createUserLikeComments,
  createUserHateComments: createUserHateComments,
  createReplayComments: createReplayComments,
  createWebsite: createWebsite,
  createFriends: createFriends,
  initWebsite: initWebsite,
  initClassify: initClassify,
}