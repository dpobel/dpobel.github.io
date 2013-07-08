YUI.add('result-view', function (Y) {
    "use strict";

    Y.ResultView = Y.Base.create('resultView', Y.TemplateView, [], {
        events: {
            '.pure-menu-disabled a': {'click': '_disableClick'},
            '#save-rest': {'click': '_saveRest'}
        },

        initializer: function () {
            var api = this.get('api'),
                view = this;

            this.get('message').on('urlChange', function (e) {
                var url = api.get('restUrl') + e.newVal;

                view.get('container').all('.view-rest')
                    .setAttribute('href', url)
                    .removeAttribute('disabled');
            });
        },

        _saveRest: function (e) {
            if ( !e.target.get('disabled') ) {
                this.fire('save', {
                    'logFn': Y.bind(this.log, this)
                });
                e.target.set('disabled', 'disabled');
            }
        },

        log: function (text, append, level) {
            this.get('logger').log(text, append, level);
        },

        render: function () {
            this.get('container').setHTML(this._renderTemplate());
            this.get('logger').set(
                'root', this.get('container').one('.log-content')
            );
        },

        _renderTemplate: function () {
            return this.template({
                'breadcrumbs': this.get('breadcrumbs'),
                'message': this.get('message').toJSON(),
                'api': this.get('api').toJSON()
            });
        }
    }, {
        ATTRS: {
            logger: {
                value: new Y.Logger()
            }
        },

        VIEW_NAME: "Result"
    });

}, '0.0.1');
