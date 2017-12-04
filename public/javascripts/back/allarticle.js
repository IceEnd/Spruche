(function($){
    function ajaxFunc(postUrl, id, callback) {
        $.ajax({
            type: 'POST',
            url: postUrl,
            dataType: 'json',
            traditional: true,
            data: {
                "id": id
            },
            success: function (data){
                if(data.type){
                    callback();
                }
                else{
                    alert('网络繁忙，请稍后再试...');
                }
            },
            error: function (xhr, errorType, error) {
                alert('网络繁忙，请稍后再试...');
            }
        });
    }
    $(document).on('click', '.article_delete', function () {
        var id = $(this).data('id');
        var _this = $(this);
        ajaxFunc('/admin/write/delarticle', id, function () {
            _this.parents('.panel').slideUp();
        });
    });
    $(document).on('click', '.article-stick', function () {
        var id = $(this).data('id');
        var _this = $(this);
        ajaxFunc('/admin/write/stickarticle', id, function () {
            $('.stick-cont .article-stick-false').addClass('article-stick btn-default');
            $('.stick-cont .article-stick-false').text('置顶')
            $('.stick-cont .article-stick-false').removeClass('article-stick-false btn-danger');
            _this.addClass('article-stick-false btn-danger');
            _this.removeClass('article-stick btn-default');
            _this.text('取消置顶');
        });
    });
    $(document).on('click', '.article-stick-false', function () {
        var id = $(this).data('id');
        var _this = $(this);
        ajaxFunc('/admin/write/notstickarticle', id, function () {
            _this.addClass('article-stick btn-default');
            _this.removeClass('article-stick-false btn-danger');
            _this.text('置顶');
        });
    });
})($);