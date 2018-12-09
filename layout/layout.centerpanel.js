/**
*center布局类
*@module layout
*@class UMAP.Layout.CenterPanel
*@constructor initialize
*@extends UMAP.Layout
*/
R.define([
    "layout/base"
], function () {
    UMAP.Layout.CenterPanel = UMAP.Layout.extend({
        /**
        *界面标签
        *@property body
        *@type {String}
        */
        tempHtml:'<div id="map-main" class="col-sm-6 map-main"></div>'
            +'<div id="map-tow" class="col-sm-6 map-tow"></div>'
            +'<div id="map-three" class="col-sm-6 map-three"></div>'
            +'<div id="map-four" class="col-sm-6 map-four"></div>',
        /**
        *初始化
        *@method initialize
        */
        initialize: function () {
            UMAP.Layout.prototype.initialize.call(this);
            this.id = "centerPanel";
            this.body = $("#centerpanel");
            this.body.html(this.tempHtml);
        }
    });
    return UMAP.Layout.CenterPanel;
});
