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

function pajx_loadDuodshuo(){
    var dus=$(".ds-thread");
    if($(dus).length==1){
        var el = document.createElement('div');
        el.setAttribute('data-thread-key',$(dus).attr("data-thread-key"));//必选参数
        el.setAttribute('data-url',$(dus).attr("data-url"));
        DUOSHUO.EmbedThread(el);
        $(dus).html(el);         
    }
}

/**
 * 禁止复制
 */
// $('body').bind("selectstart",function(){return false;});