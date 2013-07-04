YUI.add('template-view', function (Y) {
    "use strict";

    Y.TemplateView = Y.Base.create('templateView', Y.View, [], {
        events: {
            '.pure-menu-disabled a': {'click': '_disableClick'}
        },

        initializer: function () {
            var baseId = this.name.toLowerCase();
            this.template = Y.Handlebars.compile(
                Y.one('#' + baseId + '-tpl').getHTML()
            );
        },

        render: function () {
            this.get('container').setHTML(this._renderTemplate());
            return this;
        },

        _renderTemplate: function () {
            return this.template();
        },

        _disableClick: function(e) {
            e.halt();
        }
    });

}, '0.0.1');

