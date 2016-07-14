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
