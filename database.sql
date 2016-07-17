create database spruche;
use spruche;
/*用户*/
create table users(
  id INT NOT NULL AUTO_INCREMENT,
  email VARCHAR(100) NOT NULL,
  username VARCHAR(50) NOT NULL,
  password VARCHAR(100) NOT NULL,
  head_img VARCHAR(200),
  reg_date DATETIME NOT NULL,
  latest_time DATETIME,
  type INTEGER NOT NULL,
  state INTEGER NOT NULL,
  PRIMARY KEY (id),
  UNIQUE (username)
)engine=innodb default CHARSET=utf8;

/*博客分类*/
CREATE TABLE classify(
    id INT NOT NULL AUTO_INCREMENT,
    classify varchar(100),
    state int not null,
    PRIMARY KEY (id)
)engine=innodb default CHARSET=utf8;

/*博文*/
CREATE TABLE blogs(
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL,
  username VARCHAR(50) NOT NULL,
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
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users(id) on   delete   cascade   on   update   cascade,
  FOREIGN KEY (classify_id) REFERENCES classify(id)
)engine=innodb default CHARSET=utf8;

/*标签*/
CREATE TABLE tags(
    id INT NOT NULL AUTO_INCREMENT,
    tags_name VARCHAR(100) NOT NULL,
    create_date DATETIME NOT NULL,
    state INT NOT NULL,
    PRIMARY KEY (id),
    UNIQUE(tags_name)
)engine=innodb default CHARSET=utf8;

/*博客，标签中间表*/
-- CREATE TABLE blogs_tags(
--     id INT NOT NULL AUTO_INCREMENT,
--     blog_id INT NOT NULL,
--     tags_id INT NOT NULL,
--     PRIMARY KEY (id), 
--     FOREIGN KEY (blog_id) REFERENCES blogs(id) on   delete   cascade   on   update   cascade,
--     FOREIGN KEY (tags_id) REFERENCES tags(id) on   delete   cascade   on   update   cascade
-- )engine=innodb default CHARSET=utf8;

/*评论*/
CREATE TABLE comments(
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
)engine=innodb default CHARSET=utf8;

/*回复的评论*/
CREATE TABLE reply_comments(
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
)engine=innodb default CHARSET=utf8;

/*站点信息*/
CREATE TABLE website(
    id INT NOT NULL AUTO_INCREMENT,
    name varchar(100),
    email varchar(200),
    create_date DATETIME,
    state int not null,
    domain varchar(500),
    PRIMARY KEY (id)
)engine=innodb default CHARSET=utf8;

insert into website(id,state) value (1,0);
insert into classify(id,classify,state) value (1,'未分类',0);