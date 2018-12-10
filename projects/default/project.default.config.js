Project_ParamConfig = {
    title: "鼎和保险地图平台",
    right: {
        visible: true,
        width: 0
    },
    top: {
        visible: true,
        height: 0
    },
    bottom: {
        visible: true,
        height: 0
    },
    logo: './themes/default/images/logo.png',
    logo_mini: './themes/default/images/logo_mini.png',

    /*底图设置*/
    baseLayer: {
        defaultBaseMapIndex:0,
        layers: [{
            type: 'tile', //vector-矢量图 tile-切图 wmts-
            id: 'basemap-0',
            attribution: "彩色版",
            url: 'http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineCommunity/MapServer',
            origin: [12091122, 3863154],
            fullextent: {xmin:7585735,ymin:225705,xmax:15673338,ymax:7113975,spatialReference: {wkid: 102100}},
            tileSize: 256,
            minZoom: 0,
            maxZoom: 18,
            zoom: 12,
            thumbnailUrl:'./themes/default/images/caise.jpg'//缩略图
        }, {
            type: 'tile', //vector-矢量图 tile-切图 wmts-
            id: 'basemap-1',
            attribution: "蓝黑版",
            url: 'http://map.geoq.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer',
            origin: [12091122, 3863154],
            fullextent: {xmin:7585735,ymin:225705,xmax:15673338,ymax:7113975,spatialReference: {wkid: 102100}},
            tileSize: 256,
            minZoom: 0,
            maxZoom: 18,
            zoom: 12,
            thumbnailUrl:'./themes/default/images/lanhei.jpg'//缩略图
        }, {
            type: 'tile', //vector-矢量图 tile-切图 wmts-
            id: 'basemap-2',
            attribution: "灰色版",
            url: 'http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetGray/MapServer',
            origin: [12091122, 3863154],
            fullextent: {xmin:7585735,ymin:225705,xmax:15673338,ymax:7113975,spatialReference: {wkid: 102100}},
            tileSize: 256,
            minZoom: 0,
            maxZoom: 18,
            zoom: 12,
            thumbnailUrl:'./themes/default/images/huise.jpg'//缩略图
        }]
    },
    viewWidgets:[
        {
            id:'BasemapGallery',
            description:'底图切换',
            visible:true,
            position:'bottom-right'
        },
        {
            id:'LegendWidget',
            description:'图例',
            visible:true,
            position:'bottom-left'
        },
        {
            id:'LayerList',
            description:'图层控制',
            visible:true,
            position:'bottom-left'
        },
        {
            id:'Home',
            description:'返回初始界面',
            visible:true,
            position:'top-left'
        },
        {
            id:'SketchViewModel',
            description:'绘图',
            visible:true,
            position:'top-left'
        }
    ],
    /*服务地址配置*/
    defaultCoreServiceUrl:'http://localhost/UMap/',//基础后台服务地址

    /*菜单配置读取*/
    menuRequsetUrl:"json/menu-data.json",

    /*toastr警告控件配置*/
    toastrOptions:{
        closeButton: true,
        debug: false,
        progressBar: true,
        positionClass: "toast-bottom-right",
        onclick: null,
        showDuration: "400",
        hideDuration: "1000",
        imeOut: "5000",
        extendedTimeOut:"1000",
        showEasing: "swing",
        hideEasing: "linear",
        showMethod: "fadeIn",
        hideMethod: "fadeOut"
    }
}
