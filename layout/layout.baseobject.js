/**
*layout布局基类
*@module layout
*@class UMAP.Layout
*@constructor initialize
*@extends UMAP.BaseObject
*/
R.define([
    "core/baseobject"
], function (L) {
    UMAP.Layout.BaseObject = UMAP.Core.BaseObject.extend({
        /**
        *类标识
        *@property id
        *@type {String}
        */
        id: null,
        /**
        *宽度
        *@property width
        *@type {Number}
        */
        width: 0,
        /**
        *高度
        *@property height
        *@type {Number}
        */
        height: 0,
        /**
        *是否可见
        *@property visible
        *@type {Bool
        *@default true
        */
        visible: true,
        /**
        *界面主体
        *@property body
        *@type {Object}
        */
        body: null,
        /**
        *初始化
        *@method initialize
        */
        initialize: function() {
            UMAP.Core.BaseObject.prototype.initialize.call(this);
        },
        /**
        *设置可见性
        *@method setVisible
        *@param visible {bool} 可见性
        */
        setVisible:function(visible) {
            this.visible = visible;
            if (visible)
                this.body.css("display", "none");
            else
                this.body.css("display", "");
        }

    });

    return UMAP.Layout.BaseObject;
});
