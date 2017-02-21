(function($){
  var $friendName = $('#friend_name');
  var $friendWebsite = $('#friend_website');
  var $friendDescription = $('#friend_description');
  var $friendsUrl = $('#friends_url');
  var $friendsHead = $('#friends_head');
  var $frinedSaveBtn = $('#frined_save_btn');

  $(document).on('click', '.frined-alter', function () {
    var thumbnail = $(this).parents('.thumbnail');
    $friendName.val(thumbnail.find('.friend-name').text());
    $friendWebsite.val(thumbnail.find('.friend-website').text());
    $friendDescription.val(thumbnail.find('.friend-description').text());
    $friendsUrl.val(thumbnail.find('.friend-website').attr('href'));
    $('#add_friend_form').attr('data-type', false);
    $('#add_friend_form').attr('data-src', thumbnail.find('img').attr('src'));
    $('#add_friend_form').attr('data-id', $(this).attr('data-id'));
  });

  $(document).on('click', '.frined-delete', function () {
    $.ajax({
      type: 'POST',
      url: '/admin/friendsconfig/delete',
      dataType: 'json',
      traditional: true,
      data: {
        "id": $(this).attr('data-id')
      },
      success: function (data){
        if(data.retCode === '0'){
          alert('删除成功');
          window.location.reload();
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

  function isEmptyFriendInfo(flag) {
    var result;
    if (flag) {
      result = ($friendName.val() === '' || $friendWebsite.val() === '' || $friendDescription.val() === '' || $friendsUrl.val() === '' || $friendsHead.val() === '');
    } else {
      result = ($friendName.val() === '' || $friendWebsite.val() === '' || $friendDescription.val() === '' || $friendsUrl.val() === '');
    }
    return result;
  }

  $frinedSaveBtn.bind('click', function () {
    var flag = $('#add_friend_form').attr('data-type') === "true";
    var url = '/admin/friendsconfig/addfriend';
    if (!flag) {
      url = '/admin/friendsconfig/alterfriend';
    }
    if (isEmptyFriendInfo(flag)) {
        alert("信息不能为空");
        return ;
    }
    if (!isUrl($friendsUrl.val())) {
      alert("网址不正确");
      return ;
    }
    var imgType = true;
    if ($friendsHead.val() !== '') {
      var lodt = $friendsHead.val().lastIndexOf(".");
      var type = $friendsHead.val().substring(lodt+1);
      imgType = /(gif|jpg|jpeg|png|svg|GIF|JPG|PNG|SVG)$/.test(type);
    }
    if (!imgType) {
      alert('只能上传图片');
      return ;
    }
    var formData = new FormData();
    formData.append('friendName', $friendName.val());
    formData.append('friendWebsite', $friendWebsite.val());
    formData.append('friendDescription', $friendDescription.val());
    formData.append('friendsUrl', $friendsUrl.val());
    if (!flag) {
      formData.append('id',  $('#add_friend_form').attr('data-id'));
    }
    if ($friendsHead.val() !== '') {
      formData.append('friendhead', $friendsHead[0].files[0]);
    } else {
      formData.append('head', $('#add_friend_form').attr('data-src'));
    }
    $.ajax({
      type:'POST',
      url: url,
      data: formData,
      cache: false,
      contentType: false,
      processData: false,
      success: function (data) {
        if (data.retCode === "0") {
          var tip = '添加成功';
          if (!flag) {
            tip = '修改成功';
          }
          alert(tip);
          parent.location.reload();
        }
        else {
          alert('网络繁忙，请稍后再试...');
        }
      },
      error: function () {
        alert('网络繁忙，请稍后再试...');
      }
    });
    return;
  });

  function isUrl(str){
    var reg = /^([hH][tT]{2}[pP]:\/\/|[hH][tT]{2}[pP][sS]:\/\/)(([A-Za-z0-9-~]+)\.)+([A-Za-z0-9-~\/])+$/;
    if (reg.test(str)) {
      return true;
    }
    return false;
  }

})(jQuery);