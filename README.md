#Spruche

[![version](https://img.shields.io/badge/vsersion-0.0.6-brightgreen.svg)](https://github.com/IceEnd/Spruche)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg)](https://github.com/IceEnd/Spruche/blob/master/LICENSE)

[中文教程](https://www.coolecho.net/article/av17)

##Get Started
Spruche is a beautiful blog system,which is based on Node.js.Here you can go to check the system function--[https://www.coolecho.net](https://www.coolecho.net "绘枫和畅").

If you want to use Spruche, your server should satisfy the conditions.
###list
- Node.js >= 4.4.7
- mysql >= 5.0

##Install
###step 1. Create database
Create database, for example:<br>
```
create database xxxx;
```

###step 2. Mysql config
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
###step 3. Install packages
Open system terminal
```
npm install
```
Then
```
npm install -g grunt-cli
grunt
```

###step 3. Start
If you want to start a system, executing the following command.
```
npm start
```
If you want to make the system aways run,you need install `forever`.
```
npm install -g forever
```
And then:
```
forever start ./bin/www
```
or
```
npm run public
```

###step 4. System config
Now,you need to access you website:`http://hostname/start` or `https://hostname/start`.Add the corresponding information.

Ok, finished.Now,you can access you website.



###Admin
Access `https://hostname/admin` or `http://hostname/admin`,you can manage system.

###DUODHUO
Access `https://hostname/admin#wsconfing`, set ```short_name``` of duoshuo.

###LICENSE
[MIT](https://github.com/pantsPoi/Spruche/blob/master/LICENSE)
