var express = require('express');
var router = express.Router();
var ueditor = require("ueditor");
var path = require('path');

router.get('/ueditor', function (req, res) {
  if (req.query.action === 'uploadimage') {
    const foo = req.ueditor;
    const imgname = req.ueditor.filename;
    const img_url = '/upload/images/';
    //你只要输入要保存的地址 。保存操作交给ueditor来做
    res.ue_up(img_url);
  }
  //  客户端发起图片列表请求
  else if (req.query.action === 'listimage') {
    const dir_url = '/images/ueditor/';
    // 客户端会列出 dir_url 目录下的所有图片
    res.ue_list(dir_url);
  }
  // 客户端发起其它请求
  else {
    res.setHeader('Content-Type', 'application/json');
    res.redirect('/ueditor/nodejs/config.json');
  }
});

router.post('/ueditor', ueditor(path.join(__dirname, '../public'), function(req, res) {
  const date = new Date();
  if (req.query.action === 'uploadimage') {
    const foo = req.ueditor;
    const imgname = req.ueditor.filename;
    var img_url = '/upload/images/'+date.getFullYear()+'/'+date.getMonth()+'/';
    //图片上传
    res.ue_up(img_url);
  }
}));

module.exports = router;