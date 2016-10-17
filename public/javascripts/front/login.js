function ($) {
    var $username = $('#username'),
      $password = $('#password'),
      $remember = $('#remember'),
      $btn = $('#sure_btn');

    $btn.bind('click', function () {
        if ($username.val() == '' || $password.val() == '') {
            myAlert('请输入用户名和密码');
            return false;
        }
        if (!isPassword($password.val())) {
            myAlert('密码只能输入6-20个字母、数字、下划线');
            return false;
        }
        else {
            $.ajax({
                type: 'POST',
                url: '/ulogin',
                dataType: 'json',
                traditional: true,
                data: {
                    "username": $username.val(),
                    "password": $password.val()
                },
                success: function (data) {
                    switch (data.type) {
                        case 0:
                            successLogin(data.user);
                            break;
                        case 1:
                            myAlert('用户名或密码错误');
                            break;
                    }
                },
                error: function (xhr, errorType, error) {
                    myAlert('网络繁忙，请稍后再试...');
                }
            });
            return false;
        }
    });

    //密码验证
    function isPassword(str) {
        var patrn = /^(\w){6,20}$/;
        if (!patrn.exec(str)) return false;
        return true
    }

    //成功登陆
    function successLogin(user) {
        var save = false;
        if($remember.is(':checked')){
            save = true;
        }
        if(save){
            $.cookie('uid',user.id, { expires: 7 ,path: "/"});
            $.cookie('username',user.username, { expires: 7 ,path: "/"});
            $.cookie('type',user.type, { expires: 7 ,path: "/"});
            $.cookie('token',user.token, { expires: 7 ,path: "/" })
        }
        else{
            $.cookie('uid',user.id, {path: "/"});
            $.cookie('username',user.username, {path: "/"});
            $.cookie('type',user.type, {path: "/"});
            $.cookie('token',user.token, { path: "/" })
        }
        window.location.href="/admin#index";
    }

    closeAlert();
})($);