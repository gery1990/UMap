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
    "core/map",
    "core/baseobject"
], function (connect,Alert,coreMap) {
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

                /*当前活跃地图窗口改变事件*/
                connect.subscribe('activeMapChange',this._activeMapChange.bind(this));
                // this._activeMapChange = $.Event('activeMapChange.fy.split');

                //默认加载一个地图
                this._objsMap.mapone = this._createMap({ id: 'mapone', container: 'mapone' });
                this.$multimap=$("#centerpanel");
                this.$multimap.toggleClass("multiOne");
                this._activeMap = this._objsMap.mapone;
                this._preActiveMap = this._objsMap.mapone;

                var isMapReady = $.Event('multimap:initialize');
                this._removeSpinner();
                $(document).trigger(isMapReady, { activeMap: this._activeMap, mapGroup: [this._activeMap], splitNum: "1", target: this });
                // setTimeout(function(){
                //     this.splitMap(3);
                // }.bind(this),5000);
                // setTimeout(function(){
                //     this.splitMap(1);
                // }.bind(this),10000);
            }catch(e){
                Alert.warning("",e.message);
            }
        },

        /**
        *生成地图对象
        *@method _createMap
        *@param options {Object} 配置对象
        *@return {Object} 返回Map对象
        *@private
        */
        _createMap: function (options) {
            options.obj = new coreMap({
                id: options.id,
                container: options.container,
            });
            UMAP.app.pool.add(options.obj);
            return options.obj;
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
                    this._objsMap[mapId]=this._createMap({ id: mapId, container: mapId });
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
        *添加事件
        *@method _addclickEvent
        *@private
        */
        _addclickEvent: function () {
            if (this._objsMap.mapOne) { this._objsMap.mapOne.map.on('mouseover', this._mouseoverEventOne, this); }
            if (this._objsMap.maptwo) { this._objsMap.maptwo.map.on('mouseover', this._mouseoverEventTow, this); }
            if (this._objsMap.mapThree) { this._objsMap.mapThree.map.on('mouseover', this._mouseoverEventThree, this);}
            if (this._objsMap.mapFour) { this._objsMap.mapFour.map.on('mouseover', this._mouseoverEventFour, this);}
            if (this._objsMap.mapOne) { this._objsMap.mapOne.map.on('mouseout', this._mouseoutEvent, this); }
            if (this._objsMap.maptwo) { this._objsMap.maptwo.map.on('mouseout', this._mouseoutEvent, this); }
            if (this._objsMap.mapThree) { this._objsMap.mapOne.map.on('mouseout', this._mouseoutEvent, this); }
            if (this._objsMap.mapFour) { this._objsMap.maptwo.map.on('mouseout', this._mouseoutEvent, this); }

            if (this._objsMap.mapOne && !this.clickOne) { this._objsMap.mapOne.map.on('click', this._clickEventOne, this); this.clickOne = true; }
            if (this._objsMap.maptwo && !this.clickTow) { this._objsMap.maptwo.map.on('click', this._clickEventTow, this); this.clickTow = true; }
            if (this._objsMap.mapThree && !this.clickTree) { this._objsMap.mapThree.map.on('click', this._clickEventThree, this); this.clickTree = true; }
            if (this._objsMap.mapFour && !this.clickFour) { this._objsMap.mapFour.map.on('click', this._clickEventFour, this); this.clickFour = true; }

            //初始化 触发click
            this._objsMap.mapOne.map.fireEvent('click');
        },

        /**
        *鼠标移进第一个分屏
        *@method _mouseoverEventOne
        *@private
        */
        _mouseoverEventOne: function () {
            if (this.mapMoveOne) { return; }
            this._clearMove();
            this._objsMap.mapOne.map.on('moveend', this._moveEndOne, this);

            //初始化触发moveend
            this._objsMap.mapOne.map.fireEvent('moveend');

            this.mapMoveOne = true;
            this._activeMap = this._objsMap.mapOne;
        },

        /**
        *鼠标移进第二个分屏
        *@method _mouseoverEventTow
        *@private
        */
        _mouseoverEventTow: function () {
            if (this.mapMoveTow) { return; }
            this._clearMove();
            this._objsMap.maptwo.map.on('moveend', this._moveEndTow, this);

            this.mapMoveTow = true;
            this._activeMap = this._objsMap.maptwo;
        },

        /**
        *鼠标移进第三个分屏
        *@method _mouseoverEventTow
        *@private
        */
        _mouseoverEventThree: function () {
            if (this.mapMoveThree) { return; }
            this._clearMove();
            this._objsMap.mapThree.map.on('moveend', this._moveEndThree, this);

            this.mapMoveThree = true;
            this._activeMap = this._objsMap.mapThree;
        },
        /**
        *鼠标移进第四个分屏
        *@method _mouseoverEventTow
        *@private
        */
        _mouseoverEventFour: function () {
            if (this.mapMoveFour) { return; }
            this._clearMove();
            this._objsMap.mapFour.map.on('moveend', this._moveEndFour, this);

            this.mapMoveFour = true;
            this._activeMap = this._objsMap.mapFour;
        },
        /**
        *鼠标移出屏幕
        *@method _mouseoutEvent
        *@private
        */
        _mouseoutEvent: function () {
            this._activeMap = this._oldActiveMap;
        },
        /**
        *鼠标移出分屏
        *@method _invalidateSize
        *@private
        */
        _invalidateSize: function () {
            if (this._objsMap.mapOne) { this._objsMap.mapOne.map.invalidateSize({ animate: false }); }
            if (this._objsMap.maptwo) { this._objsMap.maptwo.map.invalidateSize({ animate: false }); }
            if (this._objsMap.mapThree) { this._objsMap.mapThree.map.invalidateSize({ animate: false });}
            if (this._objsMap.mapFour) { this._objsMap.mapFour.map.invalidateSize({ animate: false }); }
        },
        /**
        *鼠标点击第一个分屏
        *@method _clickEventOne
        *@private
        */
        _clickEventOne: function () {
            this._activeMap = this._objsMap.mapOne;
            this._oldActiveMap = this._objsMap.mapOne;
            this._addMapLable(this._mapContainer.containerOne);

            //触发自定义事件 标识当前活跃地图窗口改变
            $(document).trigger(this._activeMapChange,this, this._activeMap);
        },
        /**
        *鼠标点击第二个分屏
        *@method _clickEventTow
        *@private
        */
        _clickEventTow: function () {

            this._activeMap = this._objsMap.maptwo;
            this._oldActiveMap = this._objsMap.maptwo;
            this._addMapLable(this._mapContainer.containerTow);

            $(document).trigger(this._activeMapChange, this._activeMap);
        },
        /**
        *鼠标点击第三个分屏
        *@method _clickEventThree
        *@private
        */
        _clickEventThree: function () {
            this._activeMap = this._objsMap.mapThree;
            this._oldActiveMap = this._objsMap.mapThree;
            this._addMapLable(this._mapContainer.containerThree);

            $(document).trigger(this._activeMapChange, this._activeMap);
        },
        /**
        *鼠标点击第四个分屏
        *@method _clickEventFour
        *@private
        */
        _clickEventFour: function () {
            this._activeMap = this._objsMap.mapFour;
            this._oldActiveMap = this._objsMap.mapFour;
            this._addMapLable(this._mapContainer.containerFour);

            $(document).trigger(this._activeMapChange, this._activeMap);
        },
        /**
        *清除mvoe事件监听
        *@method _clearMove
        *@private
        */
        _clearMove: function () {
            if (this.mapMoveOne) { this._objsMap.mapOne.map.off('moveend', this._moveEndOne, this); this.mapMoveOne = false; }
            if (this.mapMoveTow) { this._objsMap.maptwo.map.off('moveend', this._moveEndTow, this); this.mapMoveTow = false; }
            if (this.mapMoveThree) { this._objsMap.mapThree.map.off('moveend', this._moveEndThree, this); this.mapMoveThree = false; }
            if (this.mapMoveFour) { this._objsMap.mapFour.map.off('moveend', this._moveEndFour, this); this.mapMoveFour = false; }
        },
        /**
        *moveed 事件结束后调用事件
        *@method _moveEndOne
        *@private
        */
        _moveEndOne: function () {
            var conterPoin = this._objsMap.mapOne.map.getCenter(),
                mapZoom = this._objsMap.mapOne.map.getZoom();
            this._mapSerView({ one: false, conter: conterPoin, zoom: mapZoom });
        },
        /**
        *moveed 事件结束后调用事件
        *@method _moveEndTow
        *@private
        */
        _moveEndTow: function () {
            var conterPoin = this._objsMap.maptwo.map.getCenter(),
                mapZoom = this._objsMap.maptwo.map.getZoom();
            this._mapSerView({ tow: false, conter: conterPoin, zoom: mapZoom });
        },
        /**
        *moveed 事件结束后调用事件
        *@method _moveEndThree
        *@private
        */
        _moveEndThree: function () {
            var conterPoin = this._objsMap.mapThree.map.getCenter(),
            mapZoom = this._objsMap.mapThree.map.getZoom();
            this._mapSerView({ three: false, conter: conterPoin, zoom: mapZoom });
        },
        /**
        *moveed 事件结束后调用事件
        *@method _moveEndFour
        *@private
        */
        _moveEndFour: function () {
            var conterPoin = this._objsMap.mapFour.map.getCenter(),
            mapZoom = this._objsMap.mapFour.map.getZoom();
            this._mapSerView({ four: false, conter: conterPoin, zoom: mapZoom });
        },
        /**
        *设置map的bounds
        *@method _mapSerView
        *@private
        */
        _mapSerView: function (options) {
            var _options = { one: true, tow: true, three: true, four: true };
            $.extend(_options, options);

            if (this._objsMap.mapOne && _options.one) { this._objsMap.mapOne.map.setView(_options.conter, _options.zoom); }
            if (this._objsMap.maptwo && _options.tow) { this._objsMap.maptwo.map.setView(_options.conter, _options.zoom); }
            if (this._objsMap.mapThree && _options.three) { this._objsMap.mapThree.map.setView(_options.conter, _options.zoom); }
            if (this._objsMap.mapFour && _options.four) { this._objsMap.mapFour.map.setView(_options.conter, _options.zoom); }
        },
        /**
        *清除之前分屏的状态
        *@method _clearMap
        *@private
        */
        _clearMap: function (split) {
            switch (split) {
                case "splitOne":
                    /*移除事件*/
                    if (this.mapMoveOne) {
                        this._objsMap.mapOne.map.off('moveend', this._moveEndOne, this);
                        this.mapMoveOne = false;
                    }
                    this._objsMap.mapOne.map.off('click', this._clickEventOne, this);
                    this.clickOne = false;
                    if (this._objsMap.maptwo) { this.mapMoveTow = false; this.clickTow = false; this._objsMap.maptwo.map.clearAllEventListeners(); this._objsMap.maptwo.map.remove(); this._objsMap.maptwo.map = null; this._objsMap.maptwo = null; L.DCI.App.pool.remove('maptwo') }
                    if (this._objsMap.mapThree) { this.mapMoveThree = false; this.clickTree = false; this._objsMap.mapThree.map.clearAllEventListeners(); this._objsMap.mapThree.map.remove(); this._objsMap.mapThree.map = null; this._objsMap.mapThree = null; L.DCI.App.pool.remove('mapThree') }
                    if (this._objsMap.mapFour) { this.mapMoveFour = false; this.clickFour = false; this._objsMap.mapFour.map.clearAllEventListeners(); this._objsMap.mapFour.map.remove(); this._objsMap.mapFour.map = null; this._objsMap.mapFour = null; L.DCI.App.pool.remove('mapFour') }
                    break;
                case "splitTow":
                    if (this._objsMap.mapThree) { this.mapMoveThree = false; this.clickTree = false; this._objsMap.mapThree.map.clearAllEventListeners(); this._objsMap.mapThree.map.remove(); this._objsMap.mapThree.map = null; this._objsMap.mapThree = null; L.DCI.App.pool.remove('mapThree') }
                    if (this._objsMap.mapFour) { this.mapMoveFour = false; this.clickFour = false; this._objsMap.mapFour.map.clearAllEventListeners(); this._objsMap.mapFour.map.remove(); this._objsMap.mapFour.map = null; this._objsMap.mapFour = null; L.DCI.App.pool.remove('mapFour') }
                    break;
                case "splitTree":
                    if (this._objsMap.mapFour) { this.mapMoveFour = false; this.clickFour = false; this._objsMap.mapFour.map.clearAllEventListeners(); this._objsMap.mapFour.map.remove(); this._objsMap.mapFour.map = null; this._objsMap.mapFour = null; L.DCI.App.pool.remove('mapFour') }
                    break;
            }
        },
        /**
        *添加标识
        *@method _addMapLable
        *@private
        */
        _addMapLable: function (mapContainer) {
            var mapContainer = document.getElementById(mapContainer);
            var $mapContainer = $(mapContainer);
            $mapContainer.parent().find('.active').removeClass('active');
            $mapContainer.find('.maplable').addClass('active');
        },
        getType: function () {
            return "UMAP.core.MultiMap";
        },
        /**
        *移除加载等待动画
        *@method _removeSpinner
        */
        _removeSpinner:function(){
            $("#centerpanel-spinner").remove();
        },
    });
    return UMAP.Core.MultiMap;
});
