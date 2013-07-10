YUI.add('home-view', function (Y) {
    "use strict";

    Y.HomeView = Y.Base.create('homeView', Y.View, [], {

        addFooter: function () {
            var template = Y.Handlebars.compile('{{> footer}}');
            this.get('container').append(template());
        }

    }, {
        VIEW_NAME: "Introduction"
    });

}, '0.0.1');
