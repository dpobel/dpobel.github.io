YUI.add('message-model', function (Y) {
    "use strict";

    Y.Message = Y.Base.create('message', Y.Model, [], {

    }, {
        ATTRS: {
            name: {value: null},
            picture: {value: null},
            mood: {value: null},
            lat: {value: null},
            lon: {value: null}
        }
    });

}, '0.0.1');
