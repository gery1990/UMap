//类似 require的config属性，将复杂的url地址映射为简单名称
var Default_Paths = {
    "UMAP": './js/UMAP.js',
    "core/init":"./core/core.init.js",
    "core/pool":"./core/core.pool.js",
    "core/baseobject":"./core/core.baseobject.js",
    "core/application":"./core/core.application.js",
    "core/map":"./core/core.map.js",
    "core/multimap":"./core/core.multimap.js",
    "layout/alert":"./layout/layout.alert.js",
    "layout/base":"./layout/layout.base.js",
    "layout/centerpanel":"./layout/layout.centerpanel.js",
    "layout/leftmenu":"./layout/layout.leftmenu.js"
}

var Default_Shims = {
    // "leaflet/contextmenu": { deps: ['css!../../../library/leaflet/leaflet.contextmenu/leaflet.contextmenu.css'] },
    //
    // "leaflet/polylineDecorator": { deps: ['leaflet'] },
    // "proj4": { deps: ['leaflet'] },
    // "leaflet/proj4leaflet": { deps: ['leaflet'] },
}

var R=(function(){
  var mapScript=function(scripts){
    let arry=[];
    if(!(scripts instanceof Array)){
      scripts=scripts.split(",");
    }
    scripts.forEach(function(key){
      if(Default_Paths.hasOwnProperty(key)){
        arry.push(Default_Paths[key]);
      }else{
        arry.push(key);
      }
    });
    return arry;
  }
  return {
    require:function(deps,callFun){
        require(mapScript(deps),callFun);
    },
    define:function(){
        var scripts;
        var className="";
        var callFun=function(){};
        if(arguments.length>3){
            className=arguments[0];
            scripts=mapScript(arguments[1]);
            callFun=arguments[2];
        }else{
            scripts=mapScript(arguments[0]);
            callFun=arguments[1];
        }
        define(className,scripts,callFun);
    }
  }
}());

//*****************************加载后执行***********************************//
R.require(["esri/config","core/init"], function (esriConfig) {
    //设置esri api config 的默认配置
    esriConfig.request.maxUrlLength=4000;
    esriConfig.request.proxyUrl = "../proxy.jsp";
});
//*****************************加载后执行***********************************//
