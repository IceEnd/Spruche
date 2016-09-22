(function ($) {
  $(document).ready(function () {
    $.ajax({
      type: 'POST',
      url: '/admin/index/appInfo',
      dataType: 'json',
      traditional: true,
      success: function (data){
        if(data.type){
          var html = '<div class="row"><label class="col-sm-2">当前版本：</label><span class="col-sm-10">'+data.appInfo.version+'</span></div>'+
            '<div class="row"><label class="col-sm-2">最新版本：</label><span class="col-sm-10">'+data.appInfo.latest+'</span></div>';
          if (data.appInfo.latest > data.appInfo.version) {
            html += '<div><a class="btn btn-primary" href="'+data.appInfo.url+'" target="_blank" >查看更新方案</a>'
          }
          $('#info-main').html(html);
          var height = $('html').height() + $('#info-main').height();
          console.log(height);
          $('#wrapper', parent.document).height(height);
          $('#content-iframe', parent.document).height(height);
        }
      },
      error: function (xhr, errorType, error) {
        //do nothing
      }
    })
  });
})(jQuery);