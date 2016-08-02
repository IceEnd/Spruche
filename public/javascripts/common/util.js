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

//获取DISQUS评论个数
function getCommentCount() {
    var disqusPublicKey = "RR7gTr0UICxmuw0KzRf6kx379osnkz6ePIGlcjN9B8O1q8Rv81SQkQ6JMTGtA6Hu";
    var disqusShortname = "coolecho";
    var urlArray = [];

    $('.disqus-comment-count').each(function () {
        var url = $(this).attr('data-disqus-url');
        urlArray.push('link:' + url);
    });

    $.ajax({
        type: 'GET',
        url: "https://disqus.com/api/3.0/threads/set.jsonp",
        data: { api_key: disqusPublicKey,forum : disqusShortname, thread : urlArray }, // URL method
        cache: false,
        dataType: "jsonp",
        success: function (result) {
            for (var i in result.response) {
                var countText = " comments";
                var count = result.response[i].posts;
                if (count == 1) countText = " comment";
                    $('.disqus-comment-count[data-disqus-url="' + result.response[i].link + '"]').html(count + countText);
            }
        }
    });
}