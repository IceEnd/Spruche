'use strict';

const dbQuery = require('../common/util').dbQuery;

/**get website info */
function getWebSite() {
  return dbQuery('SELECT * FROM website WHERE id = 1');
}

/**
 * 开通站点
 */
function startWebSite(website,email,date,domain) {
  return dbQuery(`UPDATE website set name ="${website}",email = "${email}",create_date = "${date}", domain = "${domain}" ,state = 1 where id = 1`);
}

/**
 * 更新信息
 */
function updateInfo(ws) {
  return dbQuery(`UPDATE website SET name = '${ws.name}', description = '${ws.description}', short_name = '${ws.short_name}' where id = 1`);
}

module.exports = {
    getWebSite: getWebSite,        //  获取站点信息
    startWebSite: startWebSite,    //  开通站点
    updateInfo: updateInfo,        //  更新信息
}