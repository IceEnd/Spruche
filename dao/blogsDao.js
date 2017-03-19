'use strict';

const dbQuery = require('../common/util').dbQuery;

/**
 * 保存文章
 */
function saveBlog(blog) {
  return dbQuery('INSERT INTO blogs(id,title,content,summary,user_id,classify_id,classify_name,tags,view_num,comment_num,stick,state,publish_date) VALUE(0,?,?,?,?,?,?,?,?,?,?,?,?)', [blog.title, blog.content, blog.summary, blog.user_id, blog.classify_id, blog.classify_name, blog.tags.join(','), 0, 0, 0, blog.state, blog.publish_date, blog.img]);
}

/**
 * 获取分页文章
 */
function getBlogByPage(start, amount) {
  return dbQuery(`select a.*, b.email, b.head_img, b.username from blogs as a left join users as b on (a.user_id = b.id) WHERE a.state = 0 AND a.stick = 0 group by a.id desc limit ${start}, ${amount}`);
}

/**
 * 获取文章
 */
function getBlogByID(id,flag) {
  let query;
  if(flag){
    query = `select a.*, b.email, b.head_img, b.username from blogs as a left join users as b on (a.user_id = b.id) WHERE (a.state = 0 or a.state = 1) AND a.id = ${id}`;
  }else {
    query = `select a.*, b.email, b.head_img, b.username from blogs as a left join users as b on (a.user_id = b.id) WHERE a.state = 0 AND a.id = ${id}`;
  }
  return dbQuery(query);
}

/**
 * 浏览次数自增
 */
function addViewNum(id) {
  return dbQuery(`update blogs set view_num = view_num + 1 where id = ${id}`);
}

/**
 * 获取全部文章信息
 */
function getAllBlogInfo() {
  return dbQuery(`select a.id, a.title, a.classify_name, a.tags, a.view_num, a.publish_date, a.stick, a.state, b.username from blogs as a left join users as b on (a.user_id = b.id) where a.state = 0 or a.state = 1 group by a.id desc`);
}

/**
 * 获取前一个文章
 */
function getPrev(id) {
  return dbQuery(`SELECT id,title FROM blogs WHERE id < ${id} AND state = 0 ORDER BY id DESC LIMIT 1`);
}

/**
 * 获取下一个文章
 */
function getNext(id) {
  return dbQuery(`SELECT id,title FROM blogs WHERE id > ${id} AND state = 0 ORDER BY id ASC LIMIT 1`);
}

/**
 * 修改文章
 */
function alterBlog(blog) {
  let query;
  if(typeof blog.state === 'undefined'){
      query = `UPDATE blogs set title = '${blog.title}', content = '${blog.content}', summary = '${blog.summary}', tags = '${blog.tags.join(',')}', classify_name = '${blog.classify_name}', classify_id = ${blog.classify_id} where id = ${blog.id}`;
  } else {
      query = `UPDATE blogs set title = '${blog.title}', content = '${blog.content}', summary = '${blog.summary}', tags = '${blog.tags.join(',')}', classify_name = '${blog.classify_name}', classify_id = ${blog.classify_id}, state = ${blog.state} where id = ${blog.id}`;
  }
  return dbQuery(query);
}

/**
 * 删除文章
 */
function deleteBlog(id){
  return dbQuery(`UPDATE blogs set state = 100000 where id = ${id}`)
}

/**
 * 清空置顶
 */
function cleanStick() {
  return dbQuery('UPDATE blogs set stick = 0');
}

/**
 * 取消置顶
 */
function cancelStick(id) {
  return dbQuery(`UPDATE blogs set stick = 0 where id = ${id}`)
}

/**
 * 置顶
 */
function setStick(id) {
  return dbQuery(`UPDATE blogs set stick = 1 where id = ${id}`);
}

/**
 * 获取置顶文章
 */
function getStick() {
  return dbQuery('select a.*, b.email, b.head_img, b.username from blogs as a left join users as b on (a.user_id = b.id) WHERE a.state = 0 AND a.stick = 1');
}

/**
 * 设置文章特色图片
 */
function setImage(url, id) {
  return dbQuery(`UPDATE blogs set img = '${url}' where id = ${id}`);
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
    setImage: setImage,
}