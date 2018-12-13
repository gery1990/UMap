/**
*center布局类
*@module layout
*@class UMAP.Layout.CenterPanel
*@constructor initialize
*@extends UMAP.Layout
*/
R.define([
    "esri/request",
    "common/alert"
], function (esriRequest,Alert) {
    UMAP.Layout.LeftMenu = UMAP.Layout.BaseObject.extend({
        container:"side-menu",
        //存储已选择的菜单
        selectedItems:{},
        /**
        *界面标签
        *@property body
        *@type {String}
        */
        templateLi:{
            rootNode:'<li><a><i class="icon-stack2"></i><span class="nav-label">{0}</span><span class="fa arrow"></span></a>{1}</li>',
            parentNode:'<li><a>{0}<span class="fa arrow"></span></a>{1}</li>',
            childNode:'<li><a class="J_menuItem" id="{1}" source="{2}" servicetype="{3}" data-index="0">{0}</a></li>'
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
            UMAP.Layout.BaseObject.prototype.initialize.call(this);
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
                    let isLeafNode=(!parent.childNodes || parent.childNodes.length>0)?false:true;
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
                        hArray.push($.format(this.templateLi.childNode,parent.title,parent.id,parent.sourceUrl,parent.serviceType));
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
                let $target=$(arguments[0].currentTarget || arguments[0].target);
                if($target && $target.hasClass("J_menuItem")){
                    //服务加载或移除
                    [id,url,serverType]=[$target.attr("id"),$target.attr("source"),$target.attr("servicetype")];
                    this._addService(id,url,serverType);
                    let isAdd=$target.hasClass("selected");
                    if(isAdd){
                        $target.removeClass("selected");
                        $target.find("i").remove();
                        delete this.selectedItems[$target.id];
                    }else{
                        // let innertText=$target.text();
                        // $target.html("<i class='fa fa-check'></i>"+innertText);
                        $target.append("<i class='fa fa-check'></i>");
                        $target.addClass("selected");
                        this.selectedItems[id]={url:url,type:serverType};
                    }
                }
            }.bind(this));
        },
        /**
        *移除加载等待动画
        *@method _removeSpinner
        */
        _removeSpinner:function(){
            $("#menu-spinner").remove();
        },
        /**
        *加载服务
        *@method _addService
        */
        _addService:function(id,sourceUrl){

        }
    });
    return UMAP.Layout.LeftMenu;
});
