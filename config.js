module.exports = {
  // mysql: {                       // 数据库配置
  //   host: '127.0.0.1',           // 地址
  //   user: '***',                 // 用户名
  //   password: '***',             // 密码
  //   database:'***',              // 数据库名称
  //   port: 3306,                  // 端口
  //   charset: 'utf8mb4'
  // },
  mysql: {                                                   // 数据库配置
    host: '127.0.0.1',                                        // 地址
    user: 'root',                                             // 用户名
    password: 'Mdf1994108',                                   // 密码
    database:'spruche',                                       // 数据库名称
    port: 3306,                                               // 端口
    charset: 'utf8mb4'
  },
  email: {                                    // 邮箱配置 仅支持SMTP
    username: '邮件姬',                        // 发件人名称
    options: {
      host: '',                               // 邮箱主机地址
      port: 25,                               // 端口 加密465
      secure: false,                          // true for 465, false for other ports
      auth: {
        user: '',                             // 邮箱
        pass: ''                              // 密码
      },
    },
  },
  // wbApp: {                        // 新浪开发者配置，微博登陆后使用Servant评论框
  //   appKey: '***',                // 新浪微博开发者key
  //   appSecret: '***'              // 新浪微博开发者Secret
  // },
  wbApp: {
    appKey: '2325634760',                                       // 新浪微博开发者key
    appSecret: 'b647f43acd05573908d2f820fa82fad7'               // 新浪微博开发者Secret
  },
  theme: 'default'                // 主题文件夹名称，默认为 'default'，部分系统页面使用了默认主题，请不要删除默认主题
};