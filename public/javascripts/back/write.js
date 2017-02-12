(function ($) {
    var tags_ipt = $('#tags-ipt');
    var add_classify_ipt = $('#add-classify-ipt');
    var blog_title_ipt = $('#blog-title-ipt');

    var add_tags = $('#add-tags');
    var add_classify = $('#add-classify');

    var tags_div = $('#tags-div');
    var blog_form = $('#blog-form');
    var classify_ul = $('#classify-ul');

    var save_btn = $('#save-btn'),
        publish_btn = $('#publish-btn'),
        alter_btn = $('#alter-btn'),
        update_btn = $('#update-btn');

    var edit = false;

    var tags = [];

    var reg = /^,|,$/gi;

    //初始化
    function init() {
        if($('#write-content').attr('data-type') == 'true'){
            edit = true;
        }
        if(edit){
            if($('#tags-div').attr('data-tags') != ''){
                tags = $('#tags-div').attr('data-tags').split(',');
            }
        }
        console.log(tags);
    }

    init();

    //添加标签
    add_tags.bind('click', function () {
        var tags_str = tags_ipt.val();
        tags_str = tags_str.replace(reg,'');
        var temp = [];
        if (tags_str) {
            temp = tags_str.split(',');
            tags = tags.concat(temp);
            tags = detection(tags);
            tags_div.html('');
            for (var i in tags) {
                tags_div.append('<a class="tags-a"><span class="glyphicon glyphicon-remove remove-tags"></span><span class="tags-span">' + tags[i] + '</span></a>');
            }
            tags_ipt.val('');
        }
    });

    //删除标签  
    tags_div.on('click', '.remove-tags', function () {
        var tag = $(this).parent().children('.tags-span').text();
        removeTag(tag, tags);
        $(this).parent().css('display', 'none');
    });

    //添加分类
    add_classify.bind('click', function () {
        var classify = add_classify_ipt.val();
        classify = classify.replace(/^\s+|\s+$/g, '');
        var flag = true;
        $('.classify-ipt').each(function () {
            if ($(this).attr('data-name') == classify) {
                alert('分类名称重复');
                flag = false;
                return;
            }
        });
        if (flag) {
            $.ajax({
                type: 'POST',
                url: '/admin/write/addclassify',
                dataType: 'json',
                traditional: true,
                data: {
                    "classify": classify
                },
                success: function (data) {
                    if (data.type) {
                        classify_ul.append('<li class="classify-li"><input class="classify-ipt" name="classify" type="radio" value="' + data.id +
                            '" data-name="' + classify + '"/><span>' + classify + '</span></li>');
                        add_classify_ipt.val('');
                    } else {
                        alert('网络繁忙，请稍后再试...');
                    }
                },
                error: function (xhr, errorType, error) {
                    alert('网络繁忙，请稍后再试...');
                }
            });
        }
    });

    //发表文章
    publish_btn.bind('click', function () {
        if (blog_title_ipt.val() == '') {
            alert('请输入文章标题');
            return;
        }
        var blog = getContent();
        if (blog.content == '') {
            alert('请输入文章内容');
            return;
        }
        blog.state = 0;
        saveBlog(blog);
    });

    //保存草稿
    save_btn.bind('click', function () {
        if (blog_title_ipt.val() == '') {
            alert('请输入文章标题');
            return;
        }
        var blog = getContent();
        if (blog.content == '') {
            alert('请输入文章内容');
            return;
        }
        blog.state = 1;
        saveBlog(blog);
    });

    //修改博客
    alter_btn.bind('click',function () {
        if (blog_title_ipt.val() == '') {
            alert('请输入文章标题');
            return;
        }
        var blog = getContent();
        if (blog.content == '') {
            alert('请输入文章内容');
            return;
        }
        alterBlog(blog);
    });

    //更新发布
    update_btn.bind('click',function () {
        if (blog_title_ipt.val() == '') {
            alert('请输入文章标题');
            return;
        }
        var blog = getContent();
        if (blog.content == '') {
            alert('请输入文章内容');
            return;
        }
        blog.state = 0;
        alterBlog(blog);
    });

    //save博客
    function saveBlog(blog) {
        $.ajax({
            type: 'POST',
            url: '/admin/write/sblog',
            dataType: 'json',
            traditional: true,
            data: {
                blog: JSON.stringify(blog)
            },
            success: function (data) {
                if (data.type) {
                    parent.location.href = '/admin';
                }
                else {
                    alert('网络繁忙，请稍后再试...');
                }
            },
            error: function (xhr, errorType, error) {
                alert('网络繁忙，请稍后再试...');
            }
        });
    }

    //修改内容
    function alterBlog(blog) {
        $.ajax({
            type:'POST',
            url: '/admin/write/ablog',
            dataType:'json',
            traditional: true,
            data: {
                blog: JSON.stringify(blog)
            },
            success: function (data) {
                if (data.type) {
                    parent.location.reload();
                }
                else {
                    alert('网络繁忙，请稍后再试...');
                }
            },
            error: function (xhr, errorType, error) {
                alert('网络繁忙，请稍后再试...');
            }
        });
    }

    //封装博客内容
    function getContent() {
        var blog = {};
        blog.title = blog_title_ipt.val();
        var arr = [];
        arr.push(UE.getEditor('editor').getContent());
        blog.content = arr.join('\n');
        blog.summary = htmlspecialchars(UE.getEditor('editor').getContentTxt().substr(0,180) + '...');
        blog.tags = tags;
        blog.classify_name = $('.classify-ipt:checked').attr('data-name');
        blog.classify_id = $('.classify-ipt:checked').val();
        blog.img = '';
        if(edit){
            blog.id = $('#write-content').attr('data-id');
            blog.content = blog.content.replace(/\\/g,'/');
        }
        return blog;
    }

    //数组去重
    function detection(arr) {
        var res = [], isRepeated;
        for (var i = 0; i < arr.length; i++) {
            isRepeated = false;
            for (var j = 0, len = res.length; j < len; j++) {
                if (arr[i] == res[j]) {
                    isRepeated = true;
                    break;
                }
            }
            if (!isRepeated) {
                res.push(arr[i]);
            }
        }
        return res;
    }

    //删除标签
    function removeTag(str, tags) {
        var i = 0;
        for (; i < tags.length; i++) {
            if (tags[i] == str) {
                break;
            }
        }
        tags.splice(i, 1);
    }

    function htmlspecialchars(str)    
    {    
        str = str.replace(/&/g, '&amp;');  
        str = str.replace(/</g, '&lt;');  
        str = str.replace(/>/g, '&gt;');  
        str = str.replace(/"/g, '&quot;');  
        str = str.replace(/'/g, '&#039;');  
        return str;  
    } 

})($);