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

        log: function (text, append, level) {
            this.get('logger').log(text, append, level);
        },

        render: function () {
            this.get('container').setHTML(
                this.template({
                    'message': this.get('message').toJSON(),
                    'api': this.get('api').toJSON()
                })
            );
            this.get('logger').set(
                'root', this.get('container').one('.log-content')
            );
        }
    }, {
        ATTRS: {
            logger: {
                value: new Y.Logger()
            }
        }
    });

}, '0.0.1');
