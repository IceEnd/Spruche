var alert_flag = false;
var timer;

/** 自定义提示框 */
function myAlert(str) {
  $('#alert_content_p').text(str);
  $('#alert_container').fadeIn(300);
  $('#alert_div').slideToggle(300);
}

/**　关闭提示框 */
function closeAlert(){
  $('#alert-btn').bind('click',function(){
    $('#alert_container').fadeOut(300);
    $('#alert_div').slideToggle(300);
  });
}

/**
 * 判断是否在移动端
 */
function isMobile() {
  var isAndroid = navigator.userAgent.match(/Android/i)? true : false;
  var isIOS = navigator.userAgent.match(/iPhone|iPad|iPod/i)? true : false;
  var isWindowsMobile = navigator.userAgent.match(/IEMobile/i)? true : false;
  var isBalckBerry = navigator.userAgent.match(/BlackBerry/i)? true : false;
  if(isAndroid || isIOS || isWindowsMobile || isBalckBerry){
    return true;
  }
  return false;
}

function getQueryStringByName(name) {
  var result = location.search.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));
  if (result === null || result.length < 1) {
    return "";
  }
  return result[1];
}

/**
 *  Ajax公用方法
 */
;(function ($, window) {
  function ajaxEmitter(url, data, callback) {
    $.ajax({
      type: 'POST',
      url: url,
      dataType: 'json',
      traditional: true,
      data: {
        reqData: JSON.stringify(data)
      },
      success: function (response) {
        callback(response);
      },
      error: function () {
        setTimeout(function () {
          myAlert('网络繁忙，请稍后再试...');
        }, 1000);
      }
    });
  }
  window.ajaxEmitter = ajaxEmitter;
})(jQuery, window);