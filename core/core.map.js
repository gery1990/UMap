/**
*地图类
*@module core
*@class UMAP.Map
*@constructor initialize
*@extends UMAP.BaseObject
*/
R.define([
    "core/baseobject",
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
    "dojo/domReady!"
], function (baseobject,Map,MapView,TileLayer,Extent,ExpandWidget,BasemapGallery,LocalBasemapsSource,Basemap,HomeWidget,LegendWidget) {
    UMAP.Map = UMAP.BaseObject.extend({
        /**
        *地图对象
        *@property map
        *@type {Object}
        */
        map: null,
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
        /**
        *初始化
        *@method initialize
        *@param options {Object} 地图配置
        */
        initialize: function (options) {
            try{
                UMAP.BaseObject.prototype.initialize.call(this);
                this.container = document.getElementById(options.container);
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

                var mapObj = new Map({
                    basemap: this.basemaps[Project_ParamConfig.baseLayer.defaultBaseMapIndex]
                });
                this.view = new MapView({
                    map: mapObj,
                    container: options.container
                });
                var baseMapConfig=Project_ParamConfig.baseLayer.layers[Project_ParamConfig.baseLayer.defaultBaseMapIndex];
                this.view.center = baseMapConfig.origin;
                this.view.zoom = baseMapConfig.zoom;
                this.view.extent = new Extent(baseMapConfig.fullextent);
                this.view.ui.remove("attribution");//移除了地图窗体最下面的描述

                this.view.when(function(){
                    this.__initWidgets();//地图加载后初始化地图控件
                    console.log("The view's resources success to load!");
                }.bind(this), function(error){
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

                            // var toggleBaseMapObj = new Basemap({
                            //     id:Project_ParamConfig.baseLayer.toggleMap.id,
                            //     baseLayers: [baseLayers[Project_ParamConfig.baseLayer.toggleMap.index]],
                            //     thumbnailUrl:Project_ParamConfig.baseLayer.toggleMap.thumbnailUrl
                            // });
                            //
                            // var toggleWidgets = new BasemapToggle({
                            //     view: view,
                            //     nextBasemap: toggleBaseMapObj
                            // });
                            // view.ui.add(toggleWidgets, "bottom-right");
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
        *激活鼠标状态
        *@method activate
        *@param type {string} 鼠标状态类型
        *@param callback {Object}  回调函数
        *@param precall {Object} 激活后执行函数
        *@param context {Object} 当前上下文
        */
        activate: function (type, callback, precall, context) {
            this.deactivate();
            this.setCursor(type);
            if (type == L.DCI.Map.StatusType.SELECT) {//选择
                if (callback != undefined) {
                    this._callback = callback;
                    this._events.push({ "event": this.map.on("click", this._callback, context), "type": type, mapType: 'click' });
                }
            } else if (type == L.DCI.Map.StatusType.PAN) {
                this.deactivate();
            } else if (type == L.DCI.Map.StatusType.ZOOM_IN) {
                this.deactivate();
                this.map.zoomIn();
            } else if (type == L.DCI.Map.StatusType.ZOOM_OUT) {//缩放
                this.deactivate();
                this.map.zoomOut();
            } else {//绘制
                switch (type) {
                    case L.DCI.Map.StatusType.POINT: //点
                        if (this._drawTool == null)
                            this._drawTool = L.dci.draw(this.map);
                        this._drawTool.point();
                        break;
                    case L.DCI.Map.StatusType.POINTTEXT: //标注
                        if (this._drawTool == null)
                            this._drawTool = L.dci.draw(this.map);
                        this._drawTool.pointtext();
                        break;
                    case L.DCI.Map.StatusType.POLYLINE: //线
                        if (this._drawTool == null)
                            this._drawTool = L.dci.draw(this.map);
                        this._drawTool.polyline();
                        break;
                    case L.DCI.Map.StatusType.CIRCLE: //圆
                        if (this._drawTool == null)
                            this._drawTool = L.dci.draw(this.map);
                        this._drawTool.circle();
                        break;
                    case L.DCI.Map.StatusType.RECTANGLE: //矩形
                        if (this._drawTool == null)
                            this._drawTool = L.dci.draw(this.map);
                        this._drawTool.rectangle();
                        break;
                    case L.DCI.Map.StatusType.POLYGON: //面
                        if (this._drawTool == null)
                            this._drawTool = L.dci.draw(this.map);
                        this._drawTool.polygon();
                        break;

                    case L.DCI.Map.StatusType.MEASURELEN: //测距
                        if (this._measureTool == null)
                            this._measureTool = L.dci.measure(this.map);
                        this._measureTool.distance();
                        break;
                    case L.DCI.Map.StatusType.MEASUREAREA: //测面积
                        if (this._measureTool == null)
                            this._measureTool = L.dci.measure(this.map);
                        this._measureTool.area();
                        break;
                    default:
                        break;
                }
                if (callback != undefined) {
                    this._callback = callback;
                    this._events.push({ "event": this.map.on("draw:created", this.draw, context), "type": type, mapType: 'draw:created' });
                }
            }
            if (precall != null)
                precall();

            this.status = type;
        },

        /**
        *重置鼠标状态
        *@method deactivate
        */
        deactivate: function () {
            for (var tool in this._drawTools) {
                if (this._drawTools[tool] != null) this._drawTools[tool].disable();
            }
            if (this._measureTool) this._measureTool.disable();
            if (this._drawTool) { this._drawTool.disable(); }
            for (var i = 0; i < this._events.length; i++) {
                this.map.off(this._events[i].mapType);
            }
            this._callback = null;
            this._events = [];
            this.setCursor(L.DCI.Map.StatusType.PAN);
        },

        /**
        *获取地图对象
        *@method getMap
        *@return {Object} map对象
        */
        getMap: function () {
            return this.map;
        },

        /**
        *获取图层集合
        *@method getLayers
        *@return {Array} 图层列表
        */
        getLayers: function () {
            var lyArr = [];
            this.map.eachLayer(function (layer) {
                lyArr.push(layer);
            });
            return lyArr;
        },

        /**
        *添加Shp要素
        *@method addShp
        *@param id {String} 需要添加的shp要素的id
        */
        addShp: function (id) {
            var _layer = null;
            var layer = null;
            for (var i = 0, item; item = this._shpLayerGroups[i++];) {
                if (item.groupId == id) {
                    _layer = item;
                    layer = item.group;
                    break;
                }
            }
            if (!_layer) {
                for (var j = 0, item2; item2 = this.shpLayerGroups[j++];) {
                    if (item2.groupId == id) {
                        layer = {};
                        $.extend(layer, item2);
                        layer.group = item2.group.clone();
                        item2["visible_" + this.id] = true;

                        this.map.addLayer(layer.group);
                        this._shpLayerGroups.push(layer);
                        break;
                    }
                }
            }
            return layer;
        },

        /**
        *添加Cad要素
        *@method addCad
        *@param id {String} 需要添加的Cad要素的id
        */
        addCad: function (id) {
            var _layer = null;
            var layer = null;

            for (var i = 0, item; item = this._cadLayerGroups[i++];) {
                if (item.groupId == id) {
                    _layer = item;
                    layer = item.group;
                    break;
                }
            }
            if (!_layer) {
                for (var j = 0, item2; item2 = this.cadLayerGroups[j++];) {
                    if (item2.groupId == id) {
                        layer = {};
                        $.extend(layer, item2);
                        layer.group = item2.group.clone();
                        item2["visible_" + this.id] = true;

                        this.map.addLayer(layer.group);
                        this._cadLayerGroups.push(layer);
                        break;
                    }
                }
            }
            return layer;
        },
        /**
        *移除Shp要素
        *@method removeShp
        *@param id {String} 需要移除的shp要素的id
        */
        removeShp: function (id) {
            //var map = L.dci.app.pool.get('map');
            for (var i = 0, item; item = this._shpLayerGroups[i++];) {
                if (id == item.groupId) {
                    this.map.removeLayer(item.group);
                    this._shpLayerGroups.splice(i - 1, 1);
                    break;
                }
            }

            for (var j = 0, item2; item2 = this.shpLayerGroups[j++];) {
                if (item2.groupId == id) {
                    item2["visible_" + this.id] = false;
                    break;
                }
            }
        },
        /**
        *移除所有Cad要素
        *@method removeAllCad
        */
        removeAllCad: function () {
            for (var i = 0, item; item = this._cadLayerGroups[i++];) {
                this.map.removeLayer(item.group);
                this._cadLayerGroups.splice(i - 1, 1);
            }
            for (var j = 0, item2; item2 = this.cadLayerGroups[j++];) {
                item2["visible_" + this.id] = false;
            }
        },
        /**
        *移除Cad要素
        *@method removeShp
        *@param id {String} 需要移除的Cad要素的id
        */
        removeCad: function (id) {
            for (var i = 0, item; item = this._cadLayerGroups[i++];) {
                if (id == item.groupId) {
                    this.map.removeLayer(item.group);
                    this._cadLayerGroups.splice(i - 1, 1);
                    break;
                }
            }
            for (var j = 0, item2; item2 = this.cadLayerGroups[j++];) {
                if (item2.groupId == id) {
                    item2["visible_" + this.id] = false;
                    break;
                }
            }
        },
        /*绘制事件回调*/
        draw: function (geo) {

        },

        /**
        *获取地图鼠标状态
        *@method getCurrentStatus
        */
        getCurrentStatus: function () {
            return this._status;
        },

        /**
        *设置当前底图
        *@method setBaseLayer
        *@param layer {Object} 图层
        */
        setBaseLayer: function (layer) {
            if (layer != this._baseLayer) {
                this._baseLayer = layer;
                this.options.baseLayer = layer.url;
            }
        },

        /**
        *获取当前底图
        *@method getBaseLayer
        *@return {Object} 图层
        */
        getBaseLayer: function () {
            return this._baseLayer;
        },

        /**
        *设置右键菜单
        *@method _addContextmenu
        *@private
        */
        _addContextmenu: function () {
            if (this.options.contextmenu == true && this.controls.contextmenu == null) {
                var data = L.dci.app.menu.getContextMenu(this);
                this.options = L.setOptions(this, {
                    contextmenu: true,
                    contextmenuWidth: 140,
                    contextmenuItems: data
                });
            }
        },
        /**
        *添加地图控件
        *@method _addDefaultControls
        *@private
        */
        _addDefaultControls: function () {
            //鹰眼
            if (this.options.miniMapControl == true && this.controls.miniMap == null) {
                var miniLayer = null;
                if (this.options.baseLayer.type == "tile") {
                    miniLayer = new L.esri.Layers.TiledMapLayer(this.options.baseLayer.url, {
                        tileSize: this.options.tileSize,
                        continuousWorld: true
                    });
                } else if (this.options.baseLayer.type == "wmts") {
                    this.createWmtsLayer(this.options.baseLayer.url, function (js) {
                        miniLayer = js.layer;
                    }, {});
                } else {
                    miniLayer = L.esri.dynamicMapLayer(this.options.baseLayer.url, {
                        continuousWorld: true
                    });
                }
                if (miniLayer) {
                this.controls.miniMap = L.dci.minimap(miniLayer, { toggleDisplay: true }).addTo(this.map);
                } else {
                    var t = setInterval($.proxy(function () {
                        if (miniLayer) {
                            clearInterval(t);
                            this.controls.miniMap = L.dci.minimap(miniLayer, { toggleDisplay: true }).addTo(this.map);
            }
                    }, this), 100);
                }
            }
            //切换工具
            if (this.options.layerSwitchControl && this.controls.layerswitch == null) {

                var baseLayersArr = { "底图切换": {} };
                baseLayersArr["底图切换"][this.options.baseLayer.name] = this._baseLayer;

                for (var i = 0; i < this.options.changeLayers.length; i++) {
                    var baseObj = this.options.changeLayers[i];
                    if (baseObj.tiled) {
                        baseLayersArr["底图切换"][baseObj.name] = new L.esri.Layers.TiledMapLayer(baseObj.url, {
                            id: "basemap_" + i,
                            name: baseObj.name,
                            img: "images/controls/grouplayer/" + baseObj.img,
                            tileSize: baseObj.tileSize,
                            origin: [baseObj.origin[0], baseObj.origin[1]],
                            zIndex: 1,
                            continuousWorld: true
                        });
                    } else {
                        baseLayersArr["底图切换"][baseObj.name] = new L.esri.Layers.DynamicMapLayer(baseObj.url, {
                            img: "images/controls/grouplayer/" + baseObj.img,
                            layers: baseObj.layerIndex
                        });
                    }
                }

                var groupedOverlays = { "快捷添加图层": {} };
                for (var i = 0; i < this.options.themLayers.length; i++) {
                    var obj = this.options.themLayers[i];
                    groupedOverlays["快捷添加图层"][obj.name] =
                        new L.esri.DynamicMapLayer(obj.url, {
                            id: "thememap_" + i,
                            name: obj.name, layers: [obj.index]
                        });
                }
                var layerControl = L.dci.groupedLayers(baseLayersArr, groupedOverlays, null);
                this.map.addControl(layerControl);
            }

            if (this.options.layerTabControl && this.layertab == null) {
                this.layertab = L.dci.layertab(this);
                L.DCI.App.pool.add(this.layertab);
                this.map.addControl(this.layertab);
            }
            this.controls.print = L.dci.print();

            //=========================添加时间轴==============================/
            if (this.options.timesliderControl) {
            this.controls.timeslider = new L.DCI.Controls.TimeSlider(this.options);
            this.map.addControl(this.controls.timeslider);
            }

            if (this.controls.legend == null) {
                this.controls.legend = L.dci.legend({
                    isshow: false
                });
                this.map.addControl(this.controls.legend);
            }
        },

        /**
        *获取控件集合
        *@method getControls
        *@return {Object} 控件集合
        */
        getControls: function () {
            return this.controls;
        },

        /**
        *清空地图
        *@method clear
        */
        clear: function () {
            this.deactivate();
            if (this._drawTool) this._drawTool.clear();
            this.setCursor(L.DCI.Map.StatusType.PAN);
            if (this._identify) this._identify.clear();
            if (this._query) this._query.clear();
            if (this._popup) this.map.removeLayer(this._popup);
            if (this._highLightLayer) this._highLightLayer.clearLayers();
            if (this._geoJsonLayerGroup) this._geoJsonLayerGroup.clearLayers();
            //移除GP图层
            if (this.map.tempResultLayer) {
                for (; this.map.tempResultLayer.length != 0;) { this.map.removeLayer(this.map.tempResultLayer[0]); this.map.tempResultLayer.splice(0, 1); }
            }
            this.fire('map:clear', { map: this });
        },
        /**
        *获取地图气泡
        *@method getPopup
        *@return {Object} 气泡对象
        */
        getPopup: function () {
            return this._popup;
        },
        /**
        *获取初始化地图范围
        *@method _getInitExtent
        *@private
        */
        _getInitExtent: function () {
            this.center = this.map.getCenter();
            this.zoom = this.map.getZoom();
        },

        /**
        *全图
        *@method zoomToFullExtent
        */
        zoomToFullExtent: function () {
            this.map.setView(this.center, this.zoom);
        },

        /**
        *设置鼠标状态
        *@method setCursor
        *@param type {Object} 鼠标状态类型
        *@param cursorImg {String} 鼠标图片地址
        */
        setCursor: function (type) {
            if (type == L.DCI.Map.StatusType.PAN) {
                this.map.getContainer().style.cursor = "";
            } else {
                this.map.getContainer().style.cursor = "default";
            }
        },

        /**
        *设置鼠标状态样式
        *@method setCursorImg
        *@param type {Object} 鼠标状态类型
        *@param cursorImg {String} 鼠标图片地址
        */
        setCursorImg: function (cursorImg) {
            if (cursorImg != undefined)
                this.map.getContainer().style.cursor = "url(themes/default/images/cursor/"+cursorImg+"),auto";
            else
                this.map.getContainer().style.cursor = "";
        },
        /**
        *设置图例
        *@method legend
        */
        legend: function () {
            if (!this._legend) {
                this._legend = L.dci.legend();
                this._legend.addTo(this.map);
            } else {
                this._legend.show();
            }

        },

        /**
        *前一视图
        *@method goBack
        */
        goBack: function () {
            if (this._curIndx != 0) {
                this.map.off('moveend', this._updateHistory, this);
                this.map.once('moveend', function () { this.map.on('moveend', this._updateHistory, this); }, this);
                this._curIndx--;
                var view = this._viewHistory[this._curIndx];
                if (view) this.map.setView(view.center, view.zoom);
            }
        },
        /**
        *后一视图
        *@method goForward
        */
        goForward: function () {
            if (this._curIndx != this._viewHistory.length - 1) {
                this.map.off('moveend', this._updateHistory, this);
                this.map.once('moveend', function () { this.map.on('moveend', this._updateHistory, this); }, this);
                this._curIndx++;
                var view = this._viewHistory[this._curIndx];
                if (view) this.map.setView(view.center, view.zoom);
            }
        },
        /**
        *更新当前视图
        *@method _updateHistory
        */
        _updateHistory: function () {
            var newView = { center: this.map.getCenter(), zoom: this.map.getZoom() };
            var insertIndx = this._curIndx + 1;
            this._viewHistory.splice(insertIndx, this._viewHistory.length - insertIndx, newView);
            this._curIndx++;
        },

        /**
        *判断专题是否存在
        *@method hasLayer
        *@param id {String} 专题ID
        *@return {bool}
        */
        hasLayer: function (id) {
            for (var i = 0; i < this._layerInfo.length; i++) {
                if (this._layerInfo[i].id == id) {
                    return true;
                }
            }
            return false;
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
        *闪烁
        *@method flicker
        *@param layers {Array} 要素数组
        *@param opacity {Number} 透明度
        */
        flicker: function (layers, opacity) {
            if (layers.length == 0) return;
            var _this = this;
            var count = 0;

            if (this._flicker) {
                clearInterval(this._flicker);
                this._flicker = null;

                for (var i = 0; i < this._flickerGeo.length; i++) {
                    this._flickerGeo[i].setStyle({ fillOpacity: opacity });
                }
            }
            this._flicker = setInterval(function () {
                _this._flickerGeo = null;
                _this._flickerGeo = layers;

                if (count == 5) {
                    clearInterval(_this._flicker);
                    _this._flicker = null;
                    for (var i = 0; i < layers.length; i++) {
                        layers[i].setStyle({ fillOpacity: opacity });
                    }
                    return;
                }
                if (count % 2 != 0) {
                    for (var i = 0; i < layers.length; i++) {
                        layers[i].setStyle({ fillOpacity: opacity });
                    }
                }
                else {
                    for (var i = 0; i < layers.length; i++) {
                        layers[i].setStyle({ fillOpacity: 0.5 });
                    }
                }
                count++;
            }, 250);
        },
        /**
        *获取高亮图层
        *@method getHighLightLayer
        *@return {Object} 返回图层对象
        */
        getHighLightLayer: function () {
            return this._highLightLayer;
        },
        /**
        *第二版获取高亮图层方法，防止互斥
        *@method getHLLayer
        *@name {String} 高亮图层名
        */
        getHLLayer: function (name) {
            this['_HLLayer_' + name] = new L.layerGroup();
            this['_HLLayer_' + name].addTo(this.map);
            return this['_HLLayer_' + name];
        },

        /**
        *属性查询
        *@method identify
        */
        identify: function () {
            if (this._identify == null)
                this._identify = new L.DCI.Identify(this);
            this._identify.active();
        },
        /**
        *模糊查询
        *@method query
        */
        query: function (key) {
            if (this._query == null)
                //this._query = new L.DCI.QuickQuery(this);
                this._query = new L.DCI.XMQuickQuery(this);
            this._query.query(key);
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
            if (this.controls != null) {
                for (var i = this.controls.length - 1; i >= 0; --i) {
                    this.controls[i].destroy();
                }
                this.controls = null;
            }
            if (this.shpLayerGroups) for (var j = 0, item2; item2 = this.shpLayerGroups[j++];) { item2["visible_" + this.id] = false; }
            if (this.cadLayerGroups) for (var k = 0, item3; item3 = this.cadLayerGroups[k++];) { item3["visible_" + this.id] = false; }
            this.map.eachLayer(function (layer) { this.map.removeLayer(layer);}, this);
        }
    });
});
