YUI.add('hello-app', function (Y) {
    "use strict";

    var L = Y.Lang,

        BING_MAP_KEY = 'AqIpjTxk7nDvUqZagpzdNX73I1QRT0EVmto4oITUOd-ALPKcl3G4CKzq_r8zh9Cd',
        LAT_OFFSET = 0.025, LON_OFFSET = 0.020,
        INFOBOX_TPL = '<img src="{image}" alt="You!" style="display: block; margin: 0 auto; max-height: 190px;">',
        DEFAULT_PICTURE = 'img/smiley.png',

        Message,
        HomeView, DetailsView, ResultView;

    Message = Y.Base.create('message', Y.Model, [], {

    }, {
        ATTRS: {
            name: {value: null},
            picture: {value: null},
            mood: {value: null},
            lat: {value: null},
            lon: {value: null}
        }
    });

    HomeView = Y.Base.create('homeView', Y.TemplateView, [], {
        events: {
        }
    }, {

    });

    DetailsView = Y.Base.create('detailsView', Y.TemplateView, [], {
        events: {
            '#another-picture': {'click': '_anotherPicture'}
        },

        render: function () {
            this.get('container').setHTML(this.template(this.get('message').toJSON()));
            this._showMap();
            return this;
        },

        /* global Microsoft */
        _showMap: function () {
            var msg = this.get('message'),
                mapEl = this.get('container').one('#map-location'),
                map, info, loc, center;

            if ( msg.get('lat') && msg.get('lon') && mapEl ) {
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

    });

    ResultView = Y.Base.create('resultView', Y.TemplateView, [], {
        events: {
        }
    }, {

    });

    Y.HelloApp = Y.Base.create('helloApp', Y.App, [], {
        views: {
            home: {
                type: HomeView
            },
            checks: {
                preserve: true,
                type: Y.ChecksView
            },
            capture: {
                preserve: true,
                type: Y.CaptureView
            },
            details: {
                type: DetailsView
            },
            result: {
                type: ResultView,
                parent: 'home'
            }
        },

        initializer: function () {
            this.on('*:captured', function (e) {
                if ( e.imageBase64 ) {
                    this.get('message').set('picture', e.imageBase64);
                }
                if ( e.next ) {
                    this.navigate('#/details');
                }
            });

            this.on('*:capture', function (e) {
                if ( e.message ) {
                    this.get('message').setAttrs(e.message);
                }
                this.navigate('#/capture');
            });
        },

        handleHome: function () {
            this.showView('home');
        },

        handleChecks: function () {
            this.showView('checks', {
                'stream': this.get('stream'),
                'configuration': this.get('api').toJSON()
            }, {
                callback: function (view) {
                    this._getWebcamAccess(view);
                    this._geolocate(view);
                    this._checkRestApi(view);
                }
            });

        },

        handleCapture: function () {
            var stream = this.get('stream');

            if ( !stream ) {
                this.navigate('#/checks');
            }
            this.showView('capture', {
                'message': this.get('message'),
                'stream': this.get('stream')
            }, {
                update: true,
                callback: function (view) {
                    view.handleWebcam();
                }
            });
        },

        handleDetails: function () {
            this.showView('details', {'message': this.get('message')});
        },

        handleResult: function () {
            this.showView('result');
        },

        _checkRestApi: function(checkView) {
            this.get('api').GET('/', {}, function (xhr) {
                checkView.set('ezpublish', true);
            },
            function (xhr) {
                checkView.set('ezpublish', false);
            });
        },

        _getWebcamAccess: function (checkView) {
            var that = this;

            navigator.getMedia({
                    video: true,
                    audio: false,
                },
                function (stream) {
                    that.set('stream', stream);
                    checkView.set('webcam', true);
                },
                function (err) {
                    checkView.set('webcam', false);
                    if ( that.get('stream') ) {
                        that.get('stream').stop();
                        that.set('stream', null);
                    }
                }
            );
        },

        _geolocate: function (checkView) {
            var that = this;

            if ( "geolocation" in navigator ) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    that.get('message').setAttrs({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    });
                    checkView.set('geoloc', true);
                },
                function (err) {
                    checkView.set('geoloc', false);
                });
            } else {
                checkView.set('geoloc', false);
            }
        }
    }, {
        ATTRS: {
            routes: {
                value: [
                    {path: '/', callback: 'handleHome'},
                    {path: '/checks', callback: 'handleChecks'},
                    {path: '/capture', callback: 'handleCapture'},
                    {path: '/details', callback: 'handleDetails'},
                    {path: '/result', callback: 'handleResult'}
                ]
            },
            message: {
                value: new Message()
            },

            api: {
                value: new Y.RestClient({
                    restUrl: 'http://ezpublish5.loc/api/ezp/v2/',
                    login: 'admin',
                    password: 'ezpublish'
                })
            },

            stream: {
                value: null
            }
        }
    });
}, '0.0.1');
