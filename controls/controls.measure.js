/**
 *测量控件
 *@module controls
 *@class UMAP.Controls.Measure
 *@extends UMAP.Control
 */
R.define([
    "dojo/_base/connect",
    "esri/views/2d/draw/Draw",
    "esri/Graphic",
    "esri/geometry/Polygon",
    "esri/geometry/Polyline",
    "esri/geometry/geometryEngine",
    "esri/layers/GraphicsLayer"
], function(connect, esriDraw, Graphic, Polygon, Polyline, geometryEngine, GraphicLayer) {
    UMAP.Controls.Measure = UMAP.Core.BaseObject.extend({
        tempLayerId: "mesuareTempLayer",
        _lengthUnit: "kilometers",
        _lengthUnitShortName: '公里',
        _areaUnit: "square-kilometers",
        _areaUnitShortName: '平方公里',
        _getPointGraphic:function(geo) {
            return new Graphic({
                geometry: {
                    type: "point",
                    x: geo.x,
                    y: geo.y,
                    spatialReference:geo.spatialReference
                },
                symbol: {
                    type: "simple-marker", // autocasts as new SimpleFillSymbol
                    color: [255, 255, 255],
                    size:"6px",
                    style: "solid",
                    outline: { // autocasts as SimpleLineSymbol
                        color: [116, 142, 168,0.8],
                        width: 2
                    }
                },
            });
        },
        _getTextGraphic: function(position, text) {
            return new Graphic({
                geometry: position,
                symbol: {
                    type: "text",
                    color: [47, 64, 80, 0.8],
                    text: text,
                    xoffset: 3,
                    yoffset: 3,
                    font: { // autocast as Font
                        size: 14,
                        family: "sans-serif",
                        weight: "bold"
                    }
                }
            });
        },
        initialize: function(mapObj) {
            this._view = mapObj.view;
            this._map = mapObj.map;
            this._draw = new esriDraw({
                view: this._view
            });
            this._graphicLayer = this._map.findLayerById(this.tempLayerId);
            if (this._map.findLayerById(this.tempLayerId)) {
                this._graphicLayer.removeAll();
            } else {
                this._graphicLayer = new GraphicLayer({
                    id: this.tempLayerId
                });
                this._map.add(this._graphicLayer);
            }
        },
        /**
         *开始绘制
         *@property start
         *@type {Object}
         */
        start: function() {},
        /**
         *结束绘制
         *@property end
         *@type {Object}
         */
        end: function() {
            this._draw.complete();
        },
        /**
         *重置绘制
         *@property reset
         *@type {Object}
         */
        reset: function() {
            this._draw.reset();
        },
        /**
         *标记测量信息
         *@property labelInfo
         *@type {Object}
         */
        labelInfo: function() {},
        /**
         *绘制图形
         *@property drawGeo
         *@type {Object}
         */
        drawGeo: function() {},
        /**
         *清除绘制的图形
         *@property clear
         *@type {Object}
         */
        clear: function() {
            this._graphicLayer.removeAll();
        },
        /**
         *退出测量
         *@property destroy
         *@type {Object}
         */
        destroy: function() {
            this._map.remove(this._graphicLayer);
        }
    });

    UMAP.Controls.MeasureDistance = UMAP.Controls.Measure.extend({
        start: function() {
            this.clear();
            this._action = this._draw.create("polyline");
            this._view.focus();
            this._action.on("vertex-add", this.drawGeo.bind(this));
            this._action.on("cursor-update", this.drawGeo.bind(this));
            this._action.on("vertex-remove", this.drawGeo.bind(this));
            this._action.on("redo", this.drawGeo.bind(this));
            this._action.on("undo", this.drawGeo.bind(this));
            this._action.on("draw-complete", this.drawGeo.bind(this));
        },
        labelInfo: function(geom, res) {
            let g=this._getTextGraphic(geom.extent.center,res.toFixed(2) + " " + this._lengthUnitShortName);
            this._graphicLayer.add(g);
        },
        _pointVertice: function(vertices) {
            //标记线段的顶点
            vertices.forEach(function(vertice) {
                let g = this._getPointGraphic({
                    x: vertice[0],
                    y: vertice[1],
                    spatialReference: this._view.spatialReference
                })
                this._graphicLayer.add(g);
            }.bind(this));
        },
        _pointStartText:function(geo){
            //标记线段起点text
            let g=this._getTextGraphic(
                {
                    type: "point",
                    x: geo[0],
                    y: geo[1],
                    spatialReference:this._view.spatialReference
                },"起点"
            );
            this._graphicLayer.add(g);
        },
        drawGeo: function(event) {
            var paths = event.vertices;
            let __view = this._view;
            //避免两个点过于相近，判断两个点距离是否小于15个屏幕像素
            if(event.type=='vertex-add' && event.vertices.length>1){
                let prePoint={type:'point',x:event.vertices[event.vertexIndex-1][0],y:event.vertices[event.vertexIndex-1][1],spatialReference:__view.spatialReference},
                    curPoint={type:'point',x:event.vertices[event.vertexIndex][0],y:event.vertices[event.vertexIndex][1],spatialReference:__view.spatialReference};
                let preScreenP=__view.toScreen(prePoint),
                    curScreenP=__view.toScreen(curPoint);
                if(Math.abs(preScreenP.x-curScreenP.x)<15){
                    event.preventDefault();
                    return;
                }
            }

            this._graphicLayer.removeAll();
            const graphic = new Graphic({
                geometry: {
                    type: "polyline",
                    paths: paths,
                    spatialReference: __view.spatialReference
                },
                symbol: {
                    type: "simple-line", // autocasts as new SimpleFillSymbol
                    color: [116, 142, 168, 0.6],
                    width: 4,
                    cap: "round",
                    join: "round"
                }
            });

            let polyline = graphic.geometry;
            //检查线条是否自相交
            const intersectingSegment = getIntersectingSegment(polyline);
            if (intersectingSegment) {
                this._graphicLayer.addMany([graphic, intersectingSegment]);
            } else {
                this._graphicLayer.add(graphic);
            }
            if (intersectingSegment) {
                event.preventDefault();
            }
            var lineLength = geometryEngine.geodesicLength(polyline, this._lengthUnit);
            if (lineLength < 0) {
                var simplifiedPolyLine = geometryEngine.simplify(polyline);
                if (simplifiedPolyLine) {
                    lineLength = geometryEngine.geodesicLength(simplifiedPolyLine, this._lengthUnit);
                }
            }
            this.labelInfo(polyline, lineLength);
            this._pointVertice(event.vertices);
            if(event.vertices.length>1){
                this._pointStartText(event.vertices[0]);
            }

            function isSelfIntersecting(polyline) {
                if (polyline.paths[0].length < 3) {
                    return false
                }
                const line = polyline.clone();
                const lastSegment = getLastSegment(polyline);
                line.removePoint(0, line.paths[0].length - 1);
                return geometryEngine.crosses(lastSegment, line);
            }

            function getIntersectingSegment(polyline) {
                if (isSelfIntersecting(polyline)) {
                    return new Graphic({
                        geometry: getLastSegment(polyline),
                        symbol: {
                            type: "simple-line",
                            style: "short-dot",
                            width: 3.5,
                            color: "yellow"
                        }
                    });
                }
                return null;
            }

            function getLastSegment(polyline) {
                const line = polyline.clone();
                const lastXYPoint = line.removePoint(0, line.paths[0].length - 1);
                const existingLineFinalPoint = line.getPoint(0, line.paths[0].length - 1);
                return {
                    type: "polyline",
                    spatialReference: __view.spatialReference,
                    hasZ: false,
                    paths: [
                        [
                            [existingLineFinalPoint.x, existingLineFinalPoint.y],
                            [lastXYPoint.x, lastXYPoint.y]
                        ]
                    ]
                };
            }
        }
    });

    UMAP.Controls.MeasureArea = UMAP.Controls.Measure.extend({
        start: function() {
            this.clear();
            this._action = this._draw.create("polygon");
            this._view.focus();
            this._action.on("vertex-add", this.drawGeo.bind(this));
            this._action.on("cursor-update", this.drawGeo.bind(this));
            this._action.on("vertex-remove", this.drawGeo.bind(this));
            this._action.on("redo", this.drawGeo.bind(this));
            this._action.on("undo", this.drawGeo.bind(this));
            this._action.on("draw-complete", this.drawGeo.bind(this));
        },
        labelInfo: function(geom, area) {
            let g=this._getTextGraphic(geom.centroid,area.toFixed(2) + " " + this._areaUnitShortName);
            this._graphicLayer.add(g);
        },
        drawGeo: function(event) {
            var vertices = event.vertices;
            this._graphicLayer.removeAll();

            var polygon = new Polygon({
                rings: vertices,
                spatialReference: this._view.spatialReference
            });

            var graphic = new Graphic({
                geometry: polygon,
                symbol: {
                    type: "simple-fill",
                    color: [116, 142, 168, 0.4],
                    style: "solid",
                    outline: {
                        color: [47, 64, 80, 0.82],
                        width: 2
                    }
                }
            });
            this._graphicLayer.add(graphic);
            var area = geometryEngine.geodesicArea(polygon, this._areaUnit);
            if (area < 0) {
                var simplifiedPolygon = geometryEngine.simplify(polygon);
                if (simplifiedPolygon) {
                    area = geometryEngine.geodesicArea(simplifiedPolygon, this._areaUnit);
                }
            }
            this.labelInfo(polygon, area);
        }
    });
});
