YUI.add('home-view', function (Y) {
    "use strict";

    Y.HomeView = Y.Base.create('homeView', Y.View, [], {

        addFooter: function () {
            var c = this.get('container');
            if ( !c.one('footer') ) {
                this.get('container').append(
                    Y.Handlebars.compile('{{> footer}}')()
                );
            }
        }

    }, {
        VIEW_NAME: "Introduction"
    });

}, '0.0.1');
