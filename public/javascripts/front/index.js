(function ($) {

    var article_li = $('.article-li');
    var nav_ul_li = $('.nav_ul_li');

    var PATH = location.protocol + '//' + location.hostname + '/article/av';

    var wheelAble = true;

    var page = 1,h,t,s_top;
    var flag = true,menu_none = true;
    //初始化
    function init(){
        h = window.innerHeight;
        s_top=document.documentElement.scrollTop;
        for(var i = 0; i < article_li.length; i++){
            t = article_li[i].offsetTop - s_top;
            if((t-h) < -50){
                article_li[i].style.left = '0';
             }
        }
    }
    init();

    //点击加载更多
    $('#container').on('click','#load-more-btn-div-cnt',function () {
        $('#load-more-btn-div-cnt').css("display","none");
        $('#loading-div').css("display","block");
        $.ajax({
            type: 'POST',
            url: '/loadmoreav',
            dataType: 'json',
            traditional: true,
            data:{
                page:page
            },
            success: function (data){
                if(data.type){
                    var blogs = data.blogs;
                    page++;
                    var htmlStr = '';
                    for(var b in blogs){
                        htmlStr += '<li class="article-li"><article><div class="article-info-div"><div class="article-user-img-div float-left"><img src="'+
                            blogs[b].head_img+'"></div><div class="vertical-line-div float-left"><div class="vertical-line"></div></div><div class="article-info float-left">'+
                            '<h3 class="article-title-h"><span class="shine-font-span"></span><a href="/article/av'+blogs[b].id+'" data-pjax="true">'+blogs[b].title+'</a>'+
                            '</h3> <div class="article-other-info"><span><a class="article-author">'+blogs[b].username+'</a></span><span><a class="article-comments-num ds-thread-count" data-thread-key="'+
                            blogs[b].id+'" data-count-type="comments" data-pjax="true">0 Comments</a></span><span><a class="article-view-num">'+blogs[b].view_num+' Views</a></span><span><a class="article-date">'+
                            (new Date(blogs[b].publish_date)).getFullYear()+'-'+((new Date(blogs[b].publish_date)).getMonth()+1)+'-'+(new Date(blogs[b].publish_date)).getDate()+'</a></span></div></div>'+
                            '<div class="clearfix"></div></div>';


                        if(blogs[b].img != ''){
                            htmlStr += '<div class="article-img-div"><img src="'+blogs[b].img+'"></div>';
                        }

                        htmlStr += '<div class="article-summary-div"><a href="/article/av'+blogs[b].id+'" data-pjax="true"><p class="article-summary-p">'+
                            blogs[b].summary.substr(0, 155)+'</p></a></div>';

                        if(blogs[b].tags != ''){
                            htmlStr += '<div class="article-tags-div">';
                            var tags = blogs[b].tags.split(',');
                            for(var t in tags){
                                htmlStr += '<a>'+tags[t]+'</a>';
                            }
                            htmlStr += '</div>';
                        }

                        htmlStr += '<div class="horizontal-line-div"><div class="vertical-line"></div></div></article></li>';
                    }
                    setTimeout(function () {
                        $('#loading-div').css('display','none');
                        $('#article-ul').append(htmlStr);
                        if(blogs.length == 10){
                            $('#load-more-btn-div-cnt').css('display','inline-block');
                        }
                        showArticle();
                        DUOSHUO.ThreadCount($('.ds-thread-count'));
                    }, 600);
                }
                else{
                    setTimeout(function () {
                        myAlert('网络繁忙，请稍后再试...');
                        $('#loading-div').css('display','none');
                        $('#load-more-btn-div-cnt').css('display','inline-block');
                    }, 500);
                }
            },
            error: function (xhr, errorType, error) {
                setTimeout(function () {
                    myAlert('网络繁忙，请稍后再试...');
                    $('#loading-div').css('display','none');
                    $('#load-more-btn-div-cnt').css('display','inline-block');
                }, 1000);
            }
        });
    });

    closeAlert();

    $(window).on("scroll", function(){
        //当滚动条滚动时
        showArticle();

        if(flag){
            $('#head_logo_div').animate({'left':'20%'},800,function () {
                $('#head_nav_div').fadeIn(500);
            });
            $('#head_logo').css({'top':'5px','width':'70px','height':'70px','border-width':'2px','transform':'rotate(360deg)'});
            $('.motto').fadeOut(800);

            flag = false;
        }

        if($(document).scrollTop() >= 100){
            $('#backtop').fadeIn(500);
        }
        else{
            $('#backtop').fadeOut(500);
        }
    });

    function showArticle() {
        article_li = $('.article-li');
        h = window.innerHeight;
        for(var i = 0; i < article_li.length; i++){
            s_top=$(document).scrollTop();
            t = article_li[i].offsetTop - s_top;
            if((t-h) < -50){
                article_li[i].style.left = '0';
            }
        }
    }

    //菜单弹出
    function showMenu(){
        $('#mobile-nav').stop(true.false).animate({'left':'0'},200);
    }
    function hiddenMenu(){
        $('#mobile-nav').stop(true.false).animate({'left':'-60%'},200);
    }

    $('#get-menu-icon').bind('click',function (e) {
        stopPropagation(e);
        if(menu_none){
            showMenu();
            menu_none = false;
        }
    });

    $(document).bind('click', function() {
        hiddenMenu();
        menu_none = true;
    });

    $(document).bind('touchstart', function() {
        hiddenMenu();
        menu_none = true;
    });

    $('#mobile-nav').bind('click', function(e) {
        stopPropagation(e);
    });

    function stopPropagation(e) {
        if (e.stopPropagation)
            e.stopPropagation();
        else
            e.cancelBubble = true;
    }

    $(document).on('click', '.article-content-div img', function () {
        $('.img-view img').attr('src', $(this).attr('src'));
        $('.img-view h5').text($(this).attr('alt'));
        imgViewSize(true);
        wheelAble = false;
    });

    $('.img-view').bind('click', function () {
        $('.img-view').slideUp('slow', function () {
            $('.img-view img').attr('src', '');
        });
        wheelAble = true;
    });

    function getImageWidth(url,callback) {
        var img = new Image();
        img.src = url;
        if(img.complete){
            callback(img.width, img.height);
        }else{
            // 完全加载完毕的事件
            img.onload = function(){
                callback(img.width, img.height);
            }
        }
    }

    function imgViewSize(flag) {
        getImageWidth($('.img-view img').attr('src'), function (imgWidth, imgHeight) {
            var width = $('.img-view').width();
            var height = $('.img-view').height();
            console.log(width);
            console.log(height);
            if((imgWidth / imgHeight) > (width / height)) {
                var marginTop = -(imgHeight / ( imgWidth / width)) / 2 * 0.8;
                $('.img-view img').css({width: '100%', height:'auto', top: '50%', 'margin-top': marginTop + 'px'});
            } else if ((imgWidth / imgHeight) === (width / height)){
                $('.img-view img').css({width: '100%', height:'100%', top: '0', 'margin-top': '0'});
            } else {
                $('.img-view img').css({width: 'auto', height:'100%', top: '0', 'margin-top': '0'});
            }
            if(flag) {
                $('.img-view').slideDown('slow');
            }
        });
    }

    $(window).bind("wheel",function(event){
        if(!wheelAble) {
            event.preventDefault();
            return false;
        }
    });

    $(document).on('click', '#backtop', function () {
        event.preventDefault();
        $('body,html').animate({
            scrollTop: 0,
        },600);
    });

})(jQuery);