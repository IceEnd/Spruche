(function ($) {
    var $ifm = $("#content-iframe");
    var $wrapper = $('#wrapper');
    var $menu_li = $('.menu-li');
    var $sub_menu = $('.sub-menu');
    var $sub = $('.sub');
    var $sub_menu_li = $('.sub-menu-li');
    var $arrow = $('.arrow');
    var barHidden = false;
    
    var path = location.hostname + location.port +'/admin';
    
    window.onload = function () { 
        var hash = location.hash;
        hash = hash.substr(1,hash.length);
        if(hash == "") {
            hash = 'index';
            location.hash = hash;
        }
        $('.menu-li:not(.menu-'+hash+')').removeClass('active open');
        $('.menu-li.menu-'+hash).addClass('active');
        $('.sub-menu-li.menu-'+hash).addClass('active');
        $('.sub-menu-li.menu-'+hash).parent('.sub').addClass('active');
        $('.sub-menu-li.menu-'+hash).parent('.sub').slideDown(200);
        $ifm.attr('src','/admin/'+hash);
    }
    
    $ifm.load(function () {
       $(this).height($(this).contents().find('html').height());
       $wrapper.height($(this).contents().find('html').height());
    });
    
    $menu_li.each(function () {
        $(this).click(function () {
            $menu_li.removeClass('active');
            $sub_menu.removeClass('open active');
            $sub.slideUp(200);
            $arrow.removeClass('open');
            $(this).addClass('active');
            $ifm.attr('src','/admin/'+$(this).attr('data-src'));
            location.hash = $(this).attr('data-src');
        });
    });
    
    $sub_menu_li.each(function () {
        $(this).click(function () {
            $menu_li.removeClass('active');
            $sub_menu.removeClass('open active');
            $sub_menu_li.removeClass('active');
            $sub.removeClass('open active');
            $(this).parent('.sub').addClass('active');
            $(".sub:not(.active)").removeClass('open');
            $(".sub:not(.active)").slideUp(200);
            $(".sub:not(.active)").parents('.sub-menu').find('.arrow').removeClass('open');
            $(this).parents('.sub-menu').addClass('active'); 
            $(this).parent('.sub').slideDown();
            $(this).addClass('active');
            $ifm.attr('src','/admin/'+$(this).attr('data-src'));
            location.hash = $(this).attr('data-src');
        });
    });
    
    $('#sidebar .sub-menu > a').click(function () {
        var last = $('.sub-menu.open', $('#sidebar'));
        last.removeClass("open");
        $('.arrow', last).removeClass("open");
        $('.sub', last).slideUp(200);
        var sub = $(this).next();
        if (sub.is(":visible")) {
            $('.arrow', $(this)).removeClass("open");
            $(this).parent().removeClass("open");
            sub.slideUp(200);
        } else {
            $('.arrow', $(this)).addClass("open");
            $(this).parent().addClass("open");
            sub.slideDown(200);
        }
        var o = ($(this).offset());
        diff = 200 - o.top;
        if(diff>0)
            $("#sidebar").scrollTo("-="+Math.abs(diff),500);
        else
            $("#sidebar").scrollTo("+="+Math.abs(diff),500);
    });

    $('#tool-bar').click(function () {         //工具栏
        if(barHidden) {
            $('#sidebar').animate({"left":"0"}, 500);
            $("#main-content").animate({"margin-left": "180px"}, 500);
            barHidden = false;
        } else {
            $('#sidebar').animate({"left": "-180px"}, 500);
            $("#main-content").animate({"margin-left": "0"}, 500);
            barHidden = true;
        }
    });

    $("#logout").click(function () {
        $.cookie('uid', { expires: -1, path: "/"});
        $.cookie('email', { expires: -1, path: "/"});
        $.cookie('type', { expires: -1, path: "/"});
        $.cookie('token', { expires: -1, path: "/" });
        window.location.href="/";
    });
    
})($);