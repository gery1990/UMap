Project_ParamConfig = {
    title: "鼎和保险地图平台",
    left: {
        visible: true,
        width: 0
    },
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
    center: {
        visible: true
    },
    logo: './themes/default/images/logo.png',
    logo_mini: './themes/default/images/logo_mini.png',

    /*底图设置*/
    baseLayer: {
        usedIndex: 0,
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
            zoom: 12
        }, {
            type: 'tile', //vector-矢量图 tile-切图 wmts-
            id: 'basemap-1',
            attribution: "蓝黑版",
            url: 'http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer',
            origin: [23.117, 113.275],
            fullextent: {xmin:20037507.0672,ymin:-20037507.0672,xmax:20102482.4102,ymax:-20036018.7354,spatialReference: {wkid: 102100}},
            tileSize: 256,
            minZoom: 0,
            maxZoom: 18,
            zoom: 12
        }, {
            type: 'tile', //vector-矢量图 tile-切图 wmts-
            id: 'basemap-2',
            attribution: "灰色版",
            url: 'http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetGray/MapServer',
            origin: [23.117, 113.275],
            fullextent: {xmin:20037507.0672,ymin:-20037507.0672,xmax:20102482.4102,ymax:-20036018.7354,spatialReference: {wkid: 102100}},
            tileSize: 256,
            minZoom: 0,
            maxZoom: 18,
            zoom: 12
        }]
    },
}
