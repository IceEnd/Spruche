(function ($) {
    var loadMoreBtn = $('#load-more-a'),
        loadMoreBtnDiv = $('#load-more-btn-div-cnt'),
        loading = $('#loding-div'),
        article_ul = $('#article-ul'),
        article_li = $('.article-li');

    var PATH = location.protocol + '//' + location.hostname + '/article/av';

    var page = 1,h,t,s_top;
    var flag = true;
    //初始化
    function init(){
        h = window.innerHeight;
        s_top=document.documentElement.scrollTop;
        for(var i in article_li){
            t = article_li[i].offsetTop - s_top;
            if((t-h) < -50){
                article_li[i].style.left = '0';
             }
        }
    }
    init();
    

    //点击加载更多
    loadMoreBtn.bind('click',function () {
        loadMoreBtnDiv.css("display","none");
        loading.css('display','block');
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
                    loading.css('display','none');
                    var htmlStr = '';
                    for(var b in blogs){
                        htmlStr += '<li class="article-li"><article><div class="article-info-div"><div class="article-user-img-div float-left"><img src="'+
                            blogs[b].head_img+'"></div><div class="vertical-line-div float-left"><div class="vertical-line"></div></div><div class="article-info float-left">'+
                            '<h3 class="article-title-h"><span class="shine-font-span"></span><a href="/article/av'+blogs[b].id+'">'+blogs[b].title+'</a>'+
                            '</h3> <div class="article-other-info"><span><a class="article-author">'+blogs[b].username+'</a></span><span><a class="article-comments-num disqus-comment-count" data-disqus-url="'+PATH+
                            blogs[b].id+'" href="'+PATH+blogs[b].id+'#disqus_thread">0 Comment</a></span><span><a class="article-view-num">'+blogs[b].view_num+'</a></span><span><a class="article-date">'+
                            (new Date(blogs[b].publish_date)).getFullYear()+'-'+((new Date(blogs[b].publish_date)).getMonth()+1)+'-'+(new Date(blogs[1].publish_date)).getDate()+'</a></span></div></div>'+
                            '<div class="clearfix"></div></div>';


                        if(blogs[b].img != ''){
                            htmlStr += '<div class="article-img-div"><img src="'+blogs[b].img+'"></div>';
                        }

                        htmlStr += '<div class="article-summary-div"><a href="/article/av'+blogs[b].id+'"><p class="article-summary-p">'+
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
                    article_ul.append(htmlStr);

                    if(blogs.length == 10){
                        loadMoreBtnDiv.css('display','inline-block');
                    }
                    article_li = $('.article-li');
                    getCommentCount();
                }
                else{
                    myAlert('网络繁忙，请稍后再试...');
                    loading.css('display','none');
                    loadMoreBtnDiv.css('display','inline-block');
                }
            },
            error: function (xhr, errorType, error) {
                myAlert('网络繁忙，请稍后再试...');
                loading.css('display','none');
                loadMoreBtnDiv.css('display','inline-block');
            }
        });
    });

     closeAlert();

    //  var scrollFunc=function(e){ 
    //     h = window.innerHeight;
    //     e=e || window.event;
    //     if(e.wheelDelta){
    //         //IE/Opera/Chrome     
    //         for(var i in article_li){
    //             s_top=document.body.scrollTop;
    //             t = article_li[i].offsetTop - s_top;
    //             if((t-h) < -200){
    //                 article_li[i].style.left = '0';
    //             }
    //         }
    //     }else if(e.detail){
    //         //Firefox 
    //         for(var i in article_li){
    //             s_top=document.documentElement.scrollTop;
    //             t = article_li[i].offsetTop - s_top;
    //             if((t-h) < -200){ 
    //                 article_li[i].style.left = '0';
    //             }
    //         }
    //     } 
    // } 
    // //注册事件
    // if(document.addEventListener){ 
    //     document.addEventListener('DOMMouseScroll',scrollFunc,false); 
    // }
    // //W3C 
    // //IE/Opera/Chrome
    // window.onmousewheel=document.onmousewheel=scrollFunc; 

    $(window).bind("scroll", function(){ 
        //当滚动条滚动时
        h = window.innerHeight;
        for(var i in article_li){             
            s_top=$(document).scrollTop();
            t = article_li[i].offsetTop - s_top;
            if((t-h) < -50){
                article_li[i].style.left = '0';
            }
        }

        if(flag){
            $('#head_logo_div').animate({'margin-left':'15%'},800,function () {
                $('#head_nav_div').fadeIn(500);
            });
            $('#head_logo').css({'top':'5px','width':'70px','height':'70px','border-width':'2px','transform':'rotate(360deg)'});
            $('.motto').fadeOut(800);
            flag = false;
        }
    });

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