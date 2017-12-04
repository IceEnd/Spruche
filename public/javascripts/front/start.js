(function ($) {
    var $startWebsite = $('#start-website'),
        $startUsername = $('#start-username'),
        $startEmail = $('#start-email'),
        $startPassword = $('#start-password'),
        $startRePassword = $('#start-rpassword'),
        $startSureBtn = $('#start_sure_btn');
    
    var domain = location.protocol + '//'+ location.hostname;

    $startSureBtn.bind('click', function () {
        if ($startWebsite.val() == '' || $startUsername.val() == '' || $startEmail.val() == '' || $startPassword.val() == '' || $startRePassword.val() == '') {
            myAlert('信息不能为空');
            return false;
        }
        if (!isPassword($startPassword.val())) {
            myAlert('密码只能输入6-20个字母、数字、特殊字符');
            return false;
        }
        if(!isEmail($startEmail.val())){
            myAlert('请输入正确的邮箱');
            return false;
        }
        if ($startPassword.val() == $startRePassword.val()) {
            $.ajax({
                type: 'POST',
                url: '/start',
                dataType: 'json',
                traditional: true,
                data: {
                    "website":$startWebsite.val(),
                    "username":$startUsername.val(),
                    "email":$startEmail.val(),
                    "password":$startPassword.val(),
                    'domain':domain
                },
                success: function (data) {
                    if(data){
                        window.location.href = '/login';
                    } 
                },
                error: function (xhr, errorType, error) {
                    myAlert('网络繁忙，请稍后再试...');
                }
            });
            return false;
        }
        else {
            myAlert('两次密码不一样');
            return false;
        }
    });

    //密码验证
    function isPassword(str) {
        var patrn = /^(\w|@|#|\$|%|\^|&|\*){6,20}$/;
        if (!patrn.exec(str)) return false;
        return true
    }
    
    //邮箱格式验证
    function isEmail(str) {
         var myreg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
         if(!myreg.test(str)) return false;
         return true;
    }

    //关闭对话框
    closeAlert();

})(jQuery);