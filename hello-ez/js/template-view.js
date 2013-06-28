YUI.add('template-view', function (Y) {
    "use strict";

    Y.TemplateView = Y.Base.create('templateView', Y.View, [], {
        initializer: function () {
            var baseId = this.name.toLowerCase();
            this.template = Y.Handlebars.compile(
                Y.one('#' + baseId + '-tpl').getHTML()
            );
        },

        render: function () {
            this.get('container').setHTML(this.template());
            return this;
        }
    });

}, '0.0.1');

