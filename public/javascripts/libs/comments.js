/**
 * Created by Cononico on 2017/3/25.
 */
(function ($, window, document, navigator) {
  'use strict';
  var defaults = {
    placeholder: '请自觉遵守互联网相关的政策法规，严禁发布色情、暴力、反动的言论。',
    wbAppKey: '',
    commentAble: true,       // 是否可以发评论
    announcement: '',        // 评论框公告
    pageNumber: 10,          // 每页评论个数
    childrenNumber: 10,      // 子评论个数
    threadKey: '',
    title: ''                // 页面标题
  };
  var pageCurrent = 0;
  var pageAmount = 0;
  var isLogin = false;
  var user = {};
  var tipsTimer;
  function Servant(id, options) {
    this.$container = $(id);
    this.options = options = $.extend(defaults, options || {});
  }
  Servant.prototype = {
    constructor: Servant,

    init: function () {
      this.currentPage = 0;
      this.renderInitHtml();
      this.bindEvents();
    },

    renderInitHtml: function () {
      var wbLoginUrl = 'https://api.weibo.com/oauth2/authorize?client_id=' +
        this.options.wbAppKey + '&response_type=code&redirect_uri=' + location.origin + '/\wbconnect?back_uri='  + location.origin + location.pathname;
      var baffle, isAble = '';
      if(this.options.commentAble) {
        baffle = '<div class="baffle">微博<a class="b-btn btn-open-mini-Login" href="' + wbLoginUrl +'">登录</a>后发表评论 (・ω・)</div>';
      } else {
        baffle = '<div class="baffle">'+ this.options.announcement + '</div>';
        isAble = 'not-allow';
      }
      var html =
        '<div class="spruche-comment">' +
          '<div class="sc-head">' +
            '<span class="sc-head-t result">--</span>' +
            '<span class="sc-head-t">评论</span>' +
          '</div>' +
          '<div class="comm" id="spComment">' +
            '<div class="sc-comment">' +
              '<div class="sc-comment-header">' +
                '<div class="tabs-order">'+
                  '<ul>' +
                    '<li class="on" data-sort="0">全部评论</li>' +
                    /* '<li data-sort="1">热门评论</li>' + */
                  '</ul>' +
                '</div>' +
                '<div class="header-page paging-box">' +
                  '<span class="result">共--页</span>' +
                '</div>' +
              '</div>' +
              '<div class="comment-send no-login ' + isAble +'">' +
                '<div class="user-face"><img class="user-head" src="/images/pic/defaulthead1.png"></div>' +
                '<div class="textarea-container">' + baffle +
                  '<textarea class="comment-textarea" cols="80" name="msg" rows="5" placeholder="'+this.options.placeholder+'" class="ipt-txt"></textarea><button type="submit" class="comment-submit" data-status="ready" data-rid="0" data-pid="0" data-type="parents">发表评论</button>' +
                '</div>' +
                // '<div class="comment-emoji">' +
                //   '<i class="face"></i><span class="text">表情</span>' +
                // '</div>' +
              '</div>' +
              '<div class="comment-list" data-status="loading"><div class="comment-list-status">loading...</div></div>' +
            '</div>' +
          '</div>' +
          '<div class="tips-container"></div>' +
        '</div>';
      this.$container.html(html);
      this.getComments();
      this.getUserInfo();
    },

    ajaxFunc: function (url, form, callback) {
      $.ajax({
        type: 'POST',
        url: url,
        dataType: 'json',
        traditional: true,
        data: {
          form: JSON.stringify(form)
        },
        success: function (response) {
          callback(response);
        }.bind(this),
        error: function () {
          console.warn('评论加载失败！');
        }.bind(this)
      });
    },

    getUserInfo: function () {
      if (!$.cookie('uid') && !$.cookie('token')) {
        return ;
      }
      var form = {
        uid: $.cookie('uid'),
        token: $.cookie('token')
      };
      var _container = this.$container;
      var placeholder = this.options.placeholder;
      this.ajaxFunc('/users/profile', form, function (response) {
        if (response.retCode === 0) {
          user = response.retData;
          var httpReg = /^http:\/\//g;
          var headImg = response.retData.head_img;
          if (httpReg.test(headImg)) {
            headImg = headImg.replace(/^http/g,'https');
          }
          user.head_img = headImg;
          _container.find('.user-face .user-head').attr('src', headImg);
          isLogin = true;
          _container.find('.comment-send').removeClass('no-login');
          user = response.retData;
        } else {
          // to do something
        }
      });
    },

    getQueryStringByName: function(name) {
      var result = location.search.match(new RegExp("[\?\&]" + name + "=([^\&]+)", "i"));
      if (result === null || result.length < 1) {
        return "";
      }
      return result[1];
    },

    getComments: function () {
      var form = {
        threadKey: this.options.threadKey,
        pageNumber: this.options.pageNumber,
        childrenNumber: this.options.childrenNumber
      };
      var _container = this.$container;
      var _this = this;
      this.ajaxFunc('/comments/getcomments', form, function (response) {
        if (response.retCode !== 0) {
          _container.find('.comment-list').attr('data-status', 'failed');
          _container.find('.comment-list .comment-list-status').html('英灵召唤失败，再来一次十连抽(・ω・)');
        } else {
          _container.find('.comment-list').attr('data-status', 'success');
          var html = _this.renderCommentsHtml(response.retData.comments);
          _container.find('.comment-list').html(html);
          _container.find('.sc-head .sc-head-t.result').text(response.retData.page.count);
          var pagesNumber = Math.ceil(response.retData.page.amount / _this.options.pageNumber);
          _this.setPage(pagesNumber, 1);
          pageCurrent = 1;
          pageAmount = pagesNumber;
        }
      });
    },

    getThridToken: function () {
      var code = this.getQueryStringByName('code');
      var backUri = this.getQueryStringByName('back_uri');
      if (code === '') {
        return ;
      }
      var form = {
        code: code,
        redirectUri: location.origin
      };
      this.ajaxFunc('/wbconnect', form, function (response) {
        if (response.retCode === 0) {
          var user = response.retData;
          $.cookie('uid',user.id, { expires: new Date(user.expires), path: "/"});
          $.cookie('username', user.username, { expires: new Date(user.expires), path: "/"});
          $.cookie('type',user.type, { expires: new Date(user.expires), path: "/"});
          $.cookie('token',user.token, { expires: new Date(user.expires), path: "/" });
          window.location.href = backUri;
        } else {
          console.warn('召唤失败!');
        }
      });
    },

    renderCommentsHtml: function (comments) {
      var html = '<ul class="comments-ul">';
      // var httpReg = /^http:\/\//g;
      for (var i = 0; i < comments.length; i++) {
        var childrenHtml = '<ul class="reply-box" data-amount="' + comments[i].childrenAmount +'">';
        childrenHtml += this.renderChildrenHtml(comments[i].children);
        if (comments[i].childrenAmount > 3) {
          childrenHtml += '<div class="view-more">还有<b>' + (comments[i].childrenAmount - 3) + '</b>条回复, <a class="btn-more" data-pid="' + comments[i].id + '">点击查看</a></div>';
        }
        childrenHtml += '</ul>';

        var headimg, username, wbUrl = '';
        if (comments[i].type === 1) {
          headimg = comments[i].ds_dafault_img;
          username = comments[i].ds_username;
        } else {
          headimg = comments[i].head_img;
          username = comments[i].username;
        }
        if (comments[i].wb_id) {
          wbUrl = 'href="http://weibo.com/u/' + comments[i].wb_id + '" target="_blank"';;
        }
        headimg = headimg.replace(/^http:\/\//g,'https://');
        // if (httpReg.test(headimg) == true) {
        //   console.log('test');
        //   headimg = headimg.replace(/^http:/g,'https:');
        // }
        var datetime = this.formatDate(comments[i].create_time);
        var message = comments[i].message.replace(/<(?:.|\s)*?>/g, '');

        html +=
          '<li class="list-item reply-wrap" data-id="'+ comments[i].id + '" data-uid="' + comments[i].user_id +'">' +
            '<div class="user-face" data-usercard-mid="'+ comments[i].id +'">' +
              '<a ' + wbUrl + '><img src="' + headimg + '" alt=""></a>' +
            '</div>' +
            '<div class="con no-border">' +
              '<div class="user">' +
                '<a data-usercard-mid="' + comments[i].user_id +'" class="name " ' + wbUrl + '>' + username +'</a>' +
              '</div>' +
              '<p class="text">' + message + '</p>' +
              '<div class="info">' +
                '<span class="time">'+ datetime +'</span>' +
                '<span class="like " data-amount="' + comments[i].like_amount +'" data-id="' + comments[i].id +'"><i></i><span>(' + comments[i].like_amount + ')</span></span>' +
                '<span class="hate " data-amount="' + comments[i].hate_amount +'" data-id="' + comments[i].id +'"><i></i><span>(' + comments[i].hate_amount + ')</span></span>' +
                '<span class="reply btn-hover">参与回复</span>' +
                '<span class="report btn-hover btn-hide" data-id="' + comments[i].id +'">举报</span>' +
              '</div>' +
              childrenHtml +
              '<div class="comment-send ">' +
                '<div class="user-face">' +
                  '<img class="user-head" src="/images/pic/defaulthead1.png">' +
                '</div>' +
                '<div class="textarea-container">' +
                  '<textarea class="comment-textarea" cols="80" name="msg" rows="5" placeholder="' + this.options.placeholder + '" class="ipt-txt"></textarea>' +
                  '<button type="submit" class="comment-submit" data-rid="" data-pid="" data-status="ready" data-type="children">发表评论</button>' +
                '</div>' +
                // '<div class="comment-emoji"><i class="face"></i><span class="text">表情</span></div>' +
              '</div>' +
            '</div>' +
          '</li>';
      }
      html += '</ul>'
      return html;
    },

    renderChildrenHtml: function (comments) {
      var list = '';
      for (var i = 0; i < comments.length; i++) {
        var chimg, cusername, cWbUrl = '';
        if (comments[i].type === 1) {
          chimg = comments[i].ds_dafault_img;
          cusername = comments[i].ds_username;
        } else {
          chimg = comments[i].head_img;
          cusername = comments[i].username;
        }
        if (comments[i].wb_id) {
          cWbUrl = 'href="http://weibo.com/u/' + comments[i].wb_id + '" target="_blank"';
        }
        chimg = chimg.replace(/^http:\/\//g,'https://');
        // if (httpReg.test(chimg)) {
        //   chimg = chimg.replace(/^http/g,'https');
        // }
        var cdatetime = this.formatDate(comments[i].create_time);
        var cmessage = comments[i].message.replace(/<(?:.|\s)*?>/g, '');
        list +=
          '<li class="reply-item reply-wrap" data-id="'+ comments[i].id + '" data-uid="' + comments[i].user_id +'">' +
            '<a class="reply-face" ' + cWbUrl + '><img src="' + chimg + '" alt=""></a>' +
            '<div class="reply-con">' +
              '<div class="user">' +
                '<a data-usercard-mid="' + comments[i].user_id +'" class="name " ' + cWbUrl + '>' + cusername +'</a>' +
                '<span class="text-con">' + '&nbsp;&nbsp;' + cmessage + '</span>' +
              '</div>' +
              '<div class="info">' +
                '<span class="time">' + cdatetime +'</span>' +
                '<span class="like " data-amount="' + comments[i].like_amount +'" data-id="' + comments[i].id +'"><i></i><span>(' + comments[i].like_amount + ')</span></span>' +
                '<span class="reply btn-hover" data-username="' + cusername + '">回复</span>' +
                '<span class="report btn-hover btn-hide-re" data-id="' + comments[i].id +'">举报</span>' +
              '</div>' +
            '</div>' +
          '</li>';
      }
      return list;
    },

    formatDate: function (datetime) {
      var zeroBefore  = function (value) {
        if (value < 10) {
          return '0' + value;
        }
        return value;
      };
      var result = '';
      var now = new Date();
      var date = new Date(datetime);
      var interval = Math.ceil((now - date) / 1000);
      if (interval >= 0 && interval < 60) {
        result = interval + '秒前';
      } else if (interval >= 60 && interval < 3600) {
        result = Math.round(interval / 60) + '分钟前';
      } else if (interval >= 3600 && interval < 86400) {
        result = Math.round(interval / 3600) + '小时前';
      } else if (interval >= 86400 && interval < 259200) {
        result = Math.round(interval / 86400) + '日前';
      } else {
        var year = date.getFullYear();
        var month = zeroBefore(parseInt(date.getMonth() + 1, 10));
        var day = zeroBefore(parseInt(date.getDate(), 10));
        var hour = zeroBefore(parseInt(date.getHours(), 10));
        var min = zeroBefore(parseInt(date.getMinutes(), 10));
        var second = zeroBefore(parseInt(date.getSeconds(), 10));
        result = year + '-' + month + '-' + day + '  ' + hour + ':' + min + ':' + second;
      }
      return result;
    },

    setPage: function (account, current) {
      this.$container.find('.header-page .result').text('共 ' + account + ' 页');
      var html = '<span class="current">' + current + '</span>';

      for (var i = 1; i<= 3; i++) {
        if (current - i > 1) {
          html = '<span class="tcd-number">' + (current - i) + '</span>' + html;
        }
        if (current + i < account) {
          html += '<span class="tcd-number">' + (current + i) + '</span>';
        }
      }

      if (current - 4 > 1) {
        html = '<span class="dian">...</span>' + html;
      }

      if (current > 1) {
        html = '<span class="prev">上一页</span><span class="tcd-number">1</span>' + html;
      }

      if (current + 4 < account) {
        html += '<span class="dian">...</span>';
      }

      if (current < account) {
        html += '<span class="tcd-number">' + account + '</span><span class="next">下一页</span>';
      }

      html = '<span class="result">共 ' + account + ' 页</span>' + html;
      this.$container.find('.sc-comment .sc-comment-header .header-page.paging-box').html(html);
    },

    renderPageHtml: function (amount, current, parents) {
      var page = '<span class="current" data-pid="' + parents + '">' + current + '</span>';
      for (var i = 1; i<= 3; i++) {
        if (current - i > 1) {
          page = '<span class="tcd-number" data-pid="' + parents + '">' + (current - i) + '</span>' + page;
        }
        if (current + i < amount) {
          page += '<span class="tcd-number" data-pid="' + parents + '">' + (current + i) + '</span>';
        }
      }

      if (current - 4 > 1) {
        page = '<span class="dian">...</span>' + page;
      }

      if (current > 1) {
        page = '<span class="prev" data-pid="' + parents + '">上一页</span><span class="tcd-number" data-pid="' + parents + '">1</span>' + page;
      }

      if (current + 4 < amount) {
        page += '<span class="dian" data-pid="' + parents + '">...</span>';
      }

      if (current < amount) {
        page += '<span class="tcd-number" data-pid="' + parents + '">' + amount + '</span><span class="next" data-pid="' + parents + '">下一页</span>';
      }

      page = '<span class="result">共 ' + amount + ' 页</span>' + page;
      page = '<div class="paging-box">' + page;
      page += '</div>';
      return page;
    },

    getPageChildren: function (form, $replyBox) {
      var _this = this;
      this.ajaxFunc('/comments/getChildrenCommentsByPage', form, function (response) {
        if (response.retCode === 0) {
          var childrenHtml = _this.renderChildrenHtml(response.retData.comments.children);
          $replyBox.html(childrenHtml);
          var pagingHtml = _this.renderPageHtml(Math.ceil(response.retData.comments.childrenAmount / _this.options.childrenNumber), form.page, form.parents);
          $replyBox.append(pagingHtml);
        } else {
          // to do something
        }
      });
    },

    showTips: function (tips) {
      clearTimeout(tipsTimer);
      var $tipsContainer = this.$container.find('.tips-container');
      $tipsContainer.text(tips);
      $tipsContainer.slideDown('fast');
      tipsTimer = setTimeout(function () {
        $tipsContainer.slideUp('fast');
      }, 1500);
    },

    bindEvents: function () {
      var _ajaxFunc = this.ajaxFunc;
      var _container = this.$container;
      var _options = this.options;
      var _this = this;
      _container.on('click', '.spruche-comment .sc-comment-header .tcd-number', function () {
        var target = parseInt($(this).text(), 10);
        var form = {
          threadKey: _options.threadKey,
          pageNumber: _options.pageNumber,
          childrenNumber: _options.childrenNumber,
          target: target
        };
        _ajaxFunc('/comments/getCommentsByPage', form, function (response) {
          if (response.retCode !== 0) {
            // do something
          } else {
            var html = _this.renderCommentsHtml(response.retData.comments);
            _container.find('.comment-list').html(html);
            pageCurrent = target;
            _this.setPage(pageAmount, pageCurrent);
          }
        });
      });

      _container.on('click', '.spruche-comment .sc-comment-header .prev', function () {
        var target = pageCurrent - 1;
        if (target < 1) {
          return ;
        }
        var form = {
          threadKey: _options.threadKey,
          pageNumber: _options.pageNumber,
          childrenNumber: _options.childrenNumber,
          target: target
        };
        _ajaxFunc('/comments/getCommentsByPage', form, function (response) {
          if (response.retCode !== 0) {
            // do something
          } else {
            var html = _this.renderCommentsHtml(response.retData.comments);
            _container.find('.comment-list').html(html);
            pageCurrent = target;
            _this.setPage(pageAmount, target);
          }
        });
      });

      _container.on('click', '.spruche-comment .sc-comment-header .next', function () {
        var target = pageCurrent + 1;
        if (target > pageAmount) {
          return ;
        }
        var form = {
          threadKey: _options.threadKey,
          pageNumber: _options.pageNumber,
          childrenNumber: _options.childrenNumber,
          target: target
        };
        _ajaxFunc('/comments/getCommentsByPage', form, function (response) {
          if (response.retCode !== 0) {
            // do something
          } else {
            var html = _this.renderCommentsHtml(response.retData.comments);
            _container.find('.comment-list').html(html);
            pageCurrent = target;
            _this.setPage(pageAmount, target);
          }
        });
      });

      _container.on('click', '.comment-submit', function () {
        var $textarea = $(this).prev('.comment-textarea');
        if (!_options.commentAble) {
          _this.showTips('主人还不准你调戏评论框～');
          return ;
        }
        if (!isLogin) {
          _this.showTips('登陆后才可以发表评论哦～');
          return ;
        }
        var message = $textarea.val();
        if (message === '') {
          _this.showTips('啥都没有说...')
          return ;
        }
        if (message.length > 1000) {
          _this.showTips('1000字以内，乌螺塞 (╬￣皿￣)凸');
          return ;
        }
        if ($(this).attr('data-status') !== 'ready') {
          _this.showTips('正在发送，骚年 (╬￣皿￣)凸');
          return ;
        }
        $(this).attr('data-status', 'sending');
        var button = $(this);
        var type = $(this).attr('data-type');
        var parents = parseInt($(this).attr('data-pid'));
        var form = {
          message: message,
          threadKey: _options.threadKey,
          title: _options.title,
          userAgent: navigator.userAgent,
          pid: parents,
          rid: parseInt($(this).attr('data-rid'))
        };
        _ajaxFunc('/comments/sendComments', form, function (response) {
          if (response.retCode === 0) {
            if (type === 'parents') {
              _this.getComments();
            } else {
              var $replyBox = button.parents('.comment-send').prev('.reply-box');
              var $listItem = button.parents('.list-item');
              var childrenAmount = parseInt($replyBox.attr('data-amount'), 10);
              if (childrenAmount < 3) {
                _this.getComments();
              } else {
                $listItem.removeClass('open-reply');
                var form = {
                  parents: parents,
                  childrenNumber: _options.childrenNumber,
                  page: Math.ceil((childrenAmount + 1) / _options.childrenNumber)
                };
                _this.getPageChildren(form, $replyBox);
                var $result = _container.find('.sc-head .sc-head-t.result');
                $result.text(parseInt($result.text(), 10) + 1);
              }
            }
            $textarea.val('');
            button.attr('data-status', 'ready');
          } else {
            button.attr('data-status', 'ready');
            _this.showTips(response.retMsg);
          }
        });
      });

      _container.on('click', '.list-item .con>.info>.reply', function () {
        var listItem = $(this).parents('.list-item');
        if (listItem.hasClass('open-reply')) {
          listItem.removeClass('open-reply');
          return ;
        }
        if (!_options.commentAble) {
          _this.showTips('主人还不准你调戏评论框～');
          return ;
        }
        if (!isLogin) {
          _this.showTips('登陆后才可以参与回复评论哦～');
          return ;
        }
        _container.find('.list-item').removeClass('open-reply');
        listItem.addClass('open-reply');
        listItem.find('.comment-send .user-head').attr('src', user.head_img);
        var btn = listItem.find('.comment-send .textarea-container .comment-submit');
        btn.attr('data-pid', listItem.attr('data-id'));
        btn.attr('data-rid', listItem.attr('data-id'));
      });

      _container.on('click', '.reply-item .reply-con .info .reply', function () {
        var listItem = $(this).parents('.list-item');
        if (!_options.commentAble) {
          _this.showTips('主人还不准你调戏评论框～');
          return ;
        }
        if (!isLogin) {
          _this.showTips('登陆后才可以参与回复评论哦～');
          return ;
        }
        _container.find('.list-item').removeClass('open-reply');
        listItem.addClass('open-reply');
        listItem.find('.comment-send .user-head').attr('src', user.head_img);
        var $btn = listItem.find('.comment-send .textarea-container .comment-submit');
        var $replyItem = $(this).parents('.reply-item');
        $(this).parents('.list-item').find('.comment-textarea').val('回复 @' + $(this).attr('data-username') + '：');
        $btn.attr('data-pid', listItem.attr('data-id'));
        $btn.attr('data-rid', $replyItem.attr('data-id'));
      });

      _container.on('click', '.list-item .reply-box .view-more .btn-more', function () {
        var parents = parseInt($(this).attr('data-pid'), 10);
        var page = 1;
        var form = {
          parents: parents,
          childrenNumber: _options.childrenNumber,
          page: page
        };
        var $replyBox = $(this).parents('.reply-box');
        _this.getPageChildren(form, $replyBox);
      });

      _container.on('click', '.spruche-comment .reply-box .paging-box .tcd-number', function () {
        var parents = parseInt($(this).attr('data-pid'), 10);
        var page = parseInt($(this).text(), 10);
        var form = {
          parents: parents,
          childrenNumber: _options.childrenNumber,
          page: page
        };
        var $replyBox = $(this).parents('.reply-box');
        _this.getPageChildren(form, $replyBox);
      });

      _container.on('click', '.spruche-comment .reply-box .paging-box .prev', function () {
        var $current = $(this).siblings('.current');
        var page = parseInt($current.text(), 10);
        page = page - 1;
        if (page < 0) {
          return ;
        }
        var parents = parseInt($(this).attr('data-pid'), 10);
        var $replyBox = $(this).parents('.reply-box');
        var form = {
          parents: parents,
          childrenNumber: _options.childrenNumber,
          page: page
        };
        _this.getPageChildren(form, $replyBox);
      });

      _container.on('click', '.spruche-comment .reply-box .paging-box .next', function () {
        var $current = $(this).siblings('.current');
        var page = parseInt($current.text(), 10);
        page += 1;
        var amount = parseInt($(this).siblings('.result').text(), 10);
        if (page > amount) {
          return ;
        }
        var parents = parseInt($(this).attr('data-pid'), 10);
        var $replyBox = $(this).parents('.reply-box');
        var form = {
          parents: parents,
          childrenNumber: _options.childrenNumber,
          page: page
        };
        _this.getPageChildren(form, $replyBox);
      });

      _container.on('click', '.like', function () {
        if (!isLogin) {
          _this.showTips('登陆后才可以给评论点赞哦～');
          return ;
        }
        var $likeSpan = $(this).find('span');
        var $hateSpan = $(this).next('.hate').find('span');
        // if($(this).hasClass('liked')) {
        //   $(this).removeClass('liked');
        // } else {
        //   $(this).addClass('liked')
        // }
        var form = {
          threadKey: _options.threadKey,
          cid: parseInt($(this).attr('data-id'), 10)
        };
        _this.ajaxFunc('/comments/like', form, function (response) {
          if (response.retCode === 0) {
            $likeSpan.text('(' + response.retData.amount.like + ')');
            $hateSpan.text('(' + response.retData.amount.hate + ')');
          } else {
            // do something
          }
        });
      });

      _container.on('click', '.hate', function () {
        if (!isLogin) {
          _this.showTips('登陆后才可以给评论打差评哦～');
          return ;
        }
        var $likeSpan = $(this).prev('.like').find('span')
        var $hateSpan = $(this).find('span');
        // if($(this).hasClass('hated')) {
        //   $(this).removeClass('hated');
        // } else {
        //   $(this).addClass('hated')
        // }
        var form = {
          threadKey: _options.threadKey,
          cid: parseInt($(this).attr('data-id'), 10)
        };
        _this.ajaxFunc('/comments/hate', form, function (response) {
          if (response.retCode === 0) {
            $likeSpan.text('(' + response.retData.amount.like + ')');
            $hateSpan.text('(' + response.retData.amount.hate + ')');
          } else {
            // do something
          }
        });
      });

      _container.on('click', '.report', function () {
        if (!isLogin) {
          _this.showTips('登陆后才能举报～');
          return ;
        }
        _this.showTips('确实收到了呢～');
      });
    }
  };
  window.Servant = Servant;
})(jQuery, window, document, navigator);