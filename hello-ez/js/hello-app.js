YUI.add('hello-app', function (Y) {
    "use strict";

    var Message,
        HomeView, ResultView;

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
                type: Y.DetailsView
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
