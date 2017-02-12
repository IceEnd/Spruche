#Spruche

[![version](https://img.shields.io/badge/version-0.0.4-brightgreen.svg)](https://github.com/IceEnd/Spruche)

##Get Started
Spruche is a  blog system,which is based on Node.js.Here you can go to check the system function--[https://blog.coolecho.net](https://blog.coolecho.net "绘枫和畅").The back-end using Express framework, on the front end pjax technology is introduced.

If you want to use Spruche, your server should satisfy the conditions.
###list
- Node.js >= 4.4.7
- mysql >= 5.6.x

##Install
###step 1. Create database
You need to execute SQL script,Create the database scripts are in database.sql.You can be in the mysql command line or execute a statement in the visualization tools, of course you can also define your own database name.for example:<br>
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
###step 4. Start
First,If you don't use SSL, so please note the following code in /bin/www.
```
/*
var https = require('https');

var privateKey  = fs.readFileSync('./ssl/node.key', 'utf8');
var certificate = fs.readFileSync('./ssl/node.crt', 'utf8');
*/
...
/*
var credentials = {
  key: privateKey,                 //key
  cert: certificate,               //cert
  passphrase: '**********'         //password
};
*/
...
/*
var httpsServer = https.createServer(credentials, app);
*/

...
/*
httpsServer.listen(443);
httpsServer.on('error', onError);
httpsServer.on('listening', onListening);
*/
```
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

###step 5. System config
Now,you need to access you website:`http://hostname/start` or `https://hostname/start`.Add the corresponding information.

Ok, finished.Now,you can access you website.

###SSL
If you want to use SSL, please put the file into the SSL folder.You can look at step4.

###Admin
Access `https://hostname/admin` or `http://hostname/admin`,you can manage system.

###DUODHUO
Access `https://hostname/admin#wsconfing`, set ```short_name``` of duoshuo.

###LICENSE
[APACHE 2.0](https://github.com/pantsPoi/Spruche/blob/master/LICENSE)
