﻿/**
*地图分屏类
*@module core
*@class UMAP.MultiMap
*@constructor initialize
*@extends UMAP.BaseObject
*/
R.define([
    "core/map"
], function () {
    UMAP.MultiMap = UMAP.BaseObject.extend({
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
            containerone: 'map-main',
            containertow: 'map-tow',
            containerthree: 'map-three',
            containerfour: 'map-four'
        },

        /**
        *map对象集合
        *@property _objMap
        *@type {Object}
        */
        _objMap: {
            mapone: null,
            maptow: null,
            mapthree: null,
            mapfour: null
        },

        /**
        *初始化
        *@method initialize
        */
        initialize: function (options) {
            //用于标识状态-默认显示第一个
            this.currentSplit = 'one';

            /*当前活跃地图窗口改变事件*/
            this._activeMapChange = $.Event('activeMapChange.fy.split');

            this._objMap.mapOne = this._createMap({ id: 'mapone', container: 'map-main' });
            $("#centerpanel").toggleClass("multiOne");
            this._activeMap = this._objMap.mapOne;
            this._preActiveMap = this._objMap.mapOne;

            var isMapReady = $.Event('multimap:initialize');
            // $(document).trigger(isMapReady, { activeMap: this._activeMap, mapGroup: [this._activeMap], splitNum: "1", target: this });
        },

        /**
        *生成地图对象
        *@method _createMap
        *@param options {Object} 配置对象
        *@return {Object} 返回Map对象
        *@private
        */
        _createMap: function (options) {
            options.obj = new UMAP.Map({
                id: options.id,
                container: options.container,
            });
            // if (options.id == "map") {
            //     options.obj = new UMAP.Map({
            //         id: options.id,
            //         container: options.container,
            //     });
            // } else {
            //     options.obj = new L.DCI.Map({
            //         id: options.id,
            //         navigationControl: false,
            //         defaultExtentControl: false,
            //         miniMapControl: true,
            //         scalebarControl: false,
            //         layerSwitchControl: false,
            //         loadingControl: false,
            //         panControl: false,
            //         layerTabControl: true,
            //         fullscreenControl:false,
            //         contextmenu: Project_ParamConfig.controls.contextmenu,
            //
            //         baseCrs: Project_ParamConfig.crs,
            //         baseLayer: Project_ParamConfig.baseLayer,//底图
            //         themLayers: Project_ParamConfig.themLayers,//专题图层
            //         changeLayers: Project_ParamConfig.changeLayers,//切换图层
            //         timeLayers: Project_ParamConfig.timeLayers,//时间轴地图
            //         container: options.container,
            //         tileSize: Project_ParamConfig.baseLayer.tileSize || 512,
            //         minZoom: Project_ParamConfig.baseLayer.minZoom || 0,
            //         maxZoom: Project_ParamConfig.baseLayer.maxZoom || 10,
            //         zoom: Project_ParamConfig.baseLayer.zoom || 0
            //     });
            // }
            UMAP.app.pool.add(options.obj);
            return options.obj;
        },
        /**
        *返回全部map对象
        *@method getMapGroup
        *@return {Object} 返回Map对象集合
        */
        getMapGroup: function () {
            var obj = null;
            var objMapGroup = [];
            for (obj in this._objMap) {
                if (this._objMap[obj]) {
                    objMapGroup.push(this._objMap[obj]);
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
            var $map_panel = $('#centerpanel');
            switch (splitNum) {
                case 'splitOne':
                    if (this.preSplit == "one") return;
                    $map_panel.removeClass('map_tow map_three map_four');
                    this.preSplit = "one";
                    this._clearMap("splitOne");
                    this._activeMap = this._objMap.mapOne;
                    break;
                case 'splitTow':
                    if (this.preSplit == "tow") return;
                    $map_panel.removeClass('map_three map_four').addClass('map_tow');
                    this.preSplit = "tow";
                    this._crearMapObj('tow');
                    this._clearMap("splitTow");
                    break;
                case 'splitThree':
                    if (this.preSplit == "three") return;
                    $map_panel.removeClass('map_tow map_four').addClass('map_three');
                    this.preSplit = "three";
                    this._crearMapObj('three');
                    this._clearMap("splitTree");
                    break;
                case 'splitFour':
                    if (this.preSplit == "four") return;
                    $map_panel.removeClass('map_tow map_three').addClass('map_four');
                    this.preSplit = "four";
                    this._crearMapObj('four');
                    this._clearMap("splitFour");
                    break;
            }

            //刷新
            this._invalidateSize();
            this._splitControlsView(splitNum);
            if (splitNum == "splitOne") return;
            this._addclickEvent();

            this.fire("multimap:splitMap", { activeMap: this._activeMap, mapGroup: this.getMapGroup(), splitNum: splitNum });
        },
        /**
        *分屏状态，某些控件不许显示
        *@method _splitControlsView
        *@param type {String} 分屏类型
        *@private
        */
        _splitControlsView: function (type) {
            var dcimap = L.DCI.App.pool.get("map");
            if (type == 'splitOne') {
                dcimap.controls.legend.shower();
                dcimap.controls.miniMap.shower();
            } else {
                dcimap.controls.legend.hidden();
                dcimap.controls.miniMap.hidden();
            }
        },
        /**
        *实例化map对象
        *@method _crearMapObj
        *@param splitNun {String} 分屏类型
        *@private
        */
        _crearMapObj: function (splitNun) {
            var tow = false, three = false, four = false;
            switch (splitNun) {
                case 'tow':
                    tow = true;
                    break;
                case 'three':
                    tow = true;
                    three = true;
                    break;
                case 'four':
                    tow = true;
                    three = true;
                    four = true;
                    break;
            }
            if (!this._objMap.mapTow && tow) { this._objMap.mapTow = this._getNewMap({ obj: 'mapTow', id: 'mapTow', container: this._mapContainer.containerTow, center: this._objMap.mapOne.map.getCenter(), zoom: this._objMap.mapOne.map.getZoom() }); }
            if (!this._objMap.mapThree && three) { this._objMap.mapThree = this._getNewMap({ obj: 'mapThree', id: 'mapThree', container: this._mapContainer.containerThree, center: this._objMap.mapOne.map.getCenter(), zoom: this._objMap.mapOne.map.getZoom() }) }
            if (!this._objMap.mapFour && four) { this._objMap.mapFour = this._getNewMap({ obj: 'mapFour', id: 'mapFour', container: this._mapContainer.containerFour, center: this._objMap.mapOne.map.getCenter(), zoom: this._objMap.mapOne.map.getZoom() }) }
        },

        /**
        *添加事件
        *@method _addclickEvent
        *@private
        */
        _addclickEvent: function () {
            if (this._objMap.mapOne) { this._objMap.mapOne.map.on('mouseover', this._mouseoverEventOne, this); }
            if (this._objMap.mapTow) { this._objMap.mapTow.map.on('mouseover', this._mouseoverEventTow, this); }
            if (this._objMap.mapThree) { this._objMap.mapThree.map.on('mouseover', this._mouseoverEventThree, this);}
            if (this._objMap.mapFour) { this._objMap.mapFour.map.on('mouseover', this._mouseoverEventFour, this);}
            if (this._objMap.mapOne) { this._objMap.mapOne.map.on('mouseout', this._mouseoutEvent, this); }
            if (this._objMap.mapTow) { this._objMap.mapTow.map.on('mouseout', this._mouseoutEvent, this); }
            if (this._objMap.mapThree) { this._objMap.mapOne.map.on('mouseout', this._mouseoutEvent, this); }
            if (this._objMap.mapFour) { this._objMap.mapTow.map.on('mouseout', this._mouseoutEvent, this); }

            if (this._objMap.mapOne && !this.clickOne) { this._objMap.mapOne.map.on('click', this._clickEventOne, this); this.clickOne = true; }
            if (this._objMap.mapTow && !this.clickTow) { this._objMap.mapTow.map.on('click', this._clickEventTow, this); this.clickTow = true; }
            if (this._objMap.mapThree && !this.clickTree) { this._objMap.mapThree.map.on('click', this._clickEventThree, this); this.clickTree = true; }
            if (this._objMap.mapFour && !this.clickFour) { this._objMap.mapFour.map.on('click', this._clickEventFour, this); this.clickFour = true; }

            //初始化 触发click
            this._objMap.mapOne.map.fireEvent('click');
        },

        /**
        *鼠标移进第一个分屏
        *@method _mouseoverEventOne
        *@private
        */
        _mouseoverEventOne: function () {
            if (this.mapMoveOne) { return; }
            this._clearMove();
            this._objMap.mapOne.map.on('moveend', this._moveEndOne, this);

            //初始化触发moveend
            this._objMap.mapOne.map.fireEvent('moveend');

            this.mapMoveOne = true;
            this._activeMap = this._objMap.mapOne;
        },

        /**
        *鼠标移进第二个分屏
        *@method _mouseoverEventTow
        *@private
        */
        _mouseoverEventTow: function () {
            if (this.mapMoveTow) { return; }
            this._clearMove();
            this._objMap.mapTow.map.on('moveend', this._moveEndTow, this);

            this.mapMoveTow = true;
            this._activeMap = this._objMap.mapTow;
        },

        /**
        *鼠标移进第三个分屏
        *@method _mouseoverEventTow
        *@private
        */
        _mouseoverEventThree: function () {
            if (this.mapMoveThree) { return; }
            this._clearMove();
            this._objMap.mapThree.map.on('moveend', this._moveEndThree, this);

            this.mapMoveThree = true;
            this._activeMap = this._objMap.mapThree;
        },
        /**
        *鼠标移进第四个分屏
        *@method _mouseoverEventTow
        *@private
        */
        _mouseoverEventFour: function () {
            if (this.mapMoveFour) { return; }
            this._clearMove();
            this._objMap.mapFour.map.on('moveend', this._moveEndFour, this);

            this.mapMoveFour = true;
            this._activeMap = this._objMap.mapFour;
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
            if (this._objMap.mapOne) { this._objMap.mapOne.map.invalidateSize({ animate: false }); }
            if (this._objMap.mapTow) { this._objMap.mapTow.map.invalidateSize({ animate: false }); }
            if (this._objMap.mapThree) { this._objMap.mapThree.map.invalidateSize({ animate: false });}
            if (this._objMap.mapFour) { this._objMap.mapFour.map.invalidateSize({ animate: false }); }
        },
        /**
        *鼠标点击第一个分屏
        *@method _clickEventOne
        *@private
        */
        _clickEventOne: function () {
            this._activeMap = this._objMap.mapOne;
            this._oldActiveMap = this._objMap.mapOne;
            this._addMapLable(this._mapContainer.containerOne);

            //触发自定义事件 标识当前活跃地图窗口改变
            $(document).trigger(this._activeMapChange, this._activeMap);
        },
        /**
        *鼠标点击第二个分屏
        *@method _clickEventTow
        *@private
        */
        _clickEventTow: function () {

            this._activeMap = this._objMap.mapTow;
            this._oldActiveMap = this._objMap.mapTow;
            this._addMapLable(this._mapContainer.containerTow);

            $(document).trigger(this._activeMapChange, this._activeMap);
        },
        /**
        *鼠标点击第三个分屏
        *@method _clickEventThree
        *@private
        */
        _clickEventThree: function () {

            this._activeMap = this._objMap.mapThree;
            this._oldActiveMap = this._objMap.mapThree;
            this._addMapLable(this._mapContainer.containerThree);

            $(document).trigger(this._activeMapChange, this._activeMap);
        },
        /**
        *鼠标点击第四个分屏
        *@method _clickEventFour
        *@private
        */
        _clickEventFour: function () {

            this._activeMap = this._objMap.mapFour;
            this._oldActiveMap = this._objMap.mapFour;
            this._addMapLable(this._mapContainer.containerFour);

            $(document).trigger(this._activeMapChange, this._activeMap);
        },
        /**
        *清除mvoe事件监听
        *@method _clearMove
        *@private
        */
        _clearMove: function () {
            if (this.mapMoveOne) { this._objMap.mapOne.map.off('moveend', this._moveEndOne, this); this.mapMoveOne = false; }
            if (this.mapMoveTow) { this._objMap.mapTow.map.off('moveend', this._moveEndTow, this); this.mapMoveTow = false; }
            if (this.mapMoveThree) { this._objMap.mapThree.map.off('moveend', this._moveEndThree, this); this.mapMoveThree = false; }
            if (this.mapMoveFour) { this._objMap.mapFour.map.off('moveend', this._moveEndFour, this); this.mapMoveFour = false; }
        },
        /**
        *moveed 事件结束后调用事件
        *@method _moveEndOne
        *@private
        */
        _moveEndOne: function () {
            var conterPoin = this._objMap.mapOne.map.getCenter(),
                mapZoom = this._objMap.mapOne.map.getZoom();
            this._mapSerView({ one: false, conter: conterPoin, zoom: mapZoom });
        },
        /**
        *moveed 事件结束后调用事件
        *@method _moveEndTow
        *@private
        */
        _moveEndTow: function () {
            var conterPoin = this._objMap.mapTow.map.getCenter(),
                mapZoom = this._objMap.mapTow.map.getZoom();
            this._mapSerView({ tow: false, conter: conterPoin, zoom: mapZoom });
        },
        /**
        *moveed 事件结束后调用事件
        *@method _moveEndThree
        *@private
        */
        _moveEndThree: function () {
            var conterPoin = this._objMap.mapThree.map.getCenter(),
            mapZoom = this._objMap.mapThree.map.getZoom();
            this._mapSerView({ three: false, conter: conterPoin, zoom: mapZoom });
        },
        /**
        *moveed 事件结束后调用事件
        *@method _moveEndFour
        *@private
        */
        _moveEndFour: function () {
            var conterPoin = this._objMap.mapFour.map.getCenter(),
            mapZoom = this._objMap.mapFour.map.getZoom();
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

            if (this._objMap.mapOne && _options.one) { this._objMap.mapOne.map.setView(_options.conter, _options.zoom); }
            if (this._objMap.mapTow && _options.tow) { this._objMap.mapTow.map.setView(_options.conter, _options.zoom); }
            if (this._objMap.mapThree && _options.three) { this._objMap.mapThree.map.setView(_options.conter, _options.zoom); }
            if (this._objMap.mapFour && _options.four) { this._objMap.mapFour.map.setView(_options.conter, _options.zoom); }
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
                        this._objMap.mapOne.map.off('moveend', this._moveEndOne, this);
                        this.mapMoveOne = false;
                    }
                    this._objMap.mapOne.map.off('click', this._clickEventOne, this);
                    this.clickOne = false;
                    if (this._objMap.mapTow) { this.mapMoveTow = false; this.clickTow = false; this._objMap.mapTow.map.clearAllEventListeners(); this._objMap.mapTow.map.remove(); this._objMap.mapTow.map = null; this._objMap.mapTow = null; L.DCI.App.pool.remove('mapTow') }
                    if (this._objMap.mapThree) { this.mapMoveThree = false; this.clickTree = false; this._objMap.mapThree.map.clearAllEventListeners(); this._objMap.mapThree.map.remove(); this._objMap.mapThree.map = null; this._objMap.mapThree = null; L.DCI.App.pool.remove('mapThree') }
                    if (this._objMap.mapFour) { this.mapMoveFour = false; this.clickFour = false; this._objMap.mapFour.map.clearAllEventListeners(); this._objMap.mapFour.map.remove(); this._objMap.mapFour.map = null; this._objMap.mapFour = null; L.DCI.App.pool.remove('mapFour') }
                    break;
                case "splitTow":
                    if (this._objMap.mapThree) { this.mapMoveThree = false; this.clickTree = false; this._objMap.mapThree.map.clearAllEventListeners(); this._objMap.mapThree.map.remove(); this._objMap.mapThree.map = null; this._objMap.mapThree = null; L.DCI.App.pool.remove('mapThree') }
                    if (this._objMap.mapFour) { this.mapMoveFour = false; this.clickFour = false; this._objMap.mapFour.map.clearAllEventListeners(); this._objMap.mapFour.map.remove(); this._objMap.mapFour.map = null; this._objMap.mapFour = null; L.DCI.App.pool.remove('mapFour') }
                    break;
                case "splitTree":
                    if (this._objMap.mapFour) { this.mapMoveFour = false; this.clickFour = false; this._objMap.mapFour.map.clearAllEventListeners(); this._objMap.mapFour.map.remove(); this._objMap.mapFour.map = null; this._objMap.mapFour = null; L.DCI.App.pool.remove('mapFour') }
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
            return "UMAP.MultiMap";
        }
    });
    return UMAP.MultiMap;
});
