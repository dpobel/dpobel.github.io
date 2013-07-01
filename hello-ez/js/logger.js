YUI.add('logger', function (Y) {
    "use strict";

    var FULL_FORMAT = '<li class={level}><code>{message}</code></li>',
        APPEND_FORMAT = '<code>{message}</code>',
        DEFAULT_LEVEL = 'info',
        L = Y.Lang;

    Y.Logger = Y.Base.create('logger', Y.Base, [], {

        log: function (message, append, level) {
            var root = this.get('root'),
                format = FULL_FORMAT;

            if ( !root ) {
                return;
            }
            if ( !level ) {
                level = DEFAULT_LEVEL;
            }
            if ( append ) {
                format = APPEND_FORMAT;
                root = root.one('li:last-child');
            }

            root.append(
                L.sub(format, {
                    message: message,
                    level: level
                })
            );

        }

    }, {
        ATTRS: {
            root: {
                value: null
            }
        }
    });

}, '0.0.1');
