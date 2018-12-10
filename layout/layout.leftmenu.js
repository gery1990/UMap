/**
*center布局类
*@module layout
*@class UMAP.Layout.CenterPanel
*@constructor initialize
*@extends UMAP.Layout
*/
R.define([
    "esri/request",
    "layout/alert"
], function (esriRequest,Alert) {
    UMAP.Layout.LeftMenu = UMAP.Layout.extend({
        container:"side-menu",
        /**
        *界面标签
        *@property body
        *@type {String}
        */
        templateLi:{
            rootNode:'<li><a><i class="icon-stack2"></i><span class="nav-label">{0}</span><span class="fa arrow"></span></a>{1}</li>',
            parentNode:'<li><a>{0}<span class="fa arrow"></span></a>{1}</li>',
            childNode:'<li><a class="J_menuItem" source="{1}" data-index="0">{0}</a></li>'
        },
        templateUl:[
            '<ul class="nav nav-second-level">{0}</ul>',
            '<ul class="nav nav-third-level">{0}</ul>'
        ],
        /**
        *初始化
        *@method initialize
        */
        initialize: function () {
            UMAP.Layout.prototype.initialize.call(this);
            this.id = "leftmenu";
            this.body = $("#"+this.container);
            this._getMenu();
        },
        /**
        *读取目录数据
        *@method _getMenu
        */
        _getMenu:function(){
            esriRequest(
               Project_ParamConfig.defaultCoreServiceUrl+Project_ParamConfig.menuRequsetUrl,
                {responseType :"text"}
            ).then(function(response){
                var responseJSON = JSON.parse(response.data);
                if(responseJSON.status.success){
                    let htmlStr=this._convertMenuJson(responseJSON.data);
                    this._removeSpinner();
                    this._buildMenuDom(htmlStr);
                    Alert.success('提示',"菜单加载完成");
                    Alert.warning('警告',"这是测试数据");
                }else{
                    Alert.warning('',responseJSON.status.msg);
                }
            }.bind(this));
        },
        /**
        *解析目录数据
        *@method _convertMenuJson
        */
        _convertMenuJson:function(jsonData){
            try{
                var htmlArray=[];
                jsonData.forEach(function(item) {
                    let html=eachMenu.call(this,item,-1);
                    htmlArray.push(html);
                }.bind(this));
                return htmlArray.join('');
                function eachMenu(parent,level){
                    level++;
                    let hArray=[];
                    let title="";
                    let isLeafNode=parent.childNodes.length>0?false:true;
                    if(!isLeafNode){
                        let childHtmlArray=[];
                        parent.childNodes.forEach(function(item){
                            let str=eachMenu.call(this,item,level);
                            childHtmlArray.push(str);
                        }.bind(this));
                        if(level==0){
                            hArray.push($.format(this.templateLi.rootNode,parent.title,$.format(this.templateUl[level],childHtmlArray.join(""))));
                        }
                        else{
                            hArray.push($.format(this.templateLi.parentNode,parent.title,$.format(this.templateUl[level],childHtmlArray.join(""))));
                        }
                    }else{
                        hArray.push($.format(this.templateLi.childNode,parent.title,parent.sourceUrl));
                    }
                    return hArray.join("");
                }
            }catch(e){
                Alert.warning(e);
            }
        },
        /**
        *构建目录元素
        *@method _buildMenuDom
        */
        _buildMenuDom:function(htmlStr){
            this.body.append(htmlStr);
            this._bindEvent();
        },
        /**
        *绑定目录事件
        *@method _buildMenuDom
        */
        _bindEvent:function(){
            // MetsiMenu
            this.body.metisMenu();
            $('#'+this.container+'>li').click(function () {
                if ($('body').hasClass('mini-navbar')) {
                    NavToggle();
                }
            });
            $('#'+this.container+'>li li a').click(function () {
                if ($(window).width() < 769) {
                    NavToggle();
                }
            });
        },
        /**
        *移除加载等待动画
        *@method _buildMenuDom
        */
        _removeSpinner:function(){
            $("#menu-spinner").remove();
        }
    });
    return UMAP.Layout.LeftMenu;
});
