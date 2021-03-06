﻿/**
*顶部工具栏布局类
*@module layout
*@class UMAP.Layout.NavTools
*@constructor initialize
*@extends UMAP.Layout
*/
R.define([
    "common/alert",
    "controls/measure",
    "controls/draw",
    "layout/baseobject"
], function (Alert,Measure,Draw) {
    UMAP.Layout.NavTools = UMAP.Layout.BaseObject.extend({
        /**
        *界面标签
        *@property body
        *@type {String}
        */
        buttons:[
            {
                id:'minimalize',
                title:'折叠菜单栏',
                tempHtml:'<a class="navbar-minimalize" id="minimalize" title="折叠菜单栏"><i class="fa fa-bars"></i> </a>'
            },
            {
                id:'toolsbar',
                title:'工具栏',
                tempHtml:'<a class="navbar-showToolsBar" id="toolsbar" title="工具栏"><i class="icon icon-hammer"></i> </a>',
                content:{
                    id:"tools",
                    container:'tools',
                    tempHtml:`<div class="btn-toolbar" role="toolbar" aria-label="...">
                         <div class="btn-group" role="group" aria-label="tools-measure">
                             <a class="tools-bar" title="测距" id="mesuare-distance"><i class="icon icon-ruler-solid"></i></a>
                             <a class="tools-bar" title="测面积" id="mesuare-area"><i class="icon icon icon-ruler"></i></a>
                             <span class="tools-bar-split"></span>
                             <a class="tools-bar" title="1屏" id="multiMap-one"><i class="icon icon-splitone"></i></a>
                             <a class="tools-bar" title="2屏" id="multiMap-two"><i class="icon icon-splittwo"></i></a>
                             <a class="tools-bar" title="3屏" id="multiMap-three"><i class="icon icon-splitthree"></i></a>
                             <a class="tools-bar" title="4屏" id="multiMap-four"><i class="icon icon-splitfour"></i></a>
                             <a class="tools-bar" title="固定视图" id="bind-splitmap"><i class="fa fa-unlink"></i></a>
                             <span class="tools-bar-split"></span>
                             <a class="tools-bar" title="标点" id="draw-point"><i class="icon icon-location"></i></a>
                             <a class="tools-bar" title="标线" id="draw-polyline"><i class="icon icon-timeline"></i></a>
                             <a class="tools-bar" title="圆形" id="draw-circle"><i class="icon icon-circle"></i></a>
                             <a class="tools-bar" title="矩形" id="draw-rectangle"><i class="icon icon-square"></i></a>
                             <a class="tools-bar" title="多边形" id="draw-polygon"><i class="icon icon-draw-polygon-solid"></i></a>
                             <span class="tools-bar-split"></span>
                             <a class="tools-bar" id="clearDraw" title="清屏"><i class="fa fa-trash"></i></a>
                             <a class="tools-bar tools-bar-close" id="toolsbarClose" title="关闭"><i class="fa fa-close"></i></a>
                         </div>
                     </div>`
                }
            },
            {
                id:'layerList',
                title:'图层控制',
                tempHtml:'<a title="图层控制" id="layerList"><i class="icon-stack"></i> </a>',
                content:{}
            }
        ],
        /**
        *初始化
        *@method initialize
        */
        initialize: function () {
            try{
                UMAP.Layout.BaseObject.prototype.initialize.call(this);
                this.id = "navTools";
                this.body = $("#navTools");
                this.buttons.forEach(function(btn){
                    this.body.append(btn.tempHtml);
                    if(btn.content && btn.content!={}){
                        let $contentDom=$("#"+btn.content.container)
                        $contentDom.html(btn.content.tempHtml);
                    }
                }.bind(this));
                this._bindEvents();
                this.multiMapObj=UMAP.app.pool.get("MultiMap");
            }catch(e){
                Alert.warning(e.message);
            }
        },
        /**
        *绑定事件
        *@method _bindEvents
        */
        _bindEvents:function(){
            this._addClickEvent(this._btnsEvents["clickEvent"]);
        },
        /**
        *绑定点击事件
        *@method _addEvent
        */
        _addClickEvent:function(objs){
            let self=this;
            Object.keys(objs).forEach(function(key){
                if(typeof(objs[key])=='function'){
                    $("#"+key).click(objs[key].bind(self));
                }
            });
        },
        /**
        *绑定工具按钮事件
        *@method _btnsEvents
        */
        _btnsEvents:{
            "clickEvent":{
                "layerList":function(){

                },
                "minimalize":function(){
                    $("body").toggleClass("mini-navbar");
                    SmoothlyMenu();
                },
                "toolsbar":function(){
                    let tarBox=$('.page-wrapper-tools');
                    if(tarBox.hasClass("toolsfadeIn")){
                        tarBox.removeClass("toolsfadeIn");
                        tarBox.addClass("toolsfadeOut");
                    }else if(tarBox.hasClass("toolsfadeOut")){
                        tarBox.removeClass("toolsfadeOut");
                        tarBox.addClass("toolsfadeIn");
                    }else{
                        tarBox.addClass("toolsfadeIn");
                    }
                },
                "toolsbarClose":function(){
                    let tarBox=$('.page-wrapper-tools');
                    tarBox.removeClass("toolsfadeIn");
                    tarBox.addClass("toolsfadeOut");
                },
                "multiMap-one":function(){
                    this.__splitMap(1);
                },
                "multiMap-two":function(){
                    this.__splitMap(2);
                },
                "multiMap-three":function(){
                    this.__splitMap(3);
                },
                "multiMap-four":function(){
                    this.__splitMap(4);
                },
                "bind-splitmap":function(evt){
                    this.__splitMapBind();
                    let target=evt.currentTarget || evt.target;
                    $(target).toggleClass("toolbtn_active");
                },
                "mesuare-distance":function(){
                    this.measuare=new UMAP.Controls.MeasureDistance(this.__getActiveMap());
                    this.measuare.start();
                },
                "mesuare-area":function(){
                    this.measuare=new UMAP.Controls.MeasureArea(this.__getActiveMap());
                    this.measuare.start();
                },
                "draw-point":function(){
                    this.draw=this.__getDrawObj();
                    this.draw.drawPoint();
                },
                "draw-polyline":function(){
                    this.draw=this.__getDrawObj();
                    this.draw.drawPolyline();
                },
                "draw-polygon":function(){
                    this.draw=this.__getDrawObj();
                    this.draw.drawPolygon();
                },
                "draw-circle":function(){
                    this.draw=this.__getDrawObj();
                    this.draw.drawCircle();
                },
                "draw-rectangle":function(){
                    this.draw=this.__getDrawObj();
                    this.draw.drawRectangle();
                },
                "clearDraw":function(){
                    this.__clearDraw();
                }
            }
        },
        /**
        *分屏
        *@method __splitMap
        */
        __splitMap:function(num){
            let multiMapObj=UMAP.app.pool.get("MultiMap");
            multiMapObj.splitMap(num);
        },
        /**
        *联动分屏
        *@method __splitMapBind
        */
        __splitMapBind:function(num){
            let multiMapObj=UMAP.app.pool.get("MultiMap");
            multiMapObj.changeBindMapState();
        },
        /**
        *返回当前活动的地图对象
        *@method __getActiveMap
        */
        __getActiveMap:function(){
            return this.multiMapObj.getActiveMap();
        },
        /**
        *返回绘制工具
        *@method __getActiveMap
        */
        __getDrawObj:function(){
            if(this.draw){
                let state=this.draw.getDrawState();
                if(["creating","updating"].indexOf(state) >-1){
                    this.draw.reset();
                }
                return this.draw;
            }else{
                return new UMAP.Controls.Draw(this.__getActiveMap());
            }
        },
        /**
        *清除地图绘制的图形
        *@method __clearDraw
        */
        __clearDraw:function(){
            let mapObj=UMAP.app.pool.get("MultiMap").getActiveMap();
            //清理测量图层
            if(this.measuare){
                this.measuare.destroy();
            }
            if(this.draw){
                this.draw.destroy();
            }
            //清理临时标注
        }
    });
    return UMAP.Layout.NavTools;
});
