'use strict';

const dbQuery = require('../common/util').dbQuery;

/**
 * 获取全部分类
 */
function getAllClassify() {
  return dbQuery('SELECT * FROM classify');
}

/**
 * 新增文章分类
 */
function addClassify(classify) {
  return dbQuery(`INSERT INTO classify(id,classify,state) VALUES(0,"${classify}",0)`);
}

module.exports = {
    getAllClassify:getAllClassify,           //获取全部分类
    addClassify:addClassify,                 //新增文章分类
}