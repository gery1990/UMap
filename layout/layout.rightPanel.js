/**
*右侧结果栏布局类
*@module layout
*@class UMAP.Layout.RightPanel
*@constructor initialize
*@extends UMAP.Layout
*/
R.define([
    "layout/baseobject"
], function () {
    UMAP.Layout.RightPanel = UMAP.Layout.BaseObject.extend({
        /**
        *界面标签
        *@property body
        *@type {String}
        */
        tempHtml:
            `<div class="content-tabs">
                <button class="roll-nav roll-left J_tabLeft"><i class="fa fa-backward"></i></button>
                <nav class="page-tabs J_menuTabs">
                    <div class="page-tabs-content">
                        <a href="javascript:;" class="active J_menuTab" data-id="index_v1.html">首页</a>
                    </div>
                </nav>
                <button class="roll-nav roll-right J_tabRight"><i class="fa fa-forward"></i>
                </button>
                <a class="roll-nav roll-right min-right" title="隐藏"><i class="fa fa-times"></i></a>
            </div>`,
        showBtnHtml:'<a class="max-right btn btn-primary animated fadeInRight" title="打开"><i class="fa fa-bookmark"></i></a>',
        $wrapperPanel:$(".page-wrapper-container"),
        $mapPanel:$('.page-wrapper-content'),
        $rightPanel:$('.page-wrapper-right'),
        /**
        *初始化
        *@method initialize
        */
        initialize: function () {
            UMAP.Layout.BaseObject.prototype.initialize.call(this);
            this.id = "rightPanel";
            this.body = this.$rightPanel;
            this.body.html(this.tempHtml);
            this.$wrapperPanel.append(this.showBtnHtml);
            this.init();
        },
        /**
        *初始化工具
        *@method init
        */
        init:function(){
            this._addEvents();
        },

        /**
        *绑定工具按钮事件
        *@method init
        */
        _addEvents:function(){
            // 结果窗体切换
            $('.min-right').click(function () {
                if(!this.$wrapperPanel.hasClass("max-page-wrapper-container")){
                    this.$rightPanel.hide();
                    this.$wrapperPanel.addClass("max-page-wrapper-container");
                    this.$mapPanel.removeClass("col-md-9 col-sm-6");
                    this.$mapPanel.addClass("col-sm-12 col-md-12");
                    this.$rightPanel.removeClass("col-md-3");
                }
            }.bind(this));
            $(".max-right").click(function(){
                if(this.$wrapperPanel.hasClass("max-page-wrapper-container")){
                    this.$mapPanel.addClass("col-md-9 col-sm-6");
                    this.$mapPanel.removeClass("col-sm-12col-md-12");
                    this.$rightPanel.addClass("col-md-3");
                    this.$wrapperPanel.removeClass("max-page-wrapper-container");
                    this.$rightPanel.fadeIn(500);
                }
            }.bind(this));
        },
    });
    return UMAP.Layout.RightPanel;
});
