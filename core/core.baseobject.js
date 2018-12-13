/**
*基类
*@module core/baseobject
*@class UMAP.BaseObject
*@constructor initialize
*/
R.define([], function (L) {
    UMAP.Core.BaseObject = UMAP.Class.extend({

        /**
        *对象id
        *
        *@property id
        *@type {String}
        */
        id: null,

        initialize: function () {

        },

        /**
        *获取当前对象类型
        *
        *@method getType
        *@return {String} 当前对象类型
        */
        getType: function () {
            return typeof this;
        }
    });

    return UMAP.Core.BaseObject;
});
