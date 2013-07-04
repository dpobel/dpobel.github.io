YUI.add('hello-ez-partials', function (Y) {
    "use strict";

    Y.all('.hello-ez-partial').each(function() {
        Y.Handlebars.registerPartial(
            this.getData('partial-name'),
            this.getHTML()
        );
    });

}, '0.0.1');

