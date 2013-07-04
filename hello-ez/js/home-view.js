YUI.add('home-view', function (Y) {
    "use strict";

    Y.HomeView = Y.Base.create('homeView', Y.TemplateView, [], {

        _renderTemplate: function () {
            return this.template({
                'breadcrumbs': this.get('breadcrumbs')
            });
        }
    }, {
        VIEW_NAME: "Introduction"
    });

}, '0.0.1');
