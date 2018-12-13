/**
*alert 信息提示类
*@module layout
*@class UMAP.Layout.CenterPanel
*@constructor initialize
*@extends UMAP.Common
*/
R.define([], function () {
    var initAlertForm = function(options){
        var titel="信息",
            msg="暂无详细内容",
            type="success"; //success-成功,info-信息,warning-警告,error-错误
        if(options.title){
            title=options.title;
        }
        if(options.msg){
            msg=options.msg;
        }
        if(options.type){
            type=options.type;
        }
        if(toastr){
            toastr.options = Project_ParamConfig.toastrOptions;
            var $toast = toastr[type](msg, title);
            if ($toast.find('#okBtn').length) {
                $toast.delegate('#okBtn', 'click', function () {
                    $toast.remove();
                });
            }
            if ($toast.find('#surpriseBtn').length) {
                $toast.delegate('#surpriseBtn', 'click', function () {
                });
            }
        }
    }
    return {
        success:function(title,msg){
            initAlertForm({title:title,msg:msg,type:"success"});
        },
        info:function(title,msg){
            initAlertForm({title:(title==""?'信息':title),msg:msg,type:"info"});
        },
        warning:function(title,msg){
            initAlertForm({title:(title==""?'警告':title),msg:msg,type:"warning"});
        },
        error:function(title,msg){
            initAlertForm({title:(title==""?'错误':title),msg:msg,type:"error"});
        }

    };
});
