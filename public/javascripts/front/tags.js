(function ($) {
  $(document).ready(function () {
    if(!isMobile()){
      $.ajax({
        type: 'POST',
        url: '/tags',
        dataType: 'json',
        traditional: true,
        data: {},
        success: function (data) {
          if(data.type){
            initTags(data.tags)
          }
        },
        error: function (xhr, errorType, error) {
          //do nothing
        }
      });
    } else {
      $('#tags-canvas-content').css('display', 'none');
    }
  });

  //初始化tags
  function initTags(tags) {
    var tagsHtml = '';
    for(var i = tags.length-1; i >= 0; i--){
      tagsHtml += '<a>'+tags[i].tags_name+'</a>';
    }
    $('#tags').html(tagsHtml);
    startCanvas();
  }

  //启动canvas
  function startCanvas(){
    try {
      var i, et = document.getElementById('tags').childNodes;
      for (i in et) {
        et[i].nodeName == 'A' && et[i].addEventListener('click', function (e) {
          e.preventDefault();
        });
      }
      $('#tag_canvas').attr('width', $(window).width());
      $('#tag_canvas').attr('height', $(window).height());
      TagCanvas.Start('tag_canvas', 'tags', {
        textColour: '#a7a7a7',
        outlineColour: '#ffffff',
        reverse: true,
        textHeight: 15,
        bgOutlineThickness: 0,
        depth: 0.5,
        dragControl: false,
        decel:0.75,
        dragThreshold: 10,
        fadeIn: 3000,
        maxSpeed: 0.05,
        initial: [-0.1, 0.1],
        maxBrightness: 0.8,
        maxSpeed:0.03,
        noSelect: true,
        wheelZoom: false,
      });
    } catch (e) {
      // something went wrong, hide the canvas container
      //document.getElementById('myCanvasContainer').style.display = 'none';
    }
  }

  //窗口改变事件
  $(window).resize(function () {
    $('#tag_canvas').attr('width', $(window).width());
    $('#tag_canvas').attr('height', $(window).height());
  });
})(jQuery);