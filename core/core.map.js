/**
*地图类
*@module core
*@class UMAP.Map
*@constructor initialize
*@extends UMAP.BaseObject
*/
R.define([
    "dojo/_base/connect",
    "common/alert",
    "esri/map",
    "esri/views/MapView",
    "esri/layers/TileLayer",
    "esri/geometry/Extent",
    "esri/widgets/Expand",
    "esri/widgets/BasemapGallery",
    "esri/widgets/BasemapGallery/support/LocalBasemapsSource",
    "esri/Basemap",
    "esri/widgets/Home",
    "esri/widgets/Legend",
    "core/baseobject",
    "dojo/domReady!"
], function (connect,Alert,Map,MapView,TileLayer,Extent,ExpandWidget,BasemapGallery,LocalBasemapsSource,Basemap,HomeWidget,LegendWidget) {
    UMAP.Core.Map = UMAP.Core.BaseObject.extend({
        /**
        *地图对象
        *@property map
        *@type {Object}
        */
        map: null,
        /**
        *地图对象
        *@property view
        *@type {Object}
        */
        view:null,
        /**
        *地图容器
        *@property _container
        *@type {Object}
        *@private
        */
        _container: null,
        /**
        *回调函数
        *@property _callback
        *@type {Object}
        *@private
        */
        _callback: null,
        /**
        *事件
        *@property _events
        *@type {Object}
        *@private
        */
        _events: [],
        /**
        *当前鼠标状态
        *@property _status
        *@type {Object}
        *@private
        */
        _status: null,
        /**
        *底图ID
        *@property _baseLayerId
        *@type {Object}
        *@private
        */
        _baseLayerId: 'baseLayer',
        /**
        *底图
        *@property _baseLayer
        *@type {Object}
        *@private
        */
        _baseLayer: null,
        /**
        *属性查询
        *@property _identify
        *@type {Object}
        *@private
        */
        _identify: null,
        /**
        *地图查询
        *@property _query
        *@type {Object}
        *@private
        */
        _query: null,
        /**
         *临时图层
         *@property _templateLayer
         *@type {Object}
         *@private
         */
        _templateLayer: null,
        /**
         *高亮图层
         *@property _highLightLayer
         *@type {Object}
         *@private
         */
        _highLightLayer: null,
        /**
        *气泡
        *@property _popup
        *@type {Object}
        *@private
        */
        _popup: null,

        /**
        *配置
        *@property options
        *@type {Object}
        */
        options: {
            zoomControl: false,
            zoomAnimationThreshold: 10,
            attributionControl: false,
            baseLayerUrl: null  //底图地址
        },

        mapState:"running",
        /**
        *初始化
        *@method initialize
        *@param options {Object} 地图配置
        */
        initialize: function (options) {
            try{
                UMAP.Core.BaseObject.prototype.initialize.call(this);
                this._container = document.getElementById(options.container);
                this.id = options.id;
                //======================初始化Map开始======================/
                this.basemaps=[];
                Project_ParamConfig.baseLayer.layers.forEach(function(baseLayerConfig){
                    switch (baseLayerConfig.type) {
                        case "tile":
                            let basemap=new Basemap({
                                baseLayers:[new TileLayer({url: baseLayerConfig.url})],
                                id:baseLayerConfig.id,
                                title:baseLayerConfig.attribution,
                                thumbnailUrl:baseLayerConfig.thumbnailUrl
                            });
                            this.basemaps.push(basemap);
                            break;
                        case "vector":
                            break;
                        case "wms":
                            break;
                        default:
                            break;
                    }
                }.bind(this));
                if (!this.basemaps[Project_ParamConfig.baseLayer.defaultBaseMapIndex]) return;

                this.map = new Map({
                    basemap: this.basemaps[Project_ParamConfig.baseLayer.defaultBaseMapIndex]
                });
                this.view = new MapView({
                    map: this.map,
                    container: options.container
                });
                var baseMapConfig=Project_ParamConfig.baseLayer.layers[Project_ParamConfig.baseLayer.defaultBaseMapIndex];
                this.view.center = baseMapConfig.origin;
                this.view.zoom = baseMapConfig.zoom;
                this.view.extent = new Extent(baseMapConfig.fullextent);
                this.view.ui.remove("attribution");//移除了地图窗体最下面的描述

                this.view.when(function(){
                    this.__initWidgets();//地图加载后初始化地图控件
                    this._addEvents();
                    this.mapState="finished";
                    // console.log("The view's resources success to load!");
                }.bind(this), function(error){
                    this.mapState="stopped";
                    console.log("The view's resources failed to load: ", error);
                });
            }catch(e){
                console.log(e);
            }
            //======================初始化Map结束======================/
        },
        __initWidgets:function(){
            var widgetsConf=Project_ParamConfig.viewWidgets;
            widgetsConf.forEach(function(widgetConf){
                if(widgetConf.visible){
                    switch (widgetConf.id){
                        case 'BasemapGallery':
                            var basemapGallery = new BasemapGallery({
                                view: this.view,
                                container: document.createElement("div"),
                                source:new LocalBasemapsSource({basemaps:this.basemaps})
                            });
                            var bgExpand = new ExpandWidget({
                                view: this.view,
                                content: basemapGallery,
                                autoCollapse:true
                            });
                            this.view.ui.add(bgExpand, widgetConf.position);
                            break;
                        case 'Home':
                            var homeWidget=new HomeWidget({
                                view: this.view
                            });
                            this.view.ui.add(homeWidget, widgetConf.position);
                            break;
                        case 'LegendWidget':
                            var legendWidget=new ExpandWidget({
                                content:new LegendWidget({view: this.view,style: "card"}),
                                view:this.view,
                                autoCollapse:true
                            });
                            this.view.ui.add(legendWidget, widgetConf.position);
                            break;
                    }
                }
            }.bind(this));
        },

        /**
        *监控事件
        *@method _addEvents
        */
        _addEvents:function(){
            this.view.on('focus',function(){
                connect.publish("activeMapChange",{id:this.id})
            }.bind(this));
            this.view.on("blur",function(){
                this._container
            }.bind(this));
        },
        /**
        *获取图层集合
        *@method getLayers
        *@return {Array} 图层列表
        */
        getLayers: function () {

        },

        /**
        *清空地图
        *@method clear
        */
        clear: function () {

        },

        /**
        *叠加专题
        *@method addLayer
        *@param url {String} 专题服务地址
        *@param options {Object} 专题配置
        *@return {Object} 返回叠加的专题对象
        */
        addLayer: function (url, options) {
            var layer = null;
            if (options.layerType == "2") {//切图
                var dymicLayer = new L.esri.Layers.DynamicMapLayer(url);
                dymicLayer.metadata(function (error, metadata) {
                    layer = new L.esri.Layers.TiledMapLayer(url, {
                        id: options.id,
                        name: options.name,
                        layerType: options.layerType,
                        tileSize: metadata.tileInfo.rows,
                        zIndex: 1,
                        origin: [metadata.tileInfo.origin.x, metadata.tileInfo.origin.y],
                        continuousWorld: true
                    }).addTo(this.map);
                }, this);
            } else if (options.layerType == "4") {//wmts
                this.getWmtsInfo(url, function (data) {
                    var level = data.level;
                    var latlng = data.latlng;
                    var lat = latlng.substr(0, latlng.indexOf(" "));
                    var lng = latlng.substr(latlng.indexOf(" ") + 1, latlng.length - latlng.indexOf(" "));
                    var m_matrixIds = new Array(level);
                    for (var i = 0; i < 22; i++) {
                        m_matrixIds[i] = {
                            identifier: "" + i,
                            topLeftCorner: new L.LatLng(lat, lng)
                        };
                    }

                    var newOptions = L.dci.app.util.mergesOptions(options, {
                        style: data.style,
                        zIndex: 1,
                        matrixIds: m_matrixIds,
                        continuousWorld: true,
                        tileSize: data.tileSize,
                        layerType: options.layerType,
                        tilematrixSet: data.tilematrixSet,
                        format: data.format
                    });
                    layer = L.tileLayer.wmts(url, newOptions).addTo(this.map);
                });
            } else if (options.layerType == "3") {//wms
                L.dci.app.util.mergesOptions(options, {
                    format: "image/png",
                    tileSize: this.options.tileSize,
                    continuousWorld: true,
                    layerType: options.layerType,
                    zIndex: 1,
                    layers: options.layers
                });
                layer = L.tileLayer.wms(url, options).addTo(this.map);
            } else {
                //矢量图
                //按区域调图
                if (Project_ParamConfig.areaload) {
                    var polygon = Project_ParamConfig.areaload;
                    var layers = options.layers;
                    var layerDefs = {};
                    for (var i = 0; i < layers.length; i++) {
                        //and
                        layerDefs[layers[i]] = "sde.st_intersects(sde.st_polygon ('polygon ((" + polygon + "))', sde.st_srid(shape)),shape)=1";
                    }
                    if (options.layerDefs) console.log('layerDefs 值被覆盖???');
                    options.layerDefs = layerDefs;//???
                }

                layer = L.esri.dynamicMapLayer(url, options).addTo(this.map);
            }

            if (layer == null) {
                L.dci.app.util.hideLoading();
            } else {
                //加载完之后
                layer.on("load", function () {
                    L.dci.app.util.hideLoading();
                }, this);
            }
            return layer;
        },

        createWmtsLayer: function (url, callback, options) {
            var layer = null;
            this.getWmtsInfo(url, function (data) {
                var level = data.level;
                var latlng = data.latlng;
                var lat = latlng.substr(0, latlng.indexOf(" "));
                var lng = latlng.substr(latlng.indexOf(" ") + 1, latlng.length - latlng.indexOf(" "));
                var m_matrixIds = new Array(level);
                for (var i = 0; i < 22; i++) {
                    m_matrixIds[i] = {
                        identifier: "" + i,
                        topLeftCorner: new L.LatLng(lat, lng)
                    };
                }

                var newOptions = L.dci.app.util.mergesOptions(options, {
                    style: data.style,
                    zIndex: 1,
                    matrixIds: m_matrixIds,
                    continuousWorld: true,
                    tileSize: data.tileSize,
                    origin: [parseFloat(lng), parseFloat(lat)],
                    tilematrixSet: data.tilematrixSet,
                    format: data.format,
                    layer: data.layer
                });
                layer = L.tileLayer.wmts(url, newOptions);
                callback.call(this, { layer: layer });
            });
        },
        /**
        *获取wmts图层参数信息
        *@method getWmtsInfo
        *@param url {String} WMTS专题服务地址
        *@param success {Object} 回调函数
        */
        getWmtsInfo: function (url, success) {
            L.dci.app.services.baseService.getWmtsInfo({
                url: url,
                context: this,
                success: function (o) {
                    var obj = o;
                    var data;
                    data = {
                        'level': parseFloat(obj.level),
                        'latlng': obj.topLeftCorner,
                        'tileSize': parseFloat(obj.tileSize),
                        'tilematrixSet': obj.tileMatrixSet,
                        'style': obj.style,
                        'format': obj.format,
                        'layer': obj.layer
                    }
                    success.call(this, data);
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    L.dci.app.util.dialog.error("WMTS服务异常", errorThrown.message);
                }
            });
        },
        /**
        *获取专题
        *@method getLayer
        *@param id {String} 专题ID
        *@return {Object} 专题对象
        */
        getLayer: function (id) {
            var layer = null;
            this.map.eachLayer(function (_layer) {
                if (_layer.options && _layer.options.id && _layer.options.id == id) {
                    layer = _layer;
                    return false;
                }
            });
            return layer;
        },

        /**
        *删除图层
        *@method removeLayer
        *@param id {String} 专题ID
        */
        removeLayer: function (id) {
            this.map.eachLayer(function (layer) {
                if (layer.options && layer.options.id) {
                    if (layer.options.id == id) {
                        this.map.removeLayer(layer);
                        return;
                    }
                }
            }, this);
        },

        /**
        *获取属性查询对象
        *@method getIdentify
        *@return {Object} 属性查询对象
        */
        getIdentify: function () {
            return this._identify;
        },

        /**
        *销毁
        *@method destroy
        */
        destroy: function () {
            this.map.destroy();
            this.map.remove();
            this.view.destroy();
            this.view=null;
            this.map=null;
        }
    });
    return UMAP.Core.Map;
});
