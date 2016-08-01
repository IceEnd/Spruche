(function ($) {

    var article_li = $('.article-li');
    var nav_ul_li = $('.nav_ul_li');

    var PATH = location.protocol + '//' + location.hostname + '/article/av';

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
    $('#container').on('click','#load-more-a',function () {
        $('#load-more-btn-div-cnt').css("display","none");
        $('#loding-div').css("display","block");
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
                    $('#loding-div').css('display','none');
                    var htmlStr = '';
                    for(var b in blogs){
                        htmlStr += '<li class="article-li"><article><div class="article-info-div"><div class="article-user-img-div float-left"><img src="'+
                            blogs[b].head_img+'"></div><div class="vertical-line-div float-left"><div class="vertical-line"></div></div><div class="article-info float-left">'+
                            '<h3 class="article-title-h"><span class="shine-font-span"></span><a href="/article/av'+blogs[b].id+'" data-pjax="true">'+blogs[b].title+'</a>'+
                            '</h3> <div class="article-other-info"><span><a class="article-author">'+blogs[b].username+'</a></span><span><a class="article-comments-num disqus-comment-count" data-disqus-url="'+PATH+
                            blogs[b].id+'" href="'+PATH+blogs[b].id+'#disqus_thread" data-pjax="true">0 Comments</a></span><span><a class="article-view-num">'+blogs[b].view_num+' Views</a></span><span><a class="article-date">'+
                            (new Date(blogs[b].publish_date)).getFullYear()+'-'+((new Date(blogs[b].publish_date)).getMonth()+1)+'-'+(new Date(blogs[b].publish_date)).getDate()+'</a></span></div></div>'+
                            '<div class="clearfix"></div></div>';


                        if(blogs[b].img != ''){
                            htmlStr += '<div class="article-img-div"><img src="'+blogs[b].img+'"></div>';
                        }

                        htmlStr += '<div class="article-summary-div"><a href="/article/av'+blogs[b].id+'" data-pjax="true"><p class="article-summary-p">'+
                            blogs[b].summary+'</p></a></div>';

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
                    $('#article-ul').append(htmlStr);
                    if(blogs.length == 10){
                        $('#load-more-btn-div-cnt').css('display','inline-block');
                    }
                    showArticle();
                    getCommentCount();
                }
                else{
                    myAlert('网络繁忙，请稍后再试...');
                    $('#loding-div').css('display','none');
                    $('#load-more-btn-div-cnt').css('display','inline-block');
                }
            },
            error: function (xhr, errorType, error) {
                myAlert('网络繁忙，请稍后再试...');
                 $('#loding-div').css('display','none');
                $('#load-more-btn-div-cnt').css('display','inline-block');
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

    $('#mobile-nav').bind('click', function(e) {  
        stopPropagation(e);   
    });

    function stopPropagation(e) {  
        if (e.stopPropagation)  
            e.stopPropagation();  
        else  
            e.cancelBubble = true;  
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

})($);