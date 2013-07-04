YUI.add('detail-view', function (Y) {
    "use strict";

    var L = Y.Lang,

        DEFAULT_PICTURE = 'img/smiley.png',

        BING_MAP_KEY = 'AqIpjTxk7nDvUqZagpzdNX73I1QRT0EVmto4oITUOd-ALPKcl3G4CKzq_r8zh9Cd',
        LAT_OFFSET = 0.025, LON_OFFSET = 0.020,
        INFOBOX_TPL = '<img src="{image}" alt="You!" style="display: block; margin: 0 auto; max-height: 190px;">';

    Y.DetailsView = Y.Base.create('detailsView', Y.TemplateView, [], {
        events: {
            '.pure-menu-disabled a': {'click': '_disableClick'},
            '#another-picture': {'click': '_anotherPicture'},
            '#name': {'keyup': '_handleResultButtonState'},
            '#result-step': {'click': '_handleResultButton'}
        },

        render: function () {
            this.get('container').setHTML(this._renderTemplate());
            this._showMap();
            return this;
        },

        _renderTemplate: function () {
            return this.template({
                'breadcrumbs': this.get('breadcrumbs'),
                'message': this.get('message').toJSON()
            });
        },

        _handleResultButton: function (e) {
            var c = this.get('container'),
                twitter;

            if ( e.target.hasAttribute('disabled') ) {
                e.halt();
            } else {
                twitter = c.one('#twitter').get('value');
                if ( twitter === '' && twitter.indexOf('@') !== 0 ) {
                    twitter = '@' + twitter;
                }
                this.fire('details', {
                    'message': {
                        'name': c.one('#name').get('value'),
                        'mood': c.one('#mood').get('value'),
                        'twitter': twitter
                    }
                });
            }
        },

        _handleResultButtonState: function (e) {
            var result = this.get('container').one('#result-step');

            if ( e.target.get('value') === '' ) {
                result.setAttribute('disabled', 'disabled');
            } else {
                result.removeAttribute('disabled');
            }
        },

        /* global Microsoft */
        _showMap: function () {
            var msg = this.get('message'),
                mapEl = this.get('container').one('#map-location'),
                map, info, loc, center,
                hasBing = (typeof Microsoft !== 'undefined');

            if ( hasBing && msg.get('lat') && msg.get('lon') && mapEl ) {
                loc = new Microsoft.Maps.Location(
                    msg.get('lat'), msg.get('lon')
                );
                center = new Microsoft.Maps.Location(
                    msg.get('lat') + LAT_OFFSET,
                    msg.get('lon') + LON_OFFSET
                );
                map = new Microsoft.Maps.Map(
                    mapEl.getDOMNode(), {
                        credentials: BING_MAP_KEY,
                        mapTypeId: Microsoft.Maps.MapTypeId.road,
                        center: center,
                        zoom: 12,
                        showMapTypeSelector: false
                    }
                );
                info = new Microsoft.Maps.Infobox(loc, {
                    visible: true,
                    height: 200,
                    showCloseButton: false,
                    description: L.sub(INFOBOX_TPL, {
                        image: msg.get('picture') ? msg.get('picture') : DEFAULT_PICTURE
                    })
                });
                map.entities.push(info);
            }
        },

        _anotherPicture: function (e) {
            var c = this.get('container');

            e.preventDefault();
            this.fire('capture', {
                'message': {
                    'name': c.one('#name').get('value'),
                    'twitter': c.one('#twitter').get('value'),
                    'mood': c.one('#mood').get('value')
                }
            });
        }
    }, {
        VIEW_NAME: "Details"
    });


}, '0.0.1');
