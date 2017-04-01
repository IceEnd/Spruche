module.exports = {
  mysql: {                       // 数据库配置
    host: '127.0.0.1',           // 地址
    user: 'root',                 // 用户名
    password: 'Mdf@199646',             // 密码
    database:'spruche',              // 数据库名称
    port: 3306,                  // 端口
    charset: 'utf8mb4'
  },
  wbApp: {                        // 新浪开发者配置 不用 Servant评论框 可以不填
    appKey: '***',                // 新浪微博开发者key
    appSecret: '***'              // 新浪微博开发者Secret
  },
  theme: 'default'                // 主题文件夹名称，默认为 'default'，部分系统页面使用了默认主题，请不要删除默认主题
};