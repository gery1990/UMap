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
    "core/multimap",
    "common/alert",
    "layout/centerpanel",
    "layout/leftmenu",
    "layout/navtools",
    "layout/rightpanel"
], function (baseObject,corePool,coreMultimap,Alert,layoutCenterPanel,layoutLeftMenu,layoutNavTools,layoutRightPanel) {
    UMAP.Core.Application = UMAP.Core.BaseObject.extend({
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
        *配置
        *@property options
        *@type {Object}
        */
        options: {},
        /**
        *中间布局面板
        *@property centerPanel
        *@type {Object}
        */
        centerPanel:null,
        /**
        *分屏管理
        *@multiMap options
        *@type {Object}
        */
        multiMap:null,
        /**
        *左侧菜单栏
        *@property leftMenu
        *@type {Object}
        */
        leftMenu:null,
        /**
        *顶部工具栏
        *@property navTools
        *@type {Object}
        */
        navTools:null,
        /**
        *右侧结果栏
        *@property rightPanel
        *@type {Object}
        */
        rightPanel:null,
        /**
        *初始化
        *@method initialize
        */
        initialize: function (options) {
            try {
                this.options = options;
                this.pool = new corePool();
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
                /****初始地图窗体-开始*****/
                this.centerPanel = new layoutCenterPanel();
                this.pool.add(this.centerPanel);
                this.multiMap = new coreMultimap();
                this.pool.add(this.multiMap);
                /****初始地图窗体-结束*****/

                /****初始左侧菜单栏-开始*****/
                this.leftMenu=new layoutLeftMenu();
                this.pool.add(this.leftMenu);
                /****初始左侧菜单栏-结束*****/

                /****初始顶部工具栏菜单-开始*****/
                this.navTools=new layoutNavTools();
                this.pool.add(this.navTools);
                /****初始顶部工具栏菜单-结束*****/

                /****初始右侧结果栏-开始*****/
                this.rightPanel=new layoutRightPanel();
                this.pool.add(this.rightPanel);
                /****初始右侧结果栏-结束*****/
            } catch (e) {
                Alert.warning("", "系统初始化异常:" + e.message);
            }
        }
    });

    return UMAP.Core.Application;
});
