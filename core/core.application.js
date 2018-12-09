/**
*系统全局对象类
*@module core/application
*@class UMAP.Application
*@constructor initialize
*@extends UMAP.BaseObject
*/
R.define([
    "core/baseobject",
    "core/pool",
    "layout/centerpanel",
    "core/multimap"
], function () {
    UMAP.Application = UMAP.BaseObject.extend({
        /**
        *对象缓冲池
        *@property pool
        *@type {Object}
        */
        pool: null,
        /**
        *符号对象
        *@property symbol
        *@type {Object}
        */
        symbol: null,
        /**
        *信息提示框对象
        *@property dialog
        *@type {Object}
        */
        dialog: null,
        /**
        *菜单处理
        *@property tool
        *@type {Object}
        */
        tool: null,
        /**
        *工具
        *@property util
        *@type {Object}
        */
        util: null,
        /**
        *服务
        *@property services
        *@type {Object}
        */
        services: null,
        /**
        *菜单
        *@property menu
        *@type {Object}
        */
        menu: null,
        /**
        *配置
        *@property options
        *@type {Object}
        */
        options: {},
        /**
        *左面板
        *@property leftPanel
        *@type {Object}
        */
        leftPanel: null,
        /**
        *右面板
        *@property rightPanel
        *@type {Object}
        */
        rightPanel: null,
        /**
        *中心面板
        *@property centerPanel
        *@type {Object}
        */
        centerPanel: null,
        /**
        *顶面板
        *@property topPanel
        *@type {Object}
        */
        topPanel: null,
        /**
        *底面板
        *@property bottomPanel
        *@type {Object}
        */
        bottomPanel: null,
        /**
        *初始化
        *@method initialize
        */
        initialize: function (options) {
            try {
                this.options = options;
                this.pool = new UMAP.Pool();
                // this.menu = new UMAP.Menu(this.util, this.services);
                // this.symbol = new UMAP.Symbol();
                //触发获得焦点，
                // $("#centerpanel").on('click', function () { $(this).focus(); });
            } catch (e) {
                console.log(e.message);
            }
        },
        /**
        *初始化界面
        *
        *@method init
        */
        init: function () {
            try {
                // if (this.options.left.visible == true) {
                //     this.leftPanel = new UMAP.Layout.LeftPanel();
                //     this.pool.add(this.leftPanel);
                // }
                // if (this.options.right.visible == true) {
                //     this.rightpanel = new UMAP.Layout.RightPanel();
                //     this.pool.add(this.rightpanel);
                // } else {
                //     // $("#centerpanel").css("padding-right", "0px");
                //     // $("#rightpanel").css("display", "none");
                // }
                // if (this.options.bottom.visible == true) {
                //     this.bottompanel = new UMAP.Layout.BottomPanel();
                //     this.pool.add(this.bottompanel);
                // }
                // if (this.options.top.visible == true) {
                //     this.topPanel = new UMAP.Layout.TopPanel();
                //     this.pool.add(this.topPanel);
                // }
                if (this.options.center.visible == true) {
                    this.centerPanel = new UMAP.Layout.CenterPanel();
                    this.pool.add(this.centerPanel);
                }
                var multiMap = new UMAP.MultiMap();
                UMAP.app.pool.add(multiMap);
            } catch (e) {
                // this.util.dialog.error("错误提示", "系统初始化异常:" + e.message);
            }
        }
    });

    return UMAP.Application;
});
