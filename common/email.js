'use strict';

const nodemailer = require('nodemailer');

const email = require('../config').email;

const transporter = nodemailer.createTransport(email.options);

const tipsHtml = '<p>(此邮件由系统自动发出，请勿回复。如果此邮件不是您请求的，请忽略并删除)</p>';
const bodyHead = `<div style="border-right:#666666 1px solid;border-radius:8px;color:#111;font-size:12px;max-width:640px;width:100%;margin:auto;border-bottom:#666666 1px solid;font-family:微软雅黑,arial;margin:10px auto 0px;border-top:#666666 1px solid;border-left:#666666 1px solid">
<div style="width:600px;min-height:50px;color:black;border-radius:6px 6px 0 0;">
  <span style="line-height:50px;min-height:50px;margin-left:30px;font-size:16px;font-weight:bold;">
    <span style="color: #12ADDB;">&gt;</span`;

function getCommentUrl(url, threadKey, parentsId, insertId) {
  // if (pare)
}

/**
 * 获取邮件模版
 *
 * @param {Obejct}    commentInfo              评论信息
 * @param {String}    commentInfo.threadKey    页面threadKey
 * @param {String}    commentInfo.title        页面标题
 * @param {String}    commentInfo.url          网站地址
 * @param {String}    commentInfo.username     用户名称
 * @param {String}    commentInfo.message      评论
 * @param {Number}    commentInfo.pid          父评论ID
 * @param {Number}    commentInfo.rid          回复的评论
 *
 * @param {Object}    website                  站点信息
 *
 * @param {Number}    type                     0:admin 1:parent 2:reply
 */
function getTemplete (commentInfo, website, type) {
  const name = website.name;
  let subject;
  let text;
  let html;
  const { username, title, message, url, date, pid, threadKey, insertId } = commentInfo;
  switch (type) {
    case 0:
      subject = `Master， 【${name}】上有了新的留言印记`;
      text = `
        尊敬的Master,
          ${username} 于${date}在文章【${title}】上发表新的评论:

          “${message}”

            软萌萌的邮件姬敬上。

          (此邮件由系统自动发出，请勿回复。如果此邮件不是您请求的。请忽略并删除)
      `;
      html = `
      <div style="border-right:#666666 1px solid;border-radius:8px;color:#111;font-size:12px;max-width:640px;width:100%;margin:auto;border-bottom:#666666 1px solid;font-family:微软雅黑,arial;margin:10px auto 0px;border-top:#666666 1px solid;border-left:#666666 1px solid">
      <div style="width:600px;min-height:50px;color:black;border-radius:6px 6px 0 0;">
        <span style="line-height:50px;min-height:50px;margin-left:30px;font-size:16px;font-weight:bold;">
          <span style="color: #12ADDB;">&gt;</span>
            Master，
            <a style="color:#00bbff;font-weight:600;text-decoration:none" href="${url}" target="_blank">【${title}】</a>
            上有了新的留言！
        </span>
        </div>
        <div style="margin:0px auto;width:90%;border-top:1px solid #DDD;">
          <p>尊敬Master, 您好!</p>
          <p>${username} 于<span style="border-bottom:1px dashed #ccc;" t="5">${date}</span> 在文章《${title}》上发表评论: </p>
          <p style="background-color: #f5f5f5;border: 0px solid #DDD;padding: 10px 15px;margin:18px 0">${message}</p>
          <p>
            您可以点击 <a style="color:#00bbff;text-decoration:none" href="${url}${threadKey}?cpid=${pid || commentInfo.commentId}#comments" target="_blank">
            查看回复的完整內容</a>，感谢您对 <a style="color:#00bbff;text-decoration:none" href="${url}" target="_blank">${name}</a> 的关注(&lt;ゝω·)☆软萌萌的邮件姬敬上~比心~
          </p>
          ${tipsHtml}
        </div>
      </div>
      `;
      break;
    case 1:
      subject = `您在【${name}】上的评论有了新的回复～`;
      text = `
        尊敬的【Master】 ${commentInfo.rUsername}，您好！
          您于 ${commentInfo.rDate} 在文章【${title}】上发表的留言:

          “${commentInfo.rMessage}”

          ${username} 于 ${date} 留下了新的评论：

          “${message}”

            软萌萌的邮件姬敬上。

          (此邮件由系统自动发出，请勿回复。如果此邮件不是您请求的。请忽略并删除)
      `;
      html = `
      <div style="border-right:#666666 1px solid;border-radius:8px;color:#111;font-size:12px;max-width:640px;width:100%;margin:auto;border-bottom:#666666 1px solid;font-family:微软雅黑,arial;margin:10px auto 0px;border-top:#666666 1px solid;border-left:#666666 1px solid">
        <div style="width:600px;min-height:50px;color:black;border-radius:6px 6px 0 0;">
          <span style="line-height:50px;min-height:50px;margin-left:30px;font-size:16px;font-weight:bold;">
            <span style="color: #12ADDB;">&gt;</span>
            您在
            <a style="color:#00bbff;font-weight:600;text-decoration:none" href="${url}" target="_blank">【${title}】</a>
            上的留言有新回复啦！
          </span>
        </div>
        <div style="margin:0px auto;width:90%;border-top:1px solid #DDD;">
          <p>${commentInfo.pUsername}，您好！</p>
          <p>您于<span style="border-bottom:1px dashed #ccc;" t="5">${commentInfo.pDate}</span> 在文章《${title}》上发表留言: </p>
          <p style="background-color: #f5f5f5;border: 0px solid #DDD;padding: 10px 15px;margin:18px 0">${commentInfo.rMessage}</p>
          <p>${username} 于<span style="border-bottom:1px dashed #ccc;" t="5">${date}</span> 发表的新评论如下: </p>
          <p style="background-color: #f5f5f5;border: 0px solid #DDD;padding: 10px 15px;margin:18px 0">${message}</p>
          <p>
            您可以点击 <a style="color:#00bbff;text-decoration:none" href="${url}${threadKey}?cpid=${pid}#comments" target="_blank">
            查看回复的完整內容</a>，感谢您对 <a style="color:#00bbff;text-decoration:none" href="${url}" target="_blank">${name}</a> 的关注(&lt;ゝω·)☆软萌萌的邮件姬敬上~比心~
          </p>
          ${tipsHtml}
        </div>
      </div>
      `;
      break;
    case 2:
      subject = `您在【${name}】上的评论收到了回复～`;
      text = `
        尊敬的【Master】 ${commentInfo.rUsername}，您好！
          您于 ${commentInfo.rDate} 在文章【${title}】上发表的评论:

          “${commentInfo.rMessage}”

          ${username} 于 ${date} 给您的回复如下：

          “${message}”

            软萌萌的邮件姬敬上。

          (此邮件由系统自动发出，请勿回复。如果此邮件不是您请求的。请忽略并删除)
      `;
      html = `
      <div style="border-right:#666666 1px solid;border-radius:8px;color:#111;font-size:12px;max-width:640px;width:100%;margin:auto;border-bottom:#666666 1px solid;font-family:微软雅黑,arial;margin:10px auto 0px;border-top:#666666 1px solid;border-left:#666666 1px solid">
        <div style="width:600px;min-height:50px;color:black;border-radius:6px 6px 0 0;">
          <span style="line-height:50px;min-height:50px;margin-left:30px;font-size:16px;font-weight:bold;">
            <span style="color: #12ADDB;">&gt;</span>
            您在
            <a style="color:#00bbff;font-weight:600;text-decoration:none" href="${url}" target="_blank">【${title}】</a>
            上的留言有回复啦！
          </span>
        </div>
        <div style="margin:0px auto;width:90%;border-top:1px solid #DDD;">
          <p>${commentInfo.rUsername}，您好！</p>
          <p>您于<span style="border-bottom:1px dashed #ccc;" t="5">${commentInfo.rDate}</span> 在文章《${title}》上发表评论: </p>
          <p style="background-color: #f5f5f5;border: 0px solid #DDD;padding: 10px 15px;margin:18px 0">${commentInfo.rMessage}</p>
          <p>${username} 于<span style="border-bottom:1px dashed #ccc;" t="5">${date}</span> 给您的回复如下: </p>
          <p style="background-color: #f5f5f5;border: 0px solid #DDD;padding: 10px 15px;margin:18px 0">${message}</p>
          <p>
            您可以点击 <a style="color:#00bbff;text-decoration:none" href="${url}${threadKey}?cpid=${pid}#comments" target="_blank">
            查看回复的完整內容</a>，感谢您对 <a style="color:#00bbff;text-decoration:none" href="${url}" target="_blank">${name}</a> 的关注(&lt;ゝω·)☆软萌萌的邮件姬敬上~比心~
          </p>
          ${tipsHtml}
        </div>
      </div>
      `;
      break;
  }
  return {
    subject,
    text,
    html,
  }
}

/**
 * 异步发送单个通知邮件
 *
 * @param {Object}    user                     收件人信息
 *
 * @param {Obejct}    commentInfo              评论信息
 * @param {String}    commentInfo.threadKey    页面threadKey
 * @param {String}    commentInfo.title        页面标题
 * @param {String}    commentInfo.url          网站地址
 * @param {String}    commentInfo.username     用户名称
 * @param {String}    commentInfo.message      评论
 * @param {Number}    commentInfo.pid          父评论ID
 * @param {Number}    commentInfo.rid          回复的评论
 * 
 * @param {Object}    website                  站点信息
 * @param {Number}    type                     0:admin 1:parent 2:reply 3:admin的评论得到
 */
function sendMail(to, commentInfo, website, type) {
  const { subject, text, html } = getTemplete(commentInfo, website, type);
  const mailOptions = {
    from: `"${email.username}" ${email.options.auth.user}`,
    to,
    subject,
    text,
    html,
  };
  transporter.sendMail(mailOptions, (error) => {
    if (error) {
      console.warn(error);
    } else {
      return true;
    }
  });
}

function arrayHasElement(arr, target) {
  let res = false;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) {
      res = true;
      break;
    }
  }
  return res;
}

function sender(admin, commentInfo, website) {
  const sended = [];
  if (commentInfo.rid !== 0 && commentInfo.rEmail && commentInfo.uid !== commentInfo.rUserId) {
    sended.push(commentInfo.rUserId);
    sendMail(commentInfo.rEmail, commentInfo, website, 2);
  }
  if (commentInfo.pid !== 0 && commentInfo.pEmail && commentInfo.uid !== commentInfo.pUserId) {
    if(!arrayHasElement(sended, commentInfo.pUserId)) {
      sended.push(commentInfo.pUserId);
      sendMail(commentInfo.pEmail, commentInfo, website, 1);
    }
  }
  if (!arrayHasElement(sended, admin.id) && commentInfo.uid != admin.id) {
    sended.push(admin.id);
    sendMail(admin.email, commentInfo, website, 0);
  }
  console.log(sended);
}

module.exports = {
  transporter,
  sendMail,
  sender,
}
