YUI.add('checks-view', function (Y) {
    "use strict";

    Y.ChecksView = Y.Base.create('checksView', Y.TemplateView, [], {
        events: {
            '#capture-details-button': {'click': '_nextStep'},
            'input[type=text], input[type=password]': {'keyup': '_checkRestApi'}
        },

        initializer: function () {
            this.on(['webcamChange', 'geolocChange'], function (e) {
                this._setCheckState(e.attrName, e.newVal);
            });
            this.on('ezpublishChange', function (e) {
                this._setCheckState(e.attrName, e.newVal);
                this.get('container').one('#capture-details-button').set('disabled', false);
            });
        },

        render: function () {
            this.get('container').setHTML(
                this.template({
                    'configuration': this.get('configuration')
                })
            );
            return this;
        },

        _checkRestApi: function (e) {
            var c = this.get('container');

            this.set('ezpublish', undefined);
            this.fire('checkRestApi', {
                'view': this,
                'api': {
                    'login': c.one('#login').get('value'),
                    'password': c.one('#password').get('value'),
                    'restUrl': c.one('#resturl').get('value'),
                    'prefix': c.one('#prefix').get('value')
                }
            });
        },

        _nextStep: function (e) {
            if ( !e.target.get('disabled') ) {
                if ( this.get('webcam') ) {
                    this.fire('capture');
                } else {
                    this.fire('captured', {next: true});
                }
            }
        },

        _setCheckState: function (id, ok) {
            var wc = this.get('container').one('#' + id + '-check');
            if ( ok === true ) {
                wc.removeClass('is-denied').addClass('is-granted');
            } else if ( ok === false ) {
                wc.removeClass('is-granted').addClass('is-denied');
            } else {
                wc.removeClass('is-granted').removeClass('is-denied');
            }
        }
    }, {
        ATTRS: {
            webcam: {
                value: false
            },

            geoloc: {
                value: false
            },

            ezpublish: {
                value: false
            }
        }
    });
}, '0.0.1');
