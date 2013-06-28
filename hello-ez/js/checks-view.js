YUI.add('checks-view', function (Y) {
    "use strict";

    Y.ChecksView = Y.Base.create('checksView', Y.TemplateView, [], {
        events: {
            '#capture-details-button': {'click': '_nextStep'}
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
            if ( ok ) {
                wc.removeClass('is-denied').addClass('is-granted');
            } else {
                wc.removeClass('is-granted').addClass('is-denied');
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
