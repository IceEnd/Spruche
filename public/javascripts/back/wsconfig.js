(function ($) {
  var $userform = $('#userform');
  var $email = $('#email');
  var $username = $('#username');
  var $wsname = $('#wsname');
  var $wsdescription = $('#wsdescription');
  var $shortname = $('#shortname');
  var $user_btn = $('#user_btn');
  var $duoshuo_btn = $('#duoshuo_btn');

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
      url: '/admin/updateuser',
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
      description: $wsdescription.val(),
      short_name: $shortname.val()
    };
    console.log(ws);
    $.ajax({
      type:'POST',
      url: '/admin/updatews',
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

  //邮箱格式验证
  function isEmail(str) {
    var myreg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
    if(!myreg.test(str)) return false;
    return true;
  }

})(jQuery);