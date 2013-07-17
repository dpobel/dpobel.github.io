YUI.add('capture-view', function (Y) {
    "use strict";

    var DEFAULT_PICTURE = 'img/smiley.png';

    Y.CaptureView = Y.Base.create('captureView', Y.TemplateView, [], {
        events: {
            '.pure-menu-disabled a': {'click': '_disableClick'},
            '#capture-button': {'click': '_capture'},
        },
        render: function () {
            var video;

            this.get('container').setHTML(this._renderTemplate());

            video = this.get('container').one('video');

            this.set('video', video);
            this.set('canvas', this.get('container').one('canvas'));

            video.on('playing', Y.bind('_enableCaptureButton', this));
            return this;
        },

        _renderTemplate: function () {
            var message = this.get('message').toJSON();

            if ( !message.picture ) {
                message.picture = DEFAULT_PICTURE;
            }

            return this.template({
                'message': message,
                'breadcrumbs': this.get('breadcrumbs')
            });
        },

        _play: function () {
            this.get('video').getDOMNode().play();
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
            var c = this.get('container'),
                video = this.get('video'),
                imgPreview = c.one('.picture-view'),
                elAnim = Y.Node.create('<img alt="" class="image-overlay">');

            elAnim.setAttribute('src', b64Img)
                .setStyle('width', video.getComputedStyle('width'))
                .setXY(video.getXY());
            Y.one('body').append(elAnim);
            elAnim.transition({
                left: imgPreview.getX() + 'px',
                top: imgPreview.getY() + 'px'
            }, function () {
                c.one('.image-result img')
                    .setAttribute('src', b64Img);
                c.one('#next-step-button')
                    .removeAttribute('disabled');
                elAnim.remove(true);
            });
        },

        handleWebcam: function () {
            var vendorURL,
                video = this.get('video').getDOMNode();

            if (navigator.mozGetUserMedia) {
                video.mozSrcObject = this.get('stream');
            } else {
                vendorURL = Y.config.win.URL || Y.config.win.webkitURL;
                video.src = vendorURL.createObjectURL(this.get('stream'));
            }
            this._play();
        },

        _enableCaptureButton: function () {
            var videoRegion = this.get('video').get('region'),
                // {top, bottom, left, right, width, height}
                button = this.get('container').one('#capture-button');

            button.removeClass('camera-overlay-hidden')
                .setStyles({
                    'width': videoRegion.width + 'px',
                    'height': videoRegion.height + 'px',
                    'lineHeight': videoRegion.height + 'px'
                });
        }
    }, {
        ATTRS: {
            video: {
                value: null
            },
            canvas: {
                value: null
            }
        },

        VIEW_NAME: "Capture"
    });

}, '0.0.1');
