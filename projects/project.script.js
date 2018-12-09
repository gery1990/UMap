/**
*基础配置
*@module config
*@class Base_ParamConfig
*@static
*/
var Base_ParamConfig = {
    /**
    *默认使用样式
    *@property defaultTheme
    *@type {String}
    */
    defaultTheme: "default",
    /**
    *默认项目
    *@property defaultProject
    *@type {String}
    */
    defaultProject: "default",
    /**
    *arcgis javascript 应用
    *@type {String}
    */
    arcgisAPI: "arcgisapi"
};

/*加载项目脚本与样式文件*/
(function () {
    var scriptTags = [];
    var url = location.href;
    if (url.indexOf("index.html") == -1) {
        scriptTags.push("<link rel='stylesheet' type='text/css' href='../"+Base_ParamConfig.arcgisAPI+"/library/4.9/esri/css/main.css'/>");
        scriptTags.push("<script src='../"+Base_ParamConfig.arcgisAPI+"/library/4.9/init.js'></script>");
    }
    scriptTags.push("<script src='projects/" + Base_ParamConfig.defaultProject + "/project." + Base_ParamConfig.defaultProject + ".config.js'></script>");
    for (var i = 0, len = scriptTags.length; i < len; i++) {
        document.write(scriptTags[i]);
    }
})();
