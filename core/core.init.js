R.define(["UMAP","core/namespace","core/application"],function(U){
    $(document).ready(function(){
        document.title = Project_ParamConfig.title;
        $("#project_logo_img").attr('src',Project_ParamConfig.logo);
        $("#project_logo_img_mini").attr('src',Project_ParamConfig.logo_mini);

        //初始化Application对象
        UMAP.app = new UMAP.Core.Application(Project_ParamConfig);
        UMAP.app.init();
    })
})
