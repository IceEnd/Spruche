#Spruche
---

##Get Started
Spruche is a  blog system,which is based on Node.js.Here you can go to check the system function--[https://blog.coolecho.net](https://blog.coolecho.net "绘枫和畅").The back-end using Express framework, on the front end pjax technology is introduced.

If you want to use Spruche, your server should satisfy the conditions.
###list
- Node.js >= 4.4.7
- mysql >= 5.6.x

##Install
###step 1. create database
You need to execute SQL script,Create the database scripts are in database.sql.You can be in the mysql command line or execute a statement in the visualization tools, of course you can also define your own database name.for example:<br>
```
create database xxxx;
```

###step 2. mysql config
/database/mysqlDB.js <br>
```js
module.exports = {
  mysql: {
    host: '127.0.0.1', 
    user: 'username',       //username,用户名
    password: '****',       //password,密码
    database:'database',    //database，数据库名
    port: 3306              //端口
  }
};
```