/*********************************************************
 * Copyright (C) 2015 VMware, Inc. All rights reserved.
 *********************************************************/
/*
 *  This file include the following test suites
 *  - create WMKS
 *  - Gerneral API
 *  - Events related API
 *  - setOption
 *
 */
describe("webmks basic", function() {

    var wmksContainerId = "wmksContainer";

    beforeEach(function() {
        jasmine.getFixtures().fixturesPath = 'base/view/';
        loadFixtures("index.html");
    });

    //create wmks with different options
    describe("create WMKS", function() {

        var wmks;

        afterEach(function() {
            if (wmks) wmks.destroy();
        });

        //create wmks with default options
        it("basic create WMKS", function() {
            wmks = WMKS.createWMKS(wmksContainerId, {});
            expect(wmks).not.toBe(null);
        });

        //create with options rescale:true, changeResolution:true
        //this is also the default option
        it("create with options rescale:true, changeResolution:true", function() {
            wmks = WMKS.createWMKS(wmksContainerId, {});
            var wmksOpt = wmks.wmksData.options;
            expect(wmksOpt).not.toBe(null);
            expect(wmksOpt.rescale).toBe(true);
            expect(wmksOpt.changeResolution).toBe(true);
        });

        it("create with options rescale:true, changeResolution:false", function() {
            var options = {
                rescale: true,
                changeResolution: false
            };
            wmks = WMKS.createWMKS(wmksContainerId, options);
            var wmksOpt = wmks.wmksData.options;
            expect(wmksOpt).not.toBe(null);
            expect(wmksOpt.rescale).toBe(true);
            expect(wmksOpt.changeResolution).toBe(false);
        });

        it("create with options rescale:false, changeResolution:true", function() {
            var options = {
                rescale: false,
                changeResolution: true
            };
            wmks = WMKS.createWMKS(wmksContainerId, options);
            var wmksOpt = wmks.wmksData.options;
            expect(wmksOpt).not.toBe(null);
            expect(wmksOpt.rescale).toBe(false);
            expect(wmksOpt.changeResolution).toBe(true);
        });

        it("create with options rescale:false, changeResolution:false", function() {
            var options = {
                rescale: false,
                changeResolution: false
            };
            wmks = WMKS.createWMKS(wmksContainerId, options);
            var wmksOpt = wmks.wmksData.options;
            expect(wmksOpt).not.toBe(null);
            expect(wmksOpt.rescale).toBe(false);
            expect(wmksOpt.changeResolution).toBe(false);
        });

        it("create with options audioEncodeType", function() {
            var options = {
                audioEncodeType: WMKS.CONST.AudioEncodeType.VORBIS
            };
            wmks = WMKS.createWMKS(wmksContainerId, options);
            var wmksOpt = wmks.wmksData.options;
            expect(wmksOpt).not.toBe(null);
            expect(wmksOpt.audioEncodeType).toBe(WMKS.CONST.AudioEncodeType.VORBIS);
            expect(wmksOpt.enableVorbisAudioClips).toBe(true);
        });
    });

    describe("Gerneral API", function() {
        var wmks;

        //version info would be added in build
        xit("WMKS Version info", function() {
            //before create
            expect(WMKS.version).toEqual("1.0.0");
            wmks = WMKS.createWMKS(wmksContainerId, {});
            var version = wmks.getVersion();
            expect(version).toEqual("1.0.0");
        });

        it("WMKS getConnectionState", function() {
            //here just simply test before connect
            wmks = WMKS.createWMKS(wmksContainerId, {});
            var state = wmks.getConnectionState();
            expect(state).toEqual("disconnected");
        });
    });

    describe("Events related API", function() {

        var wmks;

        var handler = function(event, data) {};

        beforeEach(function() {
            wmks = WMKS.createWMKS(wmksContainerId, {});
        });
        afterEach(function() {
            if (wmks) wmks.destroy();
        });

        //test register
        it("register event with incorrect parameters", function() {
            var eventType = WMKS.CONST.Events.CONNECTION_STATE_CHANGE;

            wmks.register(null, handler);
            expect(Object.keys(wmks.eventHandlers).length).toBe(0);
            wmks.register(eventType, null);
            expect(Object.keys(wmks.eventHandlers).length).toBe(0);
        });

        it("register event with correct parameters", function() {
            var eventType = WMKS.CONST.Events.CONNECTION_STATE_CHANGE;
            expect(Object.keys(wmks.eventHandlers).length).toBe(0);
            wmks.register(eventType, handler);
            expect(Object.keys(wmks.eventHandlers).length).toBe(1);
        });

        it("register CONNECTION_STATE_CHANGE event connecting", function() {
            var eventType = WMKS.CONST.Events.CONNECTION_STATE_CHANGE;
            expect(Object.keys(wmks.eventHandlers).length).toBe(0);
            var vncDecoder = wmks.wmksData._vncDecoder;
            var handlers = {
                conHandler: function(event, data) {
                    expect(data.state).toBe("connecting");
                    expect(data.vvc).toBe(vncDecoder.vvc);
                    expect(data.vvcSession).toBe(vncDecoder.vvcSession);
                }
            };
            spyOn(handlers, "conHandler").and.callThrough();
            wmks.register(eventType, handlers.conHandler);

            vncDecoder.options.onConnecting.apply(vncDecoder, [vncDecoder.vvc, vncDecoder.vvcSession]);
            var cnt = handlers.conHandler.calls.count();
            expect(cnt).toBe(1);
        });

        it("register CONNECTION_STATE_CHANGE event connected", function() {
            var eventType = WMKS.CONST.Events.CONNECTION_STATE_CHANGE;
            expect(Object.keys(wmks.eventHandlers).length).toBe(0);
            var vncDecoder = wmks.wmksData._vncDecoder;
            var handlers = {
                conHandler: function(event, data) {
                    expect(data.state).toBe("connected");
                }
            };
            spyOn(handlers, "conHandler").and.callThrough();
            wmks.register(eventType, handlers.conHandler);

            vncDecoder.options.onConnected.apply(vncDecoder);
            var cnt = handlers.conHandler.calls.count();
            expect(cnt).toBe(1);
        });

        it("register CONNECTION_STATE_CHANGE event disconnected", function() {
            var eventType = WMKS.CONST.Events.CONNECTION_STATE_CHANGE;
            expect(Object.keys(wmks.eventHandlers).length).toBe(0);
            var vncDecoder = wmks.wmksData._vncDecoder;
            var reason = "no reason",
                code = 100;
            var handlers = {
                conHandler: function(event, data) {
                    expect(data.state).toBe("disconnected");
                    expect(data.reason).toBe(reason);
                    expect(data.code).toBe(code);
                }
            };
            spyOn(handlers, "conHandler").and.callThrough();
            wmks.register(eventType, handlers.conHandler);

            vncDecoder.options.onDisconnected.apply(vncDecoder, [reason, code]);
            var cnt = handlers.conHandler.calls.count();
            expect(cnt).toBe(1);
        });

        it("register FULL_SCREEN_CHANGE event", function() {
            var eventType = WMKS.CONST.Events.FULL_SCREEN_CHANGE;
            expect(Object.keys(wmks.eventHandlers).length).toBe(0);
            wmks.register(eventType, handler);
            expect(Object.keys(wmks.eventHandlers).length).toBe(1);
            var handlers = wmks.eventHandlers[eventType];
            expect(handlers.length).toBe(1);
            expect(handlers[0]).toBe(handler);
        });

        it("register REMOTE_SCREEN_SIZE_CHANGE event", function() {
            var eventType = WMKS.CONST.Events.REMOTE_SCREEN_SIZE_CHANGE;
            expect(Object.keys(wmks.eventHandlers).length).toBe(0);
            var vncDecoder = wmks.wmksData._vncDecoder;
            var width = 800,
                height = 600;
            var handlers = {
                handler: function(event, data) {
                    expect(data.width).toBe(width);
                    expect(data.height).toBe(height);
                }
            };
            spyOn(handlers, "handler").and.callThrough();
            wmks.register(eventType, handlers.handler);

            vncDecoder.options.onNewDesktopSize.apply(vncDecoder, [width, height]);
            var cnt = handlers.handler.calls.count();
            expect(cnt).toBe(1);
        });

        it("register ERROR event authenticationFailed", function() {
            var eventType = WMKS.CONST.Events.ERROR;
            expect(Object.keys(wmks.eventHandlers).length).toBe(0);
            var vncDecoder = wmks.wmksData._vncDecoder;
            var handlers = {
                handler: function(event, data) {
                    expect(data.errorType).toBe(WMKS.CONST.ErrorType.AUTHENTICATION_FAILED);
                }
            };
            spyOn(handlers, "handler").and.callThrough();
            wmks.register(eventType, handlers.handler);

            vncDecoder.options.onAuthenticationFailed.apply(vncDecoder);
            var cnt = handlers.handler.calls.count();
            expect(cnt).toBe(1);
        });

        it("register ERROR event websocket error", function() {
            var eventType = WMKS.CONST.Events.ERROR;
            expect(Object.keys(wmks.eventHandlers).length).toBe(0);
            var vncDecoder = wmks.wmksData._vncDecoder;
            var handlers = {
                handler: function(event, data) {
                    expect(data.errorType).toBe(WMKS.CONST.ErrorType.WEBSOCKET_ERROR);
                }
            };
            spyOn(handlers, "handler").and.callThrough();
            wmks.register(eventType, handlers.handler);

            vncDecoder.options.onError.apply(vncDecoder, {});
            var cnt = handlers.handler.calls.count();
            expect(cnt).toBe(1);
        });

        it("register ERROR event protocol error", function() {
            var eventType = WMKS.CONST.Events.ERROR;
            expect(Object.keys(wmks.eventHandlers).length).toBe(0);
            var vncDecoder = wmks.wmksData._vncDecoder;
            var handlers = {
                handler: function(event, data) {
                    expect(data.errorType).toBe(WMKS.CONST.ErrorType.PROTOCOL_ERROR);
                }
            };
            spyOn(handlers, "handler").and.callThrough();
            wmks.register(eventType, handlers.handler);

            vncDecoder.options.onProtocolError.apply(vncDecoder);
            var cnt = handlers.handler.calls.count();
            expect(cnt).toBe(1);
        });

        it("register KEYBOARD_LEDS_CHANGE event", function() {
            var eventType = WMKS.CONST.Events.KEYBOARD_LEDS_CHANGE;
            expect(Object.keys(wmks.eventHandlers).length).toBe(0);
            var vncDecoder = wmks.wmksData._vncDecoder;
            var handlers = {
                handler: function(event, data) {
                    expect(data).toBe(4);
                }
            };
            spyOn(handlers, "handler").and.callThrough();
            wmks.register(eventType, handlers.handler);

            vncDecoder.options.onKeyboardLEDsChanged.apply(vncDecoder, [4]);
            var cnt = handlers.handler.calls.count();
            expect(cnt).toBe(1);
        });

        it("register HEARTBEAT event", function() {
            var eventType = WMKS.CONST.Events.HEARTBEAT;
            expect(Object.keys(wmks.eventHandlers).length).toBe(0);
            var vncDecoder = wmks.wmksData._vncDecoder;
            var interval = 100;
            var handlers = {
                handler: function(event, data) {
                    expect(data).toBe(interval);
                }
            };
            spyOn(handlers, "handler").and.callThrough();
            wmks.register(eventType, handlers.handler);

            vncDecoder.options.onHeartbeat.apply(vncDecoder, [interval]);
            var cnt = handlers.handler.calls.count();
            expect(cnt).toBe(1);
        });

        it("register AUDIO event", function() {
            var eventType = WMKS.CONST.Events.AUDIO;
            expect(Object.keys(wmks.eventHandlers).length).toBe(0);
            var vncDecoder = wmks.wmksData._vncDecoder;
            var audioInfo = {
                data: {}
            };
            var handlers = {
                handler: function(event, data) {
                    expect(data.data).toBeDefined();
                }
            };
            spyOn(handlers, "handler").and.callThrough();
            wmks.register(eventType, handlers.handler);

            vncDecoder.options.onAudio.apply(vncDecoder, [audioInfo]);
            var cnt = handlers.handler.calls.count();
            expect(cnt).toBe(1);
        });

        it("register COPY event", function() {
            var eventType = WMKS.CONST.Events.COPY;
            expect(Object.keys(wmks.eventHandlers).length).toBe(0);
            var vncDecoder = wmks.wmksData._vncDecoder;
            var str = "copydata";
            var handlers = {
                handler: function(event, data) {
                    expect(data).toBe(str);
                }
            };
            spyOn(handlers, "handler").and.callThrough();
            wmks.register(eventType, handlers.handler);

            vncDecoder.options.onCopy.apply(vncDecoder, [str]);
            var cnt = handlers.handler.calls.count();
            expect(cnt).toBe(1);
        });


        //test unregister
        it("unregister event with full parameters", function() {
            var eventType = WMKS.CONST.Events.CONNECTION_STATE_CHANGE;
            var handler = function(event, data) {};
            wmks.register(eventType, handler);
            expect(Object.keys(wmks.eventHandlers).length).toBe(1);
            wmks.unregister(eventType, handler);
            expect(Object.keys(wmks.eventHandlers).length).toBe(0);
        });

        it("unregister event with one parameters", function() {
            var eventType = WMKS.CONST.Events.CONNECTION_STATE_CHANGE;
            var handler = function(event, data) {};
            wmks.register(eventType, handler);
            expect(Object.keys(wmks.eventHandlers).length).toBe(1);
            wmks.unregister(eventType);
            expect(Object.keys(wmks.eventHandlers).length).toBe(0);
        });

        it("unregister event with none parameter", function() {
            var eventType = WMKS.CONST.Events.CONNECTION_STATE_CHANGE;
            var handler = function(event, data) {};
            wmks.register(eventType, handler);
            expect(Object.keys(wmks.eventHandlers).length).toBe(1);
            wmks.unregister();
            expect(Object.keys(wmks.eventHandlers).length).toBe(0);
        });
    });

    describe("setOption", function() {

        var wmks;
        beforeEach(function() {
            wmks = WMKS.createWMKS("wmksContainer", {});
        });

        afterEach(function() {
            if (wmks)
                wmks.destroy();
        });

        it("simple setOption and do nothing else", function() {
            expect(wmks.wmksData.options.reverseScrollY).toBe(false);
            wmks.setOption("reverseScrollY", true);
            expect(wmks.wmksData.options.reverseScrollY).toBe(true);
        });

        it("setOption rescale", function() {
            spyOn(wmks.wmksData, "rescaleOrResize").and.callThrough();
            expect(wmks.wmksData.options.rescale).toBe(true);
            wmks.setOption("rescale", false);
            var spy = wmks.wmksData.rescaleOrResize.calls;
            expect(spy.count()).toBe(1);
            expect(wmks.wmksData.options.rescale).toBe(false);
        });

        it("setOption position", function() {
            spyOn(wmks.wmksData, "rescaleOrResize").and.callThrough();
            expect(wmks.wmksData.options.position).toBe(WMKS.CONST.Position.CENTER);
            wmks.setOption("position", WMKS.CONST.Position.LEFT_TOP);
            var spy = wmks.wmksData.rescaleOrResize.calls;
            expect(spy.count()).toBe(1);
            expect(wmks.wmksData.options.position).toBe(WMKS.CONST.Position.LEFT_TOP);
        });

        it("setOption changeResolution", function() {
            spyOn(wmks.wmksData, "rescaleOrResize").and.callThrough();
            expect(wmks.wmksData.options.changeResolution).toBe(true);
            wmks.setOption("changeResolution", false);
            var spy = wmks.wmksData.rescaleOrResize.calls;
            expect(spy.count()).toBe(1);
            expect(wmks.wmksData.options.changeResolution).toBe(false);
        });

        it("setOption useNativePixels", function() {
            spyOn(wmks.wmksData, "_updatePixelRatio").and.callThrough();
            spyOn(wmks.wmksData, "rescaleOrResize").and.callThrough();
            spyOn(WMKS.UTIL, "isHighResolutionSupported").and.returnValue(true);
            expect(wmks.wmksData.options.useNativePixels).toBe(false);
            wmks.setOption("useNativePixels", true);
            expect(wmks.wmksData.rescaleOrResize.calls.count()).toBe(1);
            expect(wmks.wmksData._updatePixelRatio.calls.count()).toBe(1);
            expect(wmks.wmksData.options.useNativePixels).toBe(true);
        });

        it("setOption fixANSIEquivalentKeys", function() {
            expect(wmks.wmksData.options.fixANSIEquivalentKeys).toBe(false);
            wmks.setOption("fixANSIEquivalentKeys", true);
            expect(wmks.wmksData.options.fixANSIEquivalentKeys).toBe(true);
        });

        it("setOption keyboardLayoutId", function() {
            expect(wmks.wmksData.options.keyboardLayoutId).toBe('en-US');
            wmks.setOption("keyboardLayoutId", 'de-DE');
            expect(wmks.wmksData.options.keyboardLayoutId).toBe('de-DE');
        });

        it("setOption VCDProxyHandshakeVmxPath", function() {
            expect(wmks.wmksData.options.VCDProxyHandshakeVmxPath).toBe(null);
            wmks.setOption("VCDProxyHandshakeVmxPath", 'vmxpath');
            expect(wmks.wmksData.options.VCDProxyHandshakeVmxPath).toBe('vmxpath');
        });

        it("setOption enableUint8Utf8", function() {
            expect(wmks.wmksData.options.enableUint8Utf8).toBe(false);
            wmks.setOption("enableUint8Utf8", true);
            expect(wmks.wmksData.options.enableUint8Utf8).toBe(true);
        });
    });
});