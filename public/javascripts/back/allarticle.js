(function($){
    $('.article_delete').bind('click',function(){
        var id = $(this).data('id');
        var _this = $(this);
        //$(this).parents('.panel').slideUp();
        $.ajax({
            type: 'POST',
            url: '/admin/write/delarticle',
            dataType: 'json',
            traditional: true,
            data: {
                    "id": id
            },
            success: function (data){
                if(data.type){
                    _this.parents('.panel').slideUp();
                }
                else{
                    alert('网络繁忙，请稍后再试...');
                }
            },
            error: function (xhr, errorType, error) {
                alert('网络繁忙，请稍后再试...');
            }
        });
    });
})($);