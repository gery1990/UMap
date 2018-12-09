/*
*基类
*/
define("core/panelbase", ["leaflet"], function (L) {


    L.DCI.PanelBase = L.Class.extend({

        id: null,

        initialize: function () {

        },

        show: function () { },

        iniEvent: function () { },

        remove: function () { }

    });

    /*弹出面板基类
    *width number 定义面板宽度
    *title string 定义面板标题
    *button array [{ name: '', clsName: ''}]定义按钮
    *show func 显示面板
    *iniEvent func 用于定义事件监听
    *click func 面板单击事件的回调，返回$target，e
    *remove func 关闭面板时执行
    *content func 用于定义面板内容（return string）
    *footer func 用于定义面板脚部内容（return string）
    *refresh func 用于重置面板内容
    *setContent func
    *getContainer func
    *getPanel func
    */

    L.DCI.Window = L.DCI.PanelBase.extend({

        id: 'window-panel',

        width: 600,

        title: '面板',

        //button: [
        //    { name: '', clsName: '',__cl:'' } data-__cl =""
        //],

        //menubtn: [
        //    { icon: 'icon-close2', cls: 'close wp_close',__cl:'__wp_close' }
        //],

        initialize: function () {
            L.DCI.PanelBase.prototype.initialize.call(this);
            if (!this.menubtn) this.menubtn = [];
            if (!this.button) this.button = [];

            this.menubtn.unshift({ icon: 'icon-close2', cls: 'close wp_close', __cl: '__wp_close' });
            this.contentStr = null;
        },
        show: function () {
            if (!this._hasShow) {
                this._hasShow = true;
                this._Ui();
                this._iniEvent();
                this.iniEvent();
            }
        },
        _iniEvent: function () {
            this.panel.on('click', $.proxy(this._click, this));
        },
        iniEvent: function () {

        },
        _click: function (e) {
            var $target = $(e.target);
            var __cl = $target.data('__cl');
            if (__cl == '__wp_close') {
                this._remove();
            } else {
                this.click($target, e, __cl);
            }
        },
        click: function ($elem, e) {

        },
        remove: function () {

        },
        _remove: function () {
            this.remove();
            if (this.panel) this.panel.remove();
            this.panel = null;
            this._hasShow = false;
        },

        content: function () {
            return '';
        },

        setContent: function (str) {
            this.panel.find('#' + this.id + '-content').html(str);
        },

        footer: function () {
            var html = [];
            html.push('<div class="' + this.id + '-footer-btn window-panel-footer-btn">');
            for (var i = this.button.length - 1; i >= 0 ; i--) {
                var __cl = this.button[i].__cl || '__default'
                html.push('<button type="button" class="btn ' + this.button[i].clsName + '" data-__cl="' + __cl + '">' + this.button[i].name + '</button>');
            }
            html.push('</div>');
            return html.join('');
        },

        getContainer: function () {
            return {
                panel: this.panel,
                content: this.panel.find('#' + this.id + '-content'),
                footer: this.panel.find('#' + this.id + '-footer')
            };
        },

        getPanel: function () {
            return this.panel;
        },

        refresh: function (func) {
            if (this.panel) {
                var html = this._Ui2();
                L.DomUtil.setPosition(this.panel[0], L.point(0, 0));
                this.panel.css({
                    "width": this.width + 'px',
                    "margin-left": '-' + this.width / 2 + 'px'
                });
                this.panel.html(html);

                var height = this.panel.outerHeight();
                this.panel.css({
                    'margin-top': '-' + height / 2 + 'px'
                });

                if (func) func.call(this);
            }
        },

        _Ui: function () {
            if (!this.panel) {
                var html = this._Ui2();
                this.panel = $('<div id="' + this.id + '-panel" class = "' + this.id + '-panel window-panel" style="width:' + this.width + 'px;margin-left:-' + this.width / 2 + 'px;"></div>');
                this.panel.html(html);

                $('body').append(this.panel);

                var height = this.panel.outerHeight();
                this.panel.css({
                    'margin-top': '-' + height / 2 + 'px',
                    'visibility': 'visible'
                });
            } else {
            }
        },

        _Ui2: function () {
            var html = [];

            html.push('<div class="' + this.id + '-body" style="background:white">');
            /*header*/
            if (this.title) {
                html.push('<div id="' + this.id + '-header" class="' + this.id + '-header window-panel-header" data-drag="drag" data-panel = "' + this.id + '-panel">');
                html.push(this.title);
                html.push('<div style="float:right;">');
                for (var i = this.menubtn.length - 1; i >= 0 ; i--) {
                    var item = this.menubtn[i];
                    var cls = item.icon + ' ' + item.cls;
                    var __cl = item.__cl || '__default'
                    html.push('<span class="' + cls + ' window-panel-menubtn" data-__cl="' + __cl + '" style="float:none;"></span>');
                }
                html.push('</div>');
                html.push('</div>');
            }

            /*content*/
            html.push('<div id="' + this.id + '-content"  class="' + this.id + '-content">');
            var ct = this.contentStr ? this.contentStr : this.content();
            html.push(ct);
            html.push('</div>');

            /*footer*/
            if (this.button.length != 0) {
                html.push('<div id="' + this.id + '-footer"  class="' + this.id + '-footer">');
                html.push(this.footer());
                html.push('</div>');
            }

            html.push('</div>');

            return html.join(' ');
        }
    });

    L.dci.window = function () {
        return new L.DCI.Window();
    }

    /*用户功能向导*/
    L.DCI.UserGuide = L.DCI.Window.extend({

        id: 'userguide',

        title: '功能简介',

        width: '450',

        button: [
            { name: '关闭', clsName: 'userguide-close' }
        ],

        initialize: function (options) {
            L.DCI.Window.prototype.initialize.call(this);

            this.id = options.id;
            this.title = options.name;
            this.contentStr2 = options.content;
            this.contentStr3 = options.ztn;

            this.options = options;
            //this.contral = this.info();          
        },

        guide: function () {
            var lo = window.localStorage;
            var _value = lo.getItem(this.options.id);
            return parseInt(_value === null ? 1 : _value);
        },

        banGuide: function () {
            var lo = window.localStorage;
            lo.setItem(this.options.id, 0);
        },

        show: function () {
            if (this.guide()) {
                var p = $("#" + this.id + "-panel");
                if (p.length == 0) {
                    L.DCI.Window.prototype.show.call(this);
                    this.panel.addClass('userguide-panel');
                }
            }
        },

        click: function ($elem) {
            if ($elem.hasClass('userguide-close')) {
                var el = $("#user-guide");
                var check = el.prop("checked");
                if (check) this.banGuide();
                this._remove();
            }
        },

        //info: function () {
        //    var menu = L.dci.menu().getMenuData();
        //    for (var i = 0, item; item = menu[i++];) {
        //        if (item["name"] == "工具") continue;
        //        for (var m = 0, item2; item2 = item["menu"][m++];) {
        //            if (item2.id == this.options.id) return item2;
        //        }
        //    }
        //},

        content: function () {

            var html = [];
            html.push('<div class="container" style="width:auto">');

            html.push('<div class="row">');;
            html.push('<div class="col-xs-12">');
            html.push('<p style="font-weight: 700;font-size: 15px;padding-top: 5px;">' + this.contentStr3 + '：</p>');
            html.push('</div>');
            html.push('</div>')

            html.push('<div class="row">');;
            html.push('<div class="col-xs-12">');
            html.push('<p style="text-indent:2em;">' + this.contentStr2 + '</p>');
            html.push('</div>');
            html.push('</div>');

            html.push('<div class="row">');
            html.push('<div class="col-xs-12">');
            html.push('<p style="text-align: center;"><input id="user-guide" name="user-guide" type="checkbox" value="" style="margin-right:5px" />不再提示</p>');
            html.push('</div>');
            html.push('</div>');

            html.push('</div>');
            return html.join(' ');
        }
    });

    L.dci.userguide = function (options) {
        return new L.DCI.UserGuide(options);
    }

});