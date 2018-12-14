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
        initialize: function(mapObj) {
            this._view = mapObj.view;
            this._map = mapObj.map;
            this._draw = new esriDraw({
                view: this._view
            });
            this._graphciLayer = this._map.findLayerById(this.tempLayerId);
            if (this._map.findLayerById(this.tempLayerId)) {
                this._graphciLayer.removeAll();
            } else {
                this._graphciLayer = new GraphicLayer({
                    id: this.tempLayerId
                });
                this._map.add(this._graphciLayer);
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
            this._graphciLayer.removeAll();
        },
        /**
         *退出测量
         *@property destroy
         *@type {Object}
         */
        destroy: function() {
            this._map.remove(this._graphciLayer);
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
            var graphic = new Graphic({
                geometry: geom.extent.center,
                symbol: {
                    type: "text",
                    color: [47, 64, 80, 0.8],
                    text: res.toFixed(2) + " " + this._lengthUnitShortName,
                    xoffset: 3,
                    yoffset: 3,
                    font: { // autocast as Font
                        size: 14,
                        family: "sans-serif",
                        weight: "bold"
                    }
                }
            });
            this._graphciLayer.add(graphic);
        },
        drawGeo: function(event) {
            var paths = event.vertices;
            //remove existing graphic
            this._graphciLayer.removeAll();
            let __view = this._view;
            const graphic = new Graphic({
                geometry: {
                    type: "polyline",
                    paths: paths,
                    spatialReference: __view.spatialReference
                },
                symbol: {
                    type: "simple-line", // autocasts as new SimpleFillSymbol
                    color: [116, 142, 168, 0.4],
                    width: 4,
                    cap: "round",
                    join: "round"
                }
            });

            let polyline = graphic.geometry;
            // check if the polyline intersects itself.
            const intersectingSegment = getIntersectingSegment(polyline);
            if (intersectingSegment) {
                this._graphciLayer.addMany([graphic, intersectingSegment]);
            } else {
                this._graphciLayer.add(graphic);
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
                            type: "simple-line", // autocasts as new SimpleLineSymbol
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
                const existingLineFinalPoint = line.getPoint(0, line.paths[0].length -
                    1);

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
            var graphic = new Graphic({
                geometry: geom.centroid,
                symbol: {
                    type: "text",
                    color: [47, 64, 80, 0.8],
                    text: area.toFixed(2) + " " + this._areaUnitShortName,
                    xoffset: 3,
                    yoffset: 3,
                    font: { // autocast as Font
                        size: 14,
                        family: "sans-serif",
                        weight: "bold"
                    }
                }
            });
            this._graphciLayer.add(graphic);
        },
        drawGeo: function(event) {
            var vertices = event.vertices;
            //remove existing graphic
            this._graphciLayer.removeAll();

            var polygon = new Polygon({
                rings: vertices,
                spatialReference: this._view.spatialReference
            });

            var graphic = new Graphic({
                geometry: polygon,
                symbol: {
                    type: "simple-fill", // autocasts as SimpleFillSymbol
                    color: [116, 142, 168, 0.4],
                    style: "solid",
                    outline: { // autocasts as SimpleLineSymbol
                        color: [47, 64, 80, 0.82],
                        width: 2
                    }
                }
            });
            this._graphciLayer.add(graphic);
            var area = geometryEngine.geodesicArea(polygon, this._areaUnit);
            if (area < 0) {
                // simplify the polygon if needed and calculate the area again
                var simplifiedPolygon = geometryEngine.simplify(polygon);
                if (simplifiedPolygon) {
                    area = geometryEngine.geodesicArea(simplifiedPolygon, this._areaUnit);
                }
            }
            this.labelInfo(polygon, area);
        }
    });
});
