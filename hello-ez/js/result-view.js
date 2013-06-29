YUI.add('result-view', function (Y) {
    "use strict";

    Y.ResultView = Y.Base.create('resultView', Y.TemplateView, [], {
        events: {
            '#save-rest': {'click': '_saveRest'}
        },

        _saveRest: function (e) {
            this.fire('save', {
                'logFn': Y.bind(this.log, this)
            });
        },

        log: function (text) {
            this.get('container').one('pre').append(text + "<br>");
        },

        render: function () {
            this.get('container').setHTML(
                this.template({
                    'message': this.get('message').toJSON(),
                    'api': this.get('api').toJSON()
                })
            );
        }
    }, {

    });

}, '0.0.1');
