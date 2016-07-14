var crypto = require('crypto');

/**加密 */
function hashStr(str) {
    var hasher=crypto.createHash("md5");
    hasher.update(str);
    var hashmsg=hasher.digest('hex');
    return hashmsg;   
}

/**时间格式化 */
function formatDate(date) {
    var str = ''+date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();
    return str;
}

module.exports = {
    hashStr:hashStr,                  //hash加密
    formatDate:formatDate             //时间格式化
}