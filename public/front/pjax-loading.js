$(document).pjax('a[data-pjax="true"]', '#container',{fragment:'#container', timeout:8000});
$(document).on('pjax:beforeSend', function(){
  $('#progress-bar').animate({'width':'20%'});
});
$(document).on('pjax:send', function() {
  $('#progress-bar').animate({'width': '40%'});
});
$(document).on('pjax:complete', function() {
  $('#progress-bar').animate({'width': '80%'});
});
$(document).on('pjax:end', function() {
  $('#progress-bar').animate({'width': '100%'},function () {
    $('#progress-bar').css({'width':'0'});
  });
  SyntaxHighlighter.highlight();
  $("table.syntaxhighlighter").each(function () {
      if (!$(this).hasClass("nogutter")) {
          var $gutter = $($(this).find(".gutter")[0]);
          var $codeLines = $($(this).find(".code .line"));
          $gutter.find(".line").each(function (i) {
              $(this).height($($codeLines[i]).height());
              $($codeLines[i]).height($($codeLines[i]).height());
          });
      }
  });
  pajx_loadDuodshuo();
  DUOSHUO.ThreadCount($('.ds-thread-count'));
});