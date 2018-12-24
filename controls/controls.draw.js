/**
 *图形绘制
 *@module controls
 *@class UMAP.Controls.Draw
 *@extends UMAP.Control
 */
R.define([
    "dojo/_base/connect",
    "esri/widgets/Sketch/SketchViewModel",
    "esri/Graphic",
    "esri/layers/GraphicsLayer"
], function(connect, SketchViewModel, Graphic,GraphicLayer) {
    UMAP.Controls.Draw = UMAP.Core.BaseObject.extend({
        tempLayerId: "drawTempLayer",
        _pointSymbol:{
            type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
            style: "circle",
            color: "#fff",
            size: "9px",
            outline: { // autocasts as new SimpleLineSymbol()
                color: [116, 142, 168],
                width: 3
            }
        },
        _polylineSymbol:{
            type: "simple-line",
            color: "rgba(116, 142, 168, 0.8)",
            width: "2",
            style: "short-dash"
        },
        _polygonSymbol:{
            type: "simple-fill",
            color: "rgba(116, 142, 168, 0.5)",
            style: "solid",
            outline: {
              color: [116, 142, 168],
              width: 1
            }
        },
        _editGraphic:null,
        initialize: function(mapObj) {
            this._view = mapObj.view;
            this._map = mapObj.map;
            this._graphicLayer = this._map.findLayerById(this.tempLayerId);
            if (this._map.findLayerById(this.tempLayerId)) {
                this._graphicLayer.removeAll();
            } else {
                this._graphicLayer = new GraphicLayer({
                    id: this.tempLayerId
                });
                this._map.add(this._graphicLayer);
            }
            this._draw = new SketchViewModel({
                view:this._view,
                layer: this._graphicLayer,
                pointSymbol:this._pointSymbol,
                polylineSymbol:this._polylineSymbol,
                polygonSymbol:this._polygonSymbol
            });
            this._draw.on("create-complete", this._addGraphic.bind(this));
            this._draw.on("update-complete", this._updateGraphic.bind(this));
            this._draw.on("update-cancel", this._updateGraphic.bind(this));
            this._setUpClickHandler();
        },
        _addGraphic:function(event) {
            const symbol=__convertSymbol(event.tool.toUpperCase());
            const graphic = new Graphic({
                geometry: event.geometry,
                symbol: symbol?symbol:this._draw.graphic.symbol
            });
            this._graphicLayer.add(graphic);

            function __convertSymbol(type){
                switch (type){
                    case 'POINT':
                        return {
                            type: "picture-marker",
                            url: "themes/images/draw/point1.png",
                            width: "24px",
                            height: "28px"
                        }
                    default:
                        return null
                }
            }
        },
        _updateGraphic:function(event) {
            var graphic = new Graphic({
                geometry: event.geometry,
                symbol: this._editGraphic.symbol
            });
            this._graphicLayer.add(graphic);
            this._editGraphic = null;
        },
        _setUpClickHandler: function() {
            const self=this;
            let handler=connect.subscribe("clickMap",function(event){
                self._view.hitTest(event).then(function(response) {
                    var results = response.results;
                    if (results.length > 0) {
                        for (var i = 0; i < results.length; i++) {
                            if (!self._editGraphic && results[i].graphic.layer.id === self.tempLayerId) {
                                self._editGraphic = results[i].graphic;
                                self._graphicLayer.remove(self._editGraphic);
                                self._draw.update(self._editGraphic);
                                break;
                            }
                        }
                    }
                });
            });
            self.connectHandlers.push(handler);
        },
        /**
         *绘制点
         *@property drawPoint
         *@type {}
         */
        drawPoint:function(){
            this._draw.create("point");
        },
        /**
         *绘制线段
         *@property drawPolyline
         *@type {}
         */
        drawPolyline:function(){
            this._draw.create("polyline");
        },
        /**
         *绘制多边形
         *@property drawPolygon
         *@type {}
         */
        drawPolygon:function(){
            this._draw.create("polygon");
        },
        /**
         *绘制矩形
         *@property drawRectangle
         *@type {}
         */
        drawRectangle:function(){
            this._draw.create("rectangle");
        },
        /**
         *绘制圆形
         *@property drawCircle
         *@type {}
         */
        drawCircle:function(){
            this._draw.create("circle");
        },
        /**
         *绘制文本
         *@property drawText
         *@type {}
         */
        drawText:function(){
            this._draw.create("point");
        },
        /**
         *获取当前绘制的状态：ready | disabled | creating | updating
         *@property getDrawState
         *@type {}
         */
        getDrawState:function(){
            return this._draw.state;
        },
        /**
         *重置绘制
         *@property reset
         *@type {Object}
         */
        reset: function() {
            this._draw.complete();
            this._draw.reset();
        },
        /**
         *清除绘制的图形
         *@property clear
         *@type {Object}
         */
        clear: function() {
            this._graphicLayer.removeAll();
        },
        /**
         *注销绘制
         *@property destroy
         *@type {Object}
         */
        destroy: function() {
            this.reset();
            this.clear();
        }
    });
});
