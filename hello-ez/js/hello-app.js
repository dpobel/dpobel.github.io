YUI.add('hello-app', function (Y) {
    "use strict";

    var Message, Configuration,
        TemplateView, HomeView, ChecksView, CaptureView,
        DetailsView, ResultView;

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

    Configuration = Y.Base.create('configuration', Y.Model, [], {


    }, {
        ATTRS: {
            restUrl: {value: 'http://ezpublish5.loc/api/ezp/v2/'},
            login: {value: 'admin'},
            password: {value: 'ezpublish'}
        }
    });

    TemplateView = Y.Base.create('templateView', Y.View, [], {
        initializer: function () {
            var baseId = this.name.toLowerCase();
            this.template = Y.Handlebars.compile(
                Y.one('#' + baseId + '-tpl').getHTML()
            );
        },

        render: function () {
            this.get('container').setHTML(this.template());
            return this;
        }
    });

    HomeView = Y.Base.create('homeView', TemplateView, [], {
        events: {
        }
    }, {

    });

    ChecksView = Y.Base.create('checksView', TemplateView, [], {
        events: {

        },

        render: function () {
            this.get('container').setHTML(
                this.template({
                    'configuration': this.get('configuration').toJSON()
                })
            );
            return this;
        },

        setWebcamState: function (ok) {
            this._setCheckState('webcam', ok);
        },

        setGeolocationState: function (ok) {
            this._setCheckState('geoloc', ok);
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

    });

    CaptureView = Y.Base.create('captureView', TemplateView, [], {
        events: {
            '#capture-button': {'click': '_capture'},
        },
        render: function () {
            var video;

            this.get('container').setHTML(this.template(this.get('message').toJSON()));
            video = this.get('container').one('video');

            this.set('video', video);
            this.set('canvas', this.get('container').one('canvas'));

            video.on('playing', Y.bind('_enableCaptureButton', this));
            this._handleWebcam();
            video.getDOMNode().play();
            return this;
        },

        _capture: function () {
            var domCanvas, domVideo, b64Img;

            domCanvas = this.get('canvas').getDOMNode();
            domVideo = this.get('video').getDOMNode();

            domCanvas.height = domVideo.videoHeight;
            domCanvas.width = domVideo.videoWidth;
            domCanvas.getContext('2d').drawImage(domVideo, 0, 0);
            b64Img = domCanvas.toDataURL('image/jpeg', 0.9);

            this._setCapture(b64Img);
            this.fire('captured', {
                imageBase64: b64Img
            });
        },

        _setCapture: function (b64Img) {
            this.get('container').one('.image-result img')
                .setAttribute('src', b64Img)
                .addClass('is-capture');
            this.get('container').one('.image-result').addClass('image-result-captured');
            this.get('container')
                .one('#next-step-button')
                .removeAttribute('disabled');
        },

        _handleWebcam: function () {
            var vendorURL,
                video = this.get('video').getDOMNode();

            if (navigator.mozGetUserMedia) {
                video.mozSrcObject = this.get('stream');
            } else {
                vendorURL = Y.config.win.URL || Y.config.win.webkitURL;
                video.src = vendorURL.createObjectURL(this.get('stream'));
            }
            video.play();
        },

        _enableCaptureButton: function () {
            this.get('container')
                .one('#capture-button')
                .removeAttribute('disabled');
        }
    }, {
        ATTRS: {
            video: {
                value: null
            },
            canvas: {
                value: null
            }
        }
    });

    DetailsView = Y.Base.create('detailsView', TemplateView, [], {
        events: {
            '#another-picture': {'click': '_anotherPicture'}
        },

        render: function () {
            this.get('container').setHTML(this.template(this.get('message').toJSON()));
            return this;
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

    ResultView = Y.Base.create('resultView', TemplateView, [], {
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
                type: ChecksView
            },
            capture: {
                preserve: true,
                type: CaptureView
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
                this.get('message').set('picture', e.imageBase64);
            });

            this.on('*:capture', function (e) {
                this.get('message').setAttrs(e.message);
                this.navigate('#/capture');
            });
        },

        handleHome: function () {
            this.showView('home');
        },

        handleChecks: function () {
            this.showView('checks', {
                'stream': this.get('stream'),
                'configuration': this.get('configuration')
            }, {
                callback: function (view) {
                    console.log(this, view);
                    this._getWebcamAccess(view);
                    this._geolocate(view);
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
            });
        },

        handleDetails: function () {
            var message = this.get('message');
            if ( !message.get('picture') ) {
                this.navigate('#/capture');
            }
            this.showView('details', {'message': message});
        },

        handleResult: function () {
            this.showView('result');
        },

        _getWebcamAccess: function (checkView) {
            var that = this;

            navigator.getMedia({
                    video: true,
                    audio: false,
                },
                function (stream) {
                    that.set('stream', stream);
                    checkView.setWebcamState(true);
                },
                function (err) {
                    checkView.setWebcamState(false);
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
                    checkView.setGeolocationState(true);
                });
            } else {
                checkView.setGeolocationState(false);
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

            configuration: {
                value: new Configuration()
            },

            stream: {
                value: null
            }
        }
    });
}, '0.0.1');
