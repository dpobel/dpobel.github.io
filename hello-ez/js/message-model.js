YUI.add('message-model', function (Y) {
    "use strict";

    var TYPE_REMOTE_ID = "hello-ez-type-v1",
        TYPE_GROUP_IDENTIFIER = 'Hello eZ Demo Types',
        TYPE_GROUP_URI = 'content/typegroups', // TODO should be referenced in the root struct, report the issue
        LANG_CODE = 'eng-GB',

        typeGroupCreateStruct = {
            "ContentTypeGroupInput": {
                "identifier": TYPE_GROUP_IDENTIFIER
            }
        },
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
                        "_href": ""
                    },
                    "priority": "0",
                    "hidden": "false",
                    "sortField": "PATH",
                    "sortOrder": "ASC"
                },
                "Section": {
                    "_href": ""
                },
                "alwaysAvailable": "true",
                //"remoteId": "",
                "fields": {
                    "field": []
                }
            }
        };

    function logResponse(logFn, xhr) {
        if ( xhr.status ) {
            logFn("\n\nHTTP/1.1 " + xhr.status + " " + xhr.statusText + "\n", true);
            logFn(xhr.getAllResponseHeaders(), true);
        } else {
            logFn("\n\n<em>No response</em>", true);
        }
    }

    Y.Message = Y.Base.create('message', Y.Model, [], {

        sync: function (action, options, callback) {
            var api = options.api,
                log = options.logFn,
                that = this;

            if ( action === 'create' ) {
                if ( !this.get('rootStruct') ) {
                    api.root({
                        success: function (id, xhr, args) {
                            that._createMessage(options, callback);
                        },
                        failure: function (id, xhr, args) {
                            log("Fatal error", false, 'error');
                            callback("Fatal error (status " + xhr.status + ")");
                        }
                    });
                } else {
                    this._createMessage(options, callback);
                }
            }
        },

        url: function (options, callback) {
            var api = options.api,
                log = options.logFn,
                that = this;

            if ( !callback ) {
                callback = function (err, resp) { };
            }

            log("Getting the URL alias");
            api.GET(this.get('id'), {
                'Accept': 'application/vnd.ez.api.ContentInfo+json'
            }, {
                start: function (id, args) {
                    log("Reading the content info");
                    log(args.formattedRequest, false, 'request');
                },
                success: function (id, xhr, args) {
                    var struct = Y.JSON.parse(xhr.responseText);

                    api.GET(struct.Content.MainLocation._href, {}, {
                        start: function (id, args) {
                            log("Reading the main location");
                            log(args.formattedRequest, false, 'request');
                        },
                        success: function (id, xhr, args) {
                            // TODO should be referenced xhr.responseText => report issue
                            api.GET(struct.Content.MainLocation._href + '/urlaliases?custom=false',
                                {}, {
                                    start: function (id, args) {
                                        log("Reading the URL aliases of the main location");
                                        log(args.formattedRequest, false, 'request');
                                    },
                                    success: function (id, xhr, args) {
                                        var struct = Y.JSON.parse(xhr.responseText);

                                        api.GET(struct.UrlAliasRefList.UrlAlias[0]._href,
                                            {}, {
                                                start: function (id, args) {
                                                    log("Reading the main URL alias");
                                                    log(args.formattedRequest, false, 'request');
                                                },
                                                success: function (id, xhr, args) {
                                                    var struct = Y.JSON.parse(xhr.responseText);

                                                    that.set('url', struct.UrlAlias.path);
                                                    callback();
                                                },
                                                failure: function (id, xhr, args) {
                                                    log(
                                                        "Unable to read the main url alias (" + xhr.status + " " + xhr.statusText + ")",
                                                        false, 'error'
                                                    );
                                                    callback("Fatal error (status " + xhr.status + ")");
                                                },
                                                complete: function (id, xhr, args) {
                                                    logResponse(log, xhr);
                                                }
                                            }
                                        );

                                    },
                                    failure: function (id, xhr, args) {
                                        log(
                                            "Unable to read the url aliases (" + xhr.status + " " + xhr.statusText + ")",
                                            false, 'error'
                                        );
                                        callback("Fatal error (status " + xhr.status + ")");
                                    },
                                    complete: function (id, xhr, args) {
                                        logResponse(log, xhr);
                                    }
                                }
                            );
                        },
                        failure: function (id, xhr, args) {
                            log(
                                "Unable to read the location (" + xhr.status + " " + xhr.statusText + ")",
                                false, 'error'
                            );
                            callback("Fatal error (status " + xhr.status + ")");
                        },
                        complete: function (id, xhr, args) {
                            logResponse(log, xhr);
                        }
                    });
                },
                failure: function (id, xhr, args) {
                    log(
                        "Unable to read the content " + this.get('id') + " (" + xhr.status + " " + xhr.statusText + ")",
                        false, 'error'
                    );
                    callback("Fatal error (status " + xhr.status + ")");
                },
                complete: function (id, xhr, args) {
                    logResponse(log, xhr);
                }
            });
        },

        _createMessage: function (options, callback) {
            var api = options.api,
                log = options.logFn,
                that = this;

            api.GET(
                api.get('prefix') + TYPE_GROUP_URI + '?identifier=' + TYPE_GROUP_IDENTIFIER,
                {}, {
                    start: function (id, args) {
                        log("Checking whether the content type groups exists");
                        log(args.formattedRequest, false, 'request');
                    },
                    success: function (id, xhr, args) {
                        var struct = Y.JSON.parse(xhr.responseText);

                        that._checkType(struct, options, callback);
                    },
                    failure: function (id, xhr, args) {
                        if ( xhr.status === 404 ) {
                            that._createContentTypeGroup(options, callback);
                        } else if ( xhr.status === 0 ) {
                            log("No response available in the XHR object", false, 'notice');
                            log(
                                "Most likely, the content type group exists and" +
                                    " your browser has a bug in the handling of" +
                                    " 30X response after a CORS request...",
                                true
                            );
                            that._checkContentTypeGroupFromList(options, callback);
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

        _checkContentTypeGroupFromList: function(options, callback) {
            var api = options.api,
                log = options.logFn,
                that = this;

            api.GET(
                api.get('prefix') + TYPE_GROUP_URI,
                {}, {
                    start: function (id, args) {
                        log("Getting the content type groups from the full list of content type groups");
                        log(args.formattedRequest, false, 'request');
                    },
                    success: function (id, xhr, args) {
                        var struct = Y.JSON.parse(xhr.responseText);

                        struct.ContentTypeGroupList.ContentTypeGroup.forEach(function(contentTypeGroup) {
                            if ( contentTypeGroup.identifier === TYPE_GROUP_IDENTIFIER ) {
                                that._checkType(contentTypeGroup, options, callback);
                            }
                        });
                    },
                    failure: function (id, xhr, args) {
                        log(
                            "Unable to list the content type groups (" + xhr.status + " " + xhr.statusText + ")",
                            false, 'error'
                        );
                        callback("Unable to create the content type group (status " + xhr.status + ")");
                    },
                    complete: function (id, xhr, args) {
                        logResponse(log, xhr);
                    }
                }
            );


        },

        _createContentTypeGroup: function (options, callback) {
            var api = options.api,
                log = options.logFn,
                that = this;

            api.POST(
                api.get('prefix') + TYPE_GROUP_URI, {
                    'Content-Type': 'application/vnd.ez.api.ContentTypeGroupInput+json'
                }, typeGroupCreateStruct, {
                    start: function (id, args) {
                        log("Creating the content type groups");
                        log(args.formattedRequest, false, 'request');
                    },
                    success: function (id, xhr, args) {
                        var struct = Y.JSON.parse(xhr.responseText);

                        that._checkType(struct.ContentTypeGroup, options, callback);
                    },
                    failure: function (id, xhr, args) {
                        log(
                            "Unable to create the content type group (" + xhr.status + " " + xhr.statusText + ")",
                            false, 'error'
                        );
                        callback("Unable to create the content type group (status " + xhr.status + ")");
                    },
                    complete: function (id, xhr, args) {
                        logResponse(log, xhr);
                    }
                }
            );
        },

        _checkType: function(contentTypeGroup, options, callback) {
            var api = options.api,
                log = options.logFn,
                that = this;

            api.GET(
                api.get('rootStruct').Root.contentTypes._href + '?remoteId=' + TYPE_REMOTE_ID,
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
                            that._createContentType(contentTypeGroup, options, callback);
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

            createStruct = this._getContentCreateStruct(contentType, options.settings);
            api.POST(
                api.get('rootStruct').Root.content._href, {
                    'Content-Type': 'application/vnd.ez.api.ContentCreate+json',
                    'Accept': 'application/vnd.ez.api.Content+json'
                }, createStruct, {
                    start: function (id, args) {
                        log("Creating the draft");
                        log(args.formattedRequest, false, 'request');
                    },
                    success: function (id, xhr, args) {
                        var struct = Y.JSON.parse(xhr.responseText);

                        that.set('id', struct.Content._href);
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

        _getTypeCreateStruct: function (settings) {
            var struct = Y.clone(typeCreateStruct),
                lang = settings.languageCode, i,
                fields = struct.ContentTypeCreate.FieldDefinitions.FieldDefinition;

            struct.ContentTypeCreate.names.value[0]._languageCode = lang;
            struct.ContentTypeCreate.descriptions.value[0]._languageCode = lang;
            struct.ContentTypeCreate.mainLanguageCode = lang;

            for(i = 0; i != fields.length; i++) {
                fields[i].names.value[0]._languageCode = lang;
                fields[i].descriptions.value[0]._languageCode = lang;
            }
            return struct;
        },

        _getContentCreateStruct: function (contentType, settings) {
            var struct = Y.clone(contentCreateStruct),
                that = this,
                fields = typeCreateStruct.ContentTypeCreate.FieldDefinitions.FieldDefinition;

            struct.ContentCreate.mainLanguageCode = settings.languageCode;
            struct.ContentCreate.Section._href = settings.section;
            struct.ContentCreate.ContentType._href = contentType._href;
            struct.ContentCreate.LocationCreate.ParentLocation._href = settings.location;
            fields.forEach(function (value) {
                var fieldValue = that.get(value.identifier);

                if ( fieldValue ) {
                    struct.ContentCreate.fields.field.push({
                        'fieldDefinitionIdentifier': value.identifier,
                        'languageCode': settings.languageCode,
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

        _createContentType: function (contentTypeGroup, options, callback) {
            var api = options.api,
                log = options.logFn,
                that = this;

            api.POST(
                contentTypeGroup.ContentTypes._href + '?publish=true',
                {'Content-Type': 'application/vnd.ez.api.ContentTypeCreate+json'},
                this._getTypeCreateStruct(options.settings), {
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
            lon: {value: null},

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
            },

            url: {
                value: null
            },

            settings: {
                value: {}
            }
        }
    });

}, '0.0.1');
