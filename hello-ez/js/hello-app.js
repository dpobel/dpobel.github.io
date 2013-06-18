YUI.add('hello-app', function (Y) {
    "use strict";

    var Message, TemplateView, HomeView, CaptureView, DetailsView, ResultView;

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
            var that = this;

            navigator.getMedia({
                    video: true,
                    audio: false
                },
                function (stream) {
                    var vendorURL,
                        video = that.get('video').getDOMNode();

                    if (navigator.mozGetUserMedia) {
                        video.mozSrcObject = stream;
                    } else {
                        vendorURL = Y.config.win.URL || Y.config.win.webkitURL;
                        video.src = vendorURL.createObjectURL(stream);
                    }
                    video.play();
                },
                function (err) {
                    console.log("An error occured!", err);
                }
            );
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

        handleCapture: function () {
            this.showView('capture', {'message': this.get('message')});
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
        }
    }, {
        ATTRS: {
            routes: {
                value: [
                    {path: '/', callback: 'handleHome'},
                    {path: '/capture', callback: 'handleCapture'},
                    {path: '/details', callback: 'handleDetails'},
                    {path: '/result', callback: 'handleResult'}
                ]
            },
            message: {
                value: new Message()
            }
        }
    });
}, '0.0.1');
