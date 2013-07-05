YUI.add('hello-app', function (Y) {
    "use strict";

    Y.HelloApp = Y.Base.create('helloApp', Y.App, [], {
        views: {
            home: {
                type: Y.HomeView
            },
            checks: {
                type: Y.ChecksView,
                parent: 'home'
            },
            capture: {
                preserve: true,
                type: Y.CaptureView,
                parent: 'checks'
            },
            details: {
                type: Y.DetailsView,
                parent: 'capture'
            },
            result: {
                type: Y.ResultView,
                parent: 'details'
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

            this.on('*:details', function (e) {
                this.get('message').setAttrs(e.message);
            });

            this.on('*:save', function (e) {
                this.get('message').save({
                    logFn: e.logFn,
                    settings: this.get('contentSettings'),
                    api: this.get('api')
                });
            });
        },

        handleHome: function () {
            this.showView('home', {
                'breadcrumbs': this._breadcrumbs('home')
            });
        },

        handleChecks: function () {
            this.showView('checks', {
                'breadcrumbs': this._breadcrumbs('checks'),
                'stream': this.get('stream'),
                'configuration': this.get('api').toJSON(),
                'settings': this.get('contentSettings'),
                'webcam': null,
                'geoloc': null,
                'ezpublish': null,
                'location': null,
                'section': null
            }, {
                callback: function (view) {
                    this._getWebcamAccess(view, function () {
                        this._geolocate(view, function () {
                            this._checkRestApi(view);
                        });
                    });
                },
                'updated': true
            });

        },

        handleCapture: function () {
            var stream = this.get('stream');

            if ( !stream ) {
                this.navigate('#/checks');
            }
            this.showView('capture', {
                'breadcrumbs': this._breadcrumbs('capture'),
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
            this.showView('details', {
                'breadcrumbs': this._breadcrumbs('details'),
                'message': this.get('message')
            });
        },

        handleResult: function () {
            if ( !this.get('message').get('name') ) {
                this.navigate('#/details');
            }
            this.showView('result', {
                'breadcrumbs': this._breadcrumbs('result'),
                'message': this.get('message'),
                'api': this.get('api')
            });
        },

        _checkRestApi: function(checkView) {
            var that = this,
                handlers = {
                    success: function () {
                        checkView.set('ezpublish', true);
                        that._checkLocation(checkView);
                    },
                    failure: function () {
                        checkView.set('ezpublish', false);
                        checkView.set('location', false);
                        checkView.set('section', false);
                    }
                };
            this.get('api').root(handlers);
        },

        _checkLocation: function (checkView) {
            var that = this,
                settings = this.get('contentSettings'),
                handlers = {
                    success: function () {
                        checkView.set('location', true);
                        that._checkSection(checkView);
                    },
                    failure: function () {
                        checkView.set('location', false);
                        that._checkSection(checkView);
                    }
                };
            this.get('api').GET(settings.location, {}, handlers);
        },

        _checkSection: function (checkView) {
            var settings = this.get('contentSettings'),
                handlers = {
                    success: function () {
                        checkView.set('section', true);
                    },
                    failure: function () {
                        checkView.set('section', false);
                    }
                };
            this.get('api').GET(settings.section, {}, handlers);
        },

        _getWebcamAccess: function (checkView, callback) {
            var that = this;

            if ( navigator.getMedia ) {
                navigator.getMedia({
                        video: true,
                        audio: false,
                    },
                    function (stream) {
                        that.set('stream', stream);
                        checkView.set('webcam', true);
                        callback.apply(that);
                    },
                    function (err) {
                        checkView.set('webcam', false);
                        if ( that.get('stream') ) {
                            that.get('stream').stop();
                            that.set('stream', null);
                        }
                        callback.apply(that);
                    }
                );
            } else {
                checkView.set('webcam', false);
                callback.apply(this);
            }
        },

        _geolocate: function (checkView, callback) {
            var that = this;

            if ( "geolocation" in navigator ) {
                navigator.geolocation.getCurrentPosition(function (position) {
                    that.get('message').setAttrs({
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    });
                    checkView.set('geoloc', true);
                    callback.apply(that);
                },
                function (err) {
                    checkView.set('geoloc', false);
                    callback.apply(that);
                });
            } else {
                checkView.set('geoloc', false);
                callback.apply(that);
            }
        },

        _breadcrumbs: function (viewId) {
            var path = [], enabled = true,
                k, viewInfo, i = 1;

            for (k in this.views) {
                if ( this.views.hasOwnProperty(k) ) {
                    viewInfo = this.views[k];
                    path.push({
                        step: i++,
                        name: viewInfo.type.VIEW_NAME,
                        class: viewInfo.type.NAME.toLowerCase(),
                        uri: '#/' + k,
                        enabled: enabled,
                        active: (k === viewId)
                    });
                    if ( enabled && k === viewId ) {
                        enabled = false;
                    }
                }
            }
            console.log(path);
            return path;

        }
    }, {
        ATTRS: {
            routes: {
                value: [
                    {path: '/', callback: 'handleHome'},
                    {path: '/home', callback: 'handleHome'},
                    {path: '/checks', callback: 'handleChecks'},
                    {path: '/capture', callback: 'handleCapture'},
                    {path: '/details', callback: 'handleDetails'},
                    {path: '/result', callback: 'handleResult'}
                ]
            },
            message: {
                value: new Y.Message()
            },

            api: {
                value: new Y.RestClient({
                    restUrl: 'http://ezpublish5.loc',
                    prefix: '/api/ezp/v2/',
                    login: 'admin',
                    password: 'ezpublish'
                })
            },

            contentSettings: {
                value: {}
            },

            stream: {
                value: null
            }
        }
    });
}, '0.0.1');
