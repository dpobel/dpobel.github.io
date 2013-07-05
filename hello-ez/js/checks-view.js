YUI.add('checks-view', function (Y) {
    "use strict";

    Y.ChecksView = Y.Base.create('checksView', Y.TemplateView, [], {
        events: {
            '.pure-menu-disabled a': {'click': '_disableClick'},
            '#capture-details-button': {'click': '_nextStep'}
        },

        initializer: function () {
            this.on([
                    'webcamChange', 'geolocChange',
                    'ezpublishChange', 'locationChange',
                    'sectionChange'
                ], function (e) {
                    this._setCheckState(e.attrName, e.newVal);
                }
            );
            this.on('sectionChange', function (e) {
                this.get('container').one('#capture-details-button').set('disabled', false);
            });
        },

        _renderTemplate: function () {
            var settings = this.get('settings');

            return this.template({
                'breadcrumbs': this.get('breadcrumbs'),
                'configuration': this.get('configuration'),
                'location': settings.location,
                'section': settings.section
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
            },

            location: {
                value: false
            },

            section: {
                value: false
            }
        },

        VIEW_NAME: "System checks"
    });
}, '0.0.1');
