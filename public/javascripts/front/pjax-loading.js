$(document).pjax('a[href!="/"]', '#container',{fragment:'#container'});
$(document).on('pjax:beforeSend', function(){
  $('#progress-bar').animate({'width':'20%'});
});
$(document).on('pjax:send', function() {
  $('#progress-bar').animate({'width': '40%'});
});
$(document).on('pjax:complete', function() {
  $('#progress-bar').animate({'width': '90%'});
});
$(document).on('pjax:end', function() {
  $('#progress-bar').animate({'width': '100%'},function () {
    $('#progress-bar').css({'width':'0'});
  });
});