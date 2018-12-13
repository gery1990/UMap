/**
*center布局类
*@module layout
*@class UMAP.Layout.CenterPanel
*@constructor initialize
*@extends UMAP.Layout
*/
R.define([
    "layout/baseobject"
], function () {
    UMAP.Layout.CenterPanel = UMAP.Layout.BaseObject.extend({
        /**
        *界面标签
        *@property body
        *@type {String}
        */
        tempHtml:'<div id="mapone" class="col-sm-6 mapone"></div>'
            +'<div id="maptwo" class="col-sm-6 maptwo"></div>'
            +'<div id="mapthree" class="col-sm-6 mapthree"></div>'
            +'<div id="mapfour" class="col-sm-6 mapfour"></div>',
        /**
        *初始化
        *@method initialize
        */
        initialize: function () {
            UMAP.Layout.BaseObject.prototype.initialize.call(this);
            this.id = "centerPanel";
            this.body = $("#centerpanel");
            this.body.html(this.tempHtml);
        }
    });
    return UMAP.Layout.CenterPanel;
});
