'use strict';

const express = require('express');
const router = express.Router();

const usersDao = require('../dao/usersDao');

router.post('/profile', async (req, res) => {
  const form = JSON.parse(req.body.form);
  try {
    const result = await usersDao.getUserToken(form.uid, form.token);
    if (result.length === 1 && result[0].state === 0) {
      const userInfo = result[0];
      delete userInfo.password;
      delete userInfo.state;
      res.send({
        retCode: 0,
        retMsg: '',
        retData: userInfo
      })
    } else {
      throw new Error('用户不存在');
    }
  } catch (ex) {
    res.send({
      retCode: 10001,
      retMsg: '登陆超时',
      retData: {}
    });
    res.end();
  }
});

module.exports = router;