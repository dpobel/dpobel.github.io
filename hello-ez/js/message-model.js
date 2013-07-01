YUI.add('message-model', function (Y) {
    "use strict";

    var TYPE_REMOTE_ID = "hello-ez-type-v1",
        LANG_CODE = 'eng-GB', // TODO allow to change this in the conf.
        typeCreateStruct = {
            "ContentTypeCreate": {
                "identifier": "hello-ez-demo-message",
                "names": {
                    "value": [{
                        "_languageCode": LANG_CODE,
                        "#text": "Hello eZ Demo Message"
                    }]
                },
                "descriptions": {
                    "value": [{
                        "_languageCode": LANG_CODE,
                        "#text": "Content type use by the Hello eZ! application, see http://dpobel.github.io/hello-ez/"
                    }]
                },
                "remoteId": TYPE_REMOTE_ID,
                "urlAliasSchema":"<name>",
                "nameSchema":"<name>",
                "isContainer":"false",
                "mainLanguageCode":LANG_CODE,
                "defaultAlwaysAvailable":"true",
                "defaultSortField":"PATH",
                "defaultSortOrder":"ASC",
                "FieldDefinitions": {
                    "FieldDefinition": [{
                        "identifier": "name",
                        "fieldType": "ezstring",
                        "names": {
                            "value": [{
                                "_languageCode": LANG_CODE,
                                "#text": "Name"
                            }]
                        },
                        "descriptions": {
                            "value": [{
                                "_languageCode": LANG_CODE,
                                "#text": ""
                            }]
                        },
                        "fieldGroup": "content",
                        "position": "1",
                        "isTranslatable": "false",
                        "isRequired": "true",
                        "isInfoCollector": "false",
                        "isSearchable": "false",
                        "defaultValue": "Name"
                    }, {
                        "identifier": "twitter",
                        "fieldType": "ezstring",
                        "names": {
                            "value": [{
                                "_languageCode": LANG_CODE,
                                "#text": "Twitter account"
                            }]
                        },
                        "descriptions": {
                            "value": [{
                                "_languageCode": LANG_CODE,
                                "#text": ""
                            }]
                        },
                        "fieldGroup": "content",
                        "position": "2",
                        "isTranslatable": "false",
                        "isRequired": "false",
                        "isInfoCollector": "false",
                        "isSearchable": "false",
                        "defaultValue": ""
                    }, {
                        "identifier": "image",
                        "fieldType": "ezimage",
                        "names": {
                            "value": [{
                                "_languageCode": LANG_CODE,
                                "#text": "Image"
                            }]
                        },
                        "descriptions": {
                            "value": [{
                                "_languageCode": LANG_CODE,
                                "#text": ""
                            }]
                        },
                        "fieldGroup": "content",
                        "position": "3",
                        "isTranslatable": "false",
                        "isRequired": "false",
                        "isInfoCollector": "false",
                        "isSearchable": "false",
                        "defaultValue": null
                    }, {
                        "identifier": "mood",
                        "fieldType": "eztext",
                        "names": {
                            "value": [{
                                "_languageCode": LANG_CODE,
                                "#text": "Mood"
                            }]
                        },
                        "descriptions": {
                            "value": [{
                                "_languageCode": LANG_CODE,
                                "#text": ""
                            }]
                        },
                        "fieldGroup": "content",
                        "position": "4",
                        "isTranslatable": "false",
                        "isRequired": "false",
                        "isInfoCollector": "false",
                        "isSearchable": "false",
                        "defaultValue": ""
                    }, {
                        "identifier": "location",
                        "fieldType": "ezgmaplocation",
                        "names": {
                            "value": [{
                                "_languageCode": LANG_CODE,
                                "#text": "Location"
                            }]
                        },
                        "descriptions": {
                            "value": [{
                                "_languageCode": LANG_CODE,
                                "#text": ""
                            }]
                        },
                        "fieldGroup": "content",
                        "position": "5",
                        "isTranslatable": "false",
                        "isRequired": "false",
                        "isInfoCollector": "false",
                        "isSearchable": "false",
                        "defaultValue": null
                    }]
                }
            }
        },
        contentCreateStruct = {
            "ContentCreate": {
                "ContentType": {
                    "_href": ""
                },
                "mainLanguageCode": LANG_CODE,
                "LocationCreate": {
                    "ParentLocation": {
                        "_href": "/content/locations/1/2" // TODO allow to change this in the conf.
                    },
                    "priority": "0",
                    "hidden": "false",
                    "sortField": "PATH",
                    "sortOrder": "ASC"
                },
                "Section": {
                    "_href": "/content/sections/1" // TODO allow to change this in the conf.
                },
                "alwaysAvailable": "true",
                //"remoteId": "",
                "fields": {
                    "field": []
                }
            }
        };

    function logResponse(logFn, xhr) {
        logFn("\n\nHTTP/1.1 " + xhr.status + " " + xhr.statusText + "\n", true);
        logFn(xhr.getAllResponseHeaders(), true);
    }

    Y.Message = Y.Base.create('message', Y.Model, [], {

        sync: function (action, options, callback) {
            if ( action === 'create' ) {
                this._createMessage(options, callback);
            }
        },

        _createMessage: function (options, callback) {
            var api = options.api,
                log = options.logFn,
                that = this;

            api.GET(
                '/content/types?remoteId=' + TYPE_REMOTE_ID,
                {}, {
                    start: function (id, args) {
                        log("Checking whether the content type exists");
                        log(args.formattedRequest, false, 'request');
                    },
                    success: function (id, xhr, args) {
                        var struct = Y.JSON.parse(xhr.responseText);

                        that._createDraft(
                            struct.ContentTypeInfoList.ContentType[0],
                            options,
                            callback
                        );
                    },
                    failure: function (id, xhr, args) {
                        if ( xhr.status === 404 ) {
                            that._createContentType(options, callback);
                        } else {
                            log("Fatal error", false, 'error');
                            callback("Fatal error (status " + xhr.status + ")");
                        }
                    },
                    complete: function (id, xhr, args) {
                        logResponse(log, xhr);
                    }
                }
            );
        },

        _createDraft: function (contentType, options, callback) {
            var api = options.api,
                log = options.logFn,
                that = this,
                createStruct;

            createStruct = this._getContentCreateStruct(contentType);
            api.POST(
                '/content/objects', {
                    'Content-Type': 'application/vnd.ez.api.ContentCreate+json',
                    'Accept': 'application/vnd.ez.api.Content+json'
                }, createStruct, {
                    start: function (id, args) {
                        log("Creating the draft");
                        log(args.formattedRequest, false, 'request');
                    },
                    success: function (id, xhr, args) {
                        that._publishDraft(Y.JSON.parse(xhr.responseText), options, callback);
                    },
                    failure: function (id, xhr, args) {
                        log(
                            "Unable to create the draft (" + xhr.status + " " + xhr.statusText + ")",
                            false, 'error'
                        );
                        callback("Unable to create the draft (status " + xhr.status + ")");
                    },
                    complete: function (id, xhr, args) {
                        logResponse(log, xhr);
                    }
                }
            );
        },

        _getContentCreateStruct: function (contentType) {
            var struct = Y.clone(contentCreateStruct),
                that = this,
                fields = typeCreateStruct.ContentTypeCreate.FieldDefinitions.FieldDefinition;

            struct.ContentCreate.ContentType._href = contentType._href;
            fields.forEach(function (value) {
                var fieldValue = that.get(value.identifier);

                if ( fieldValue ) {
                    struct.ContentCreate.fields.field.push({
                        'fieldDefinitionIdentifier': value.identifier,
                        'languageCode': LANG_CODE,
                        'fieldValue': fieldValue
                    });
                }
            });
            return struct;
        },

        _publishDraft: function (draft, options, callback) {
            var api = options.api,
                log = options.logFn;

            api.PUBLISH(
                draft.Content.CurrentVersion.Version._href,
                {}, null, {
                    start: function (id, args) {
                        log("Publishing the draft");
                        log(args.formattedRequest, false, 'request');
                    },
                    success: function (id, xhr, args) {
                        callback();
                    },
                    failure: function (id, xhr, args) {
                        log(
                            "Unable to publish the draft (" + xhr.status + " " + xhr.statusText + ")",
                            false, 'error'
                        );
                        callback("Unable to publish the draft (status " + xhr.status + ")");
                    },
                    complete: function (id, xhr, args) {
                        logResponse(log, xhr);
                    }

                }
            );
        },

        _createContentType: function (options, callback) {
            var api = options.api,
                log = options.logFn,
                that = this;

            api.POST(
                '/content/typegroups/1/types?publish=true',
                {'Content-Type': 'application/vnd.ez.api.ContentTypeCreate+json'},
                typeCreateStruct, {
                    start: function (id, args) {
                        log("Creating the content type");
                        log(args.formattedRequest, false, 'request');
                    },
                    success: function (id, xhr, args) {
                        var struct = Y.JSON.parse(xhr.responseText);

                        that._createDraft(struct.ContentType, options, callback);
                    },
                    failure: function (id, xhr, args) {
                        log(
                            "Unable to create the type (" + xhr.status + " " + xhr.statusText + ")",
                            false, 'error'
                        );
                        callback("Unable to create the type (status " + xhr.status + ")");
                    },
                    complete: function (id, xhr, args) {
                        logResponse(log, xhr);
                    }
                }
            );
        }

    }, {
        ATTRS: {
            name: {value: null},
            picture: {value: null},
            mood: {value: null},
            lat: {value: null},
            lon: {value: null}

            location: {
                readOnly: true,
                getter: function () {
                    if ( this.get('lat') === null ) {
                        return null;
                    }
                    return {
                        'latitude': this.get('lat'),
                        'longitude': this.get('lon'),
                        'address': ''
                    };
                }
            },

            image: {
                readOnly: true,
                getter: function () {
                    var b64;

                    if ( this.get('picture') === null ) {
                        return null;
                    }
                    b64 = this.get('picture').replace(/^.*base64,/, '');
                    return {
                        'data': b64,
                        'fileName': this.get('name') + '.jpg',
                        'fileSize': Y.Base64.decode(b64).length
                    };
                }

            }
        }
    });

}, '0.0.1');
