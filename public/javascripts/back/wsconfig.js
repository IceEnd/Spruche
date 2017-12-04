(function ($) {
  var $userform = $('#userform');
  var $email = $('#email');
  var $username = $('#username');
  var $wsname = $('#wsname');
  var $wsdescription = $('#wsdescription');
  var $shortname = $('#shortname');
  var $user_btn = $('#user_btn');
  var $duoshuo_btn = $('#duoshuo_btn');
  var $duoshuo_import_btn = $('#duoshuo_import_btn');

  $user_btn.click(function () {
    var email = $email.val();
    var username = $username.val();
    if (username === '' || email === '') {
      alert('用户信息不能为空');
      return;
    }
    if (!isEmail(email)) {
      alert('邮箱格式不正确');
      return;
    }
    var user = {
      id: $userform.attr('data-user'),
      email: $email.val(),
      username: $username.val()
    };
    $.ajax({
      type:'POST',
      url: '/admin/wsc/updateuser',
      dataType:'json',
      traditional: true,
      data: {
        user: JSON.stringify(user)
      },
      success: function (data) {
        if (data.type) {
          alert('修改成功');
          parent.location.reload();
        }
        else {
          alert('网络繁忙，请稍后再试...');
        }
      },
      error: function (xhr, errorType, error) {
        alert('网络繁忙，请稍后再试...');
      }
    });
  });

  $duoshuo_btn.click(function () {
    var ws = {
      name: $wsname.val(),
      description: $wsdescription.val()
    };
    $.ajax({
      type:'POST',
      url: '/admin/wsc/updatews',
      dataType:'json',
      traditional: true,
      data: {
        website: JSON.stringify(ws)
      },
      success: function (data) {
        if (data.type) {
          alert('修改成功');
          parent.location.reload();
        }
        else {
          alert('网络繁忙，请稍后再试...');
        }
      },
      error: function (xhr, errorType, error) {
        alert('网络繁忙，请稍后再试...');
      }
    });
  });

  $duoshuo_import_btn.click(function () {
    ajaxEmitter('/admin/wsc/importds', {}, function (response) {
      if (response.retCode === 0) {
        alert('导入成功');
      } else if (response.retCode === -1){
        alert('文件不存在，请仔细检查');
      } else if (response.retCode === 100001) {
        alert('部分评论导入失败，请校对文件（部分特殊字符无法导入数据库）');
      }
    });
  });

  //邮箱格式验证
  function isEmail(str) {
    var myreg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
    if(!myreg.test(str)) return false;
    return true;
  }

})(jQuery);