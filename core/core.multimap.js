/**
*地图分屏类
*@module core
*@class UMAP.MultiMap
*@constructor initialize
*@extends UMAP.BaseObject
*/
R.define([
    "dojo/_base/connect",
    "common/alert",
    "esri/views/ui/DefaultUI",
    "core/map",
    "core/baseobject"
], function (connect,Alert,DefaultUI,coreMap) {
    UMAP.Core.MultiMap = UMAP.Core.BaseObject.extend({
        /**
        *类ID
        *@property id
        *@type {String}
        */
        id: 'MultiMap',
        /**
        *当前活跃Map对象
        *@property _activeMap
        *@type {Object}
        */
        _activeMap: null,
        /**
        *之前活跃Map对象
        *@property _oldActiveMap
        *@type {Object}
        */
        _preActiveMap: null,
        /**
        *分屏后是否联动地图
        *@property _bindMap
        *@type {Boolean}
        */
        _bindMap:false,
        /**
        *map的目的元素
        *@property _mapContainer
        *@type {Object}
        */
        _mapContainer: {
            containerone: 'mapone',
            containertow: 'maptwo',
            containerthree: 'mapthree',
            containerfour: 'mapfour'
        },

        /**
        *map对象集合
        *@property _objsMap
        *@type {Object}
        */
        _objsMap: {
            mapone: null,
            maptwo: null,
            mapthree: null,
            mapfour: null
        },
        /**
        *初始化
        *@method initialize
        */
        initialize: function (options) {
            try{
                UMAP.Core.BaseObject.prototype.initialize.call(this);
                //用于标识状态-默认显示第一个
                this.currentSplit = 1;
                //默认加载一个地图
                this._objsMap.mapone = this._createMap('mapone','mapone');
                this.$multimap=$("#centerpanel");
                this.$multimap.toggleClass("multiOne");
                this._activeMap = this._objsMap.mapone;
                this._preActiveMap = this._objsMap.mapone;
                this._bindEvents();
                this._removeSpinner();
            }catch(e){
                Alert.warning("",e.message);
            }
        },
        /**
        *监听地图事件
        *@method _bindEvents
        */
        _bindEvents:function(){
            /*当前活跃地图窗口改变事件*/
            this.connectHandlers.push(connect.subscribe('activeMapChange',this,this._activeMapChange));
            /*分屏联动*/
            this.connectHandlers.push(connect.subscribe('extentChange',this,this._extentChange));
        },
        /**
        *生成地图对象
        *@method _createMap
        *@param options {Object} 配置对象
        *@return {Object} 返回Map对象
        *@private
        */
        _createMap: function (id,containerId) {
            let self=this;
            let obj = new coreMap({
                id: id,
                container: containerId,
                success:__createSuccess,
                error:__createError
            });
            UMAP.app.pool.add(obj);
            return obj;

            function __createSuccess(e){
                //分屏联动
                if(self._bindMap){
                    e.setExtent(self._activeMap.view.extent);
                }
            }
            function __createError(e){

            }
        },
        /**
        *活动map改变
        *@method _activeMapChange
        *@param evt
        */
        _activeMapChange:function(evt){
            this._activeMap=this._objsMap[evt.id];
        },
        /**
        *地图extent改变事件
        *@method _extentChange
        *@param evt
        */
        _extentChange:function(extent){
            let self=this;
            if(self._bindMap){
                self.getMapGroup().forEach(function(objMap){
                    if(objMap && objMap.id!=self._activeMap.id){
                        objMap.setExtent(extent);
                    }
                })
            }
        },
        /**
        *返回全部map对象
        *@method getMapGroup
        *@return {Object} 返回Map对象集合
        */
        getMapGroup: function () {
            var obj = null;
            var objMapGroup = [];
            for (obj in this._objsMap) {
                if (this._objsMap[obj]) {
                    objMapGroup.push(this._objsMap[obj]);
                }
            }
            return objMapGroup;
        },
        /**
        *获取当前激活Map对象
        *@method getActiveMap
        *@return {Object} 返回Map对象
        */
        getActiveMap: function () {
            return this._activeMap;
        },
        /**
        *分屏
        *@method splitMap
        *@param splitNum {Number} 分屏数，值为1~4之间
        */
        splitMap: function (splitNum) {
            if(splitNum==this.currentSplit) return;
            if([1,2,3,4].indexOf(splitNum)>-1){
                this.$multimap.removeClass();
                switch (splitNum) {
                    case 1:
                        this.$multimap.addClass("multiOne");
                        break;
                    case 2:
                        this.$multimap.addClass("multiTwo");
                        break;
                    case 3:
                        this.$multimap.addClass("multiThree");
                        break;
                    case 4:
                        this.$multimap.addClass("multiFour");
                        break;
                }

                this._activeMap = this._objsMap.mapone;
                this._bulidMap(splitNum);
                this.currentSplit = splitNum;
            }

            //刷新
            // this._invalidateSize();
            // this._splitControlsView(splitNum);
            // if (splitNum == "splitOne") return;
            // this._addclickEvent();
            //
            // this.fire("multimap:splitMap", { activeMap: this._activeMap, mapGroup: this.getMapGroup(), splitNum: splitNum });
        },
        /**
        *创建mapview对象
        *@method _bulidMap
        *@param _bulidMap {Number} 分屏数，值为1~4之间
        */
        _bulidMap:function(splitNum){
            let diffNum=this.currentSplit-splitNum;
            if(diffNum==0) return;
            if(diffNum>0){
                //删除多余的地图
                for(let i=splitNum+1;i<=this.currentSplit;i++){
                    let mapId=__converNumToId(i);
                    UMAP.app.pool.remove(mapId);//从缓存池删除
                    this._objsMap[mapId].destroy();
                    this._objsMap[mapId]=null;
                }
            }else{
                //创建未有的地图
                for(let i=this.currentSplit+1;i<=splitNum;i++){
                    let mapId=__converNumToId(i);
                    this._objsMap[mapId]=this._createMap(mapId,mapId);
                }
            }

            function __converNumToId(num){
                let id;
                switch(num){
                    case 1:
                        id='mapone';
                        break;
                    case 2:
                        id='maptwo';
                        break;
                    case 3:
                        id='mapthree';
                        break;
                    case 4:
                        id='mapfour';
                        break;
                }
                return id;
            }
        },
        /**
        *创建地图窗体选中控件
        *@method changeBindMapState
        *@param changeBindMapState {}
        */
        _buildMapActiveUI:function(){
           // this.activeUI=new DefaultUI()
        },
        /**
        *改变是否联动状态
        *@method changeBindMapState
        *@param changeBindMapState {}
        */
        changeBindMapState:function(){
            this._bindMap=this._bindMap?false:true;
            return this._bindMap;
        },
        getType: function () {
            return "UMAP.Core.MultiMap";
        },
        /**
        *移除加载等待动画
        *@method _removeSpinner
        */
        _removeSpinner:function(){
            $("#centerpanel-spinner").remove();
        },
        destroy:function(){
            this.connectHandlers.forEach(function(handler){
                connect.unsubscribe(handler);
            })
        }
    });
    return UMAP.Core.MultiMap;
});
