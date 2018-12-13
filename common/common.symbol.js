/**
*样式类 获取要素渲染的样式
*@module core
*@class UMAP.Symbol
*@constructor initialize
*@extends UMAP.BaseObject
*/
R.define([
    'core/baseobject',
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleFillSymbol",
    "esri/symbols/TextSymbol"
], function (SimpleMarkerSymbol,SimpleLineSymbol,SimpleFillSymbol,TextSymbol) {
    UMAP.Common.Symbol = UMAP.Core.BaseObject.extend({
        /**
        *点样式
        *@property pointSymbol
        *@type {Object}
        */
        pointSymbol: null,
        /**
        *线样式
        *@property polylineSymbol
        *@type {Object}
        */
        polylineSymbol: null,
        /**
        *面样式
        *@property polygonSymbol
        *@type {Object}
        */
        polygonSymbol: null,
        /**
        *点高亮样式
        *@property highlightPointSymbol
        *@type {Object}
        */
        highlightPointSymbol: null,
        /**
        *线高亮样式
        *@property highlightPolylineSymbol
        *@type {Object}
        */
        highlightPolylineSymbol: null,
        /**
        *面高亮样式
        *@property highlightPolygonSymbol
        *@type {Object}
        */
        highlightPolygonSymbol: null,
        /**
        *初始化
        *@method initialize
        */
        initialize: function () {
            this.pointSymbol =new SimpleMarkerSymbol({
                type: "simple-marker",
                size: 10,
                color: [255, 0, 0, 1],
                outline: {
                    color: [255, 0, 0, 0.51],
                    width: 7
                }
            });

            this.pointSymbol_image = new SimpleMarkerSymbol({
                type: "simple-marker",
                size: 10,
                color: [255, 0, 0, 1],
                path:"themes/default/images/map-marker-alt-solid.svg"
            });

            this.polylineSymbol =new SimpleLineSymbol({
                type: "simple-line",  // autocasts as new SimpleLineSymbol()
                color: [255, 0, 0, 1],
                width: "2px",
                style: "short-dot"
            });

            this.polygonSymbol =new SimpleFillSymbol({
                type: "simple-fill",
                color: [255, 0, 0, 0.24],
                style: "solid",
                outline: {
                    color: [255, 0, 0, 1],
                    style: "dot",
                    width: 2
                }
            });

            this.highlightPointSymbol = new SimpleMarkerSymbol({
                type: "simple-marker",
                size: 10,
                color: [25, 170, 141, 1],
                outline: {
                    color: [25, 170, 141, 0.51],
                    width: 7
                }
            });

            this.highlightPolylineSymbol = new SimpleLineSymbol({
                type: "simple-line",  // autocasts as new SimpleLineSymbol()
                color: [25, 170, 141, 1],
                width: "2px",
                style: "solid"
            });

            this.highlightPolygonSymbol =new SimpleFillSymbol({
                type: "simple-fill",
                color: [25, 170, 141, 0.24],
                style: "solid",
                outline: {
                    color: [25, 170, 141, 1],
                    width: 2
                }
            });
        }
    });
    return UMAP.Common.Symbol;
});
