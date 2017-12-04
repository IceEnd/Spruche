(function ($) {
  $(document).ready(function () {
    var height = $('html').height() + $('#info-main').height();
    $('#wrapper', parent.document).height(height);
    $('#content-iframe', parent.document).height(height);
  });

})(jQuery);