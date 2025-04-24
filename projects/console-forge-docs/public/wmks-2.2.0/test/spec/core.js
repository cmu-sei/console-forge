/*********************************************************
 * Copyright (C) 2015 VMware, Inc. All rights reserved.
 *********************************************************/
/*
 *  This file include the following test suites
 *  - Lifecycle related API
 *  - Full screen related API
 *  - Display related API
 *  - Input related API
 *
 *  Here using mockMessages to fake the connect virtual machine
 *  and mock the websocket and it's send & close methods
 */
describe("webmks core API", function() {
    var mockMessages = [
        [82, 70, 66, 32, 48, 48, 51, 46, 48, 48, 56, 10], // RFB 003.008\n
        [1, 1], // Security type 1
        [0, 0, 0, 0], // Authentication scheme
        [4, 8, 3, 6, 32, 24, 0, 1, 0, 255, 0, 255, 0, 255, 16, 8, 0, 0, 0, 0, 0, 0, 0, 38, 87, 105, 110, 100, 111, 119, 115, 32, 88, 80, 32, 80, 114, 111, 102, 101, 115, 115, 105, 111, 110, 97, 108, 32, 87, 105, 116, 104, 111, 117, 116, 32, 68, 111, 109, 97, 105, 110],
        [127, 0, 0, 8, 0, 0, 0, 191],
        [0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 152, 78, 0, 0]
    ];
    var url = 'ws://127.0.0.1:8280';

    var fakeRecvdData = function(index, handler) {
        var evt = $.Event('data');
        if (index < mockMessages.length) {
            //The lasted webmks only recieve Arraybuffer type event data
            var msg = new Uint8Array(mockMessages[index]);
            evt.data = msg.buffer;
            console.log("in fakeRecvdData index is " + index);
            setTimeout(function() {
                handler(evt);
            }, 0);
        }
    };

    var sendStub = function(message) {
        fakeRecvdData(this.mockMessageIdx, this.onmessage);
        this.mockMessageIdx++;
    };

    var closeStub = function() {
        console.log("close websocket");
        var evt = $.Event('close');
        this.mockMessageIdx = 0;
        evt.code = 1000;
        if (typeof this.onclose == "function") {
            this.onclose(evt);
        } else {
            this.onclose = null;
        }
    };
    var WebSocketStub = function(url, protocolList) {
        console.log("in new WebSocketStub");
        var self = this;
        this.protocol = "binary";
        // We add these empty functions to the constructed object so that
        // we can stub them a few lines later.
        this.send = function() {};
        this.close = function() {};
        this.mockMessageIdx = 0;

        spyOn(this, "send").and.callFake(sendStub);
        spyOn(this, "close").and.callFake(closeStub);
        setTimeout(function() {
            self.onopen();
            fakeRecvdData(self.mockMessageIdx, self.onmessage);
            self.mockMessageIdx++;
        }, 100);
        return this;
    };

    var bakTimeoutInterval = jasmine.DEFAULT_TIMEOUT_INTERVAL;

    beforeEach(function(done) {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
        jasmine.getFixtures().fixturesPath = 'base/view/';
        loadFixtures("index.html");

        spyOn(WMKS, "WebSocket").and.callFake(WebSocketStub);
        if (WMKS.send)
            spyOn(WMKS, "send").and.callFake(sendStub);
        if (WMKS.close)
            spyOn(WMKS, "close").and.callFake(closeStub);
        done();
    });

    afterEach(function() {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = bakTimeoutInterval;
    });

    describe("Lifecycle related API", function() {

        var wmks;

        afterEach(function() {
            if (wmks)
                wmks.destroy();
        });

        it("Should throw exception", function(done) {
            expect(function(){
                WMKS.createWMKS()
            }).toThrow();
            done();
        })

        it("connect", function(done) {
            wmks = WMKS.createWMKS("wmksContainer", {});
            wmks.register(WMKS.CONST.Events.CONNECTION_STATE_CHANGE, function(event, data) {
                if (data.state == WMKS.CONST.ConnectionState.CONNECTED) {
                    setTimeout(function() {
                        expect(wmks.getConnectionState()).toEqual("connected");
                        done();
                    }, 1);
                }
            });

            wmks.connect(url);
            expect(WMKS.WebSocket.calls.count()).toEqual(1);
            var first = WMKS.WebSocket.calls.first();
            expect(first.object).toEqual(WMKS);
        });

        it("disconnect after connected", function(done) {
            wmks = WMKS.createWMKS("wmksContainer", {});
            wmks.register(WMKS.CONST.Events.CONNECTION_STATE_CHANGE, function(event, data) {
                if (data.state == WMKS.CONST.ConnectionState.CONNECTED) {
                    setTimeout(function() {
                        wmks.disconnect();
                        done();
                    }, 1);
                } else if (data.state == WMKS.CONST.ConnectionState.DISCONNECTED) {
                    expect(wmks.getConnectionState()).toEqual("disconnected");
                    done();
                }
            });
            wmks.connect(url);
        });

        it("disconnect when not connected yet", function() {
            wmks = WMKS.createWMKS("wmksContainer", {});
            wmks.disconnect();
            //no event would be trigger here
            expect(wmks.getConnectionState()).toEqual("disconnected");

        });

        // when destroy wmks, it would first disconnect the connection
        it("destroy", function(done) {

            wmks = WMKS.createWMKS("wmksContainer", {});
            wmks.register(WMKS.CONST.Events.CONNECTION_STATE_CHANGE, function(event, data) {
                if (data.state == WMKS.CONST.ConnectionState.CONNECTED) {
                    setTimeout(function() {
                        //here destroy is an async method, it would call the disconnect method
                        wmks.destroy();
                        expect(wmks.wmks).toBe(null);
                        done();
                    }, 1);
                } else if (data.state == WMKS.CONST.ConnectionState.DISCONNECTED) {
                    expect(wmks.getConnectionState()).toEqual("disconnected");
                }
            });
            wmks.connect(url);

        });

    });

    describe("Full screen related API", function() {
        var wmks;

        afterEach(function() {
            if (wmks)
                wmks.destroy();
        });

        //here if run these test case in karma, then it would return false for security reason
        //if run test case directly in the browser(IE11,chrome,firefox), it would return true
        //Therefore just disable it
        xit("canFullScreen", function() {
            wmks = WMKS.createWMKS("wmksContainer", {});
            var ret = wmks.canFullScreen();

            expect(ret).toBe(true);
        });

        it("isFullScreen", function() {
            wmks = WMKS.createWMKS("wmksContainer", {});
            var ret = wmks.isFullScreen();
            expect(ret).toBe(false);
        });

        it("enterFullScreen", function() {

            spyOn(WMKS.UTIL, "toggleFullScreen").and.callThrough();
            spyOn(WMKS.UTIL, "isFullscreenEnabled").and.returnValue(true);
            wmks = WMKS.createWMKS("wmksContainer", {});
            console.log("begin enterFullScreen");
            wmks.enterFullScreen();

            var spyCall = WMKS.UTIL.toggleFullScreen.calls;
            expect(spyCall.count()).toBe(1);
            expect(spyCall.first().args[0]).toBe(true);
            expect(wmks.oldCssText).not.toBe(null);
        });

        it("trigger enter fullscreen event", function() {
            spyOn(WMKS.UTIL, "isFullscreenEnabled").and.returnValue(true);
            var spyFullScreen = spyOn(WMKS.UTIL, "isFullscreenNow");
            spyFullScreen.and.returnValue(false);
            wmks = WMKS.createWMKS("wmksContainer", {});
            spyOn(wmks.wmksData, "rescaleOrResize").and.callThrough();

            wmks.register(WMKS.CONST.Events.FULL_SCREEN_CHANGE, function(event, data) {
                expect(data.isFullScreen).toBe(true);
                expect($("#wmksContainer").css("position")).toBe("fixed");
                expect($("#wmksContainer").css("left")).toBe("0px");
                expect($("#wmksContainer").css("top")).toBe("0px");
                expect(wmks.wmksData.rescaleOrResize.calls.count()).toBe(1);
            });
            wmks.enterFullScreen();
            spyFullScreen.and.returnValue(true);
            var event = $.Event("resize");
            $(window).trigger(event);
        });

        it("exitFullScreen", function() {
            spyOn(WMKS.UTIL, "toggleFullScreen").and.callThrough();
            spyOn(WMKS.UTIL, "isFullscreenNow").and.returnValue(true);
            wmks = WMKS.createWMKS("wmksContainer", {});

            wmks.exitFullScreen();
            var spyCall = WMKS.UTIL.toggleFullScreen.calls;
            expect(spyCall.count()).toBe(1);
            expect(spyCall.first().args[0]).toBe(false);
        });

        it("trigger exit fullscreen event", function() {

            spyOn(WMKS.UTIL, "toggleFullScreen").and.callThrough();
            spyOn(WMKS.UTIL, "isFullscreenNow").and.returnValue(true);
            wmks = WMKS.createWMKS("wmksContainer", {});
            spyOn(wmks.wmksData, "rescaleOrResize").and.callThrough();

            wmks.register(WMKS.CONST.Events.FULL_SCREEN_CHANGE, function(event, data) {
                expect(data.isFullScreen).toBe(false);
                expect($("#wmksContainer").css("position")).not.toBe("fixed");

                expect(wmks.wmksData.rescaleOrResize.calls.count()).toBe(1);
            });

            wmks.exitFullScreen();
            var event = $.Event("resize");
            $(window).trigger(event);
        });

    });

    describe("Display related API", function() {

        var initWidth = 1032,
            initHeight = 774;

        describe("get and set screen size", function() {
            var wmks;

            beforeEach(function(done) {

                wmks = WMKS.createWMKS("wmksContainer", {});
                wmks.register(WMKS.CONST.Events.CONNECTION_STATE_CHANGE, function(event, data) {
                    if (data.state == WMKS.CONST.ConnectionState.CONNECTED) {
                        setTimeout(function() {
                            console.log("connected done!");
                            done();
                        }, 1);
                    }
                });
                wmks.connect(url);

            });

            afterEach(function(done) {
                if (wmks) {
                    wmks.destroy();
                    wmks = null;
                }
                done();
            });

            it("getRemoteScreenSize", function(done) {
                var size = wmks.getRemoteScreenSize();
                expect(size).not.toBe(null);
                expect(size.width).toBe(initWidth);
                expect(size.height).toBe(initHeight);
                done();
            });

            it("setRemoteScreenSize ", function(done) {
                wmks.register(WMKS.CONST.Events.REMOTE_SCREEN_SIZE_CHANGE, function(event, data) {
                    expect(data.width).toBe(800);
                    expect(data.height).toBe(600);
                    var size = wmks.getRemoteScreenSize();
                    expect(size).not.toBe(null);
                    expect(size.width).toBe(800);
                    expect(size.height).toBe(600);
                    done();
                });
                var readDesktopSizeStub = function(rect) {
                    this._FBWidth = rect.w;
                    this._FBHeight = rect.h;
                    this.options.onNewDesktopSize(this._FBWidth, this._FBHeight);
                };
                var rect = {
                    w: 800,
                    h: 600
                };
                wmks.setRemoteScreenSize(rect.w, rect.h);
                setTimeout(function() {
                    readDesktopSizeStub.apply(wmks.wmksData._vncDecoder, [rect]);
                }, 1);
            });

        });

        describe("updatescreen", function() {
            var wmks, index = 0;
            options = [{
                rescale: true,
                changeResolution: true
            }, {
                rescale: true,
                changeResolution: false
            }, {
                rescale: false,
                changeResolution: true
            }, {
                rescale: false,
                changeResolution: false
            }];

            beforeEach(function(done) {
                wmks = WMKS.createWMKS("wmksContainer", options[index]);
                wmks.register(WMKS.CONST.Events.CONNECTION_STATE_CHANGE, function(event, data) {
                    if (data.state == WMKS.CONST.ConnectionState.CONNECTED) {
                        setTimeout(function() {
                            console.log("connected done!");
                            done();
                        }, 1);
                    }
                });
                wmks.connect(url);
                index++;
            });

            afterEach(function(done) {
                if (wmks) {
                    wmks.destroy();
                }
                done();
            });
            //when updatescreen, the behavior totally depends on the options
            //check if the connected vm could change it resolution, then the scale would be 1
            it("with options rescale:true, changeResolution:true", function(done) {

                wmks.register(WMKS.CONST.Events.REMOTE_SCREEN_SIZE_CHANGE, function(event, data) {
                    setTimeout(function() {
                        console.log("in remote screen size change !");
                        expect(wmks.wmksData._scale).toBe(1);
                        expect(wmks.wmksData._x).toBe(0);
                        expect(wmks.wmksData._y).toBe(0);
                        done();
                    }, 1);

                });
                var readDesktopSizeStub = function(w, h) {
                    this._FBWidth = w;
                    this._FBHeight = h;
                    this.options.onNewDesktopSize(this._FBWidth, this._FBHeight);
                };
                var newW = 800,
                    newH = 600;
                $("#wmksContainer").css({
                    "height": "600px",
                    "width": "800px"
                });
                wmks.updateScreen();
                //here would first rescale
                var wScale = newW / initWidth,
                    hScale = newH / initHeight;
                expect(wmks.wmksData._scale).toBe(Math.min(wScale, hScale));
                expect(wmks.wmksData._x).toBe((newW - initWidth) / 2);
                expect(wmks.wmksData._y).toBe((newH - initHeight) / 2);

                setTimeout(function() {
                    readDesktopSizeStub.apply(wmks.wmksData._vncDecoder, [newW, newH]);
                }, 1);
            });

            it("with options rescale:true, changeResolution:false", function() {
                spyOn(wmks.wmksData, "updateFitGuestSize").and.callThrough();
                var newW = 800,
                    newH = 600;
                $("#wmksContainer").css({
                    "height": "600px",
                    "width": "800px"
                });
                wmks.updateScreen();
                var cnt = wmks.wmksData.updateFitGuestSize.calls.count();
                expect(cnt).toBe(0);
                var wScale = newW / initWidth,
                    hScale = newH / initHeight;
                expect(wmks.wmksData._scale).toBe(Math.min(wScale, hScale));
                expect(wmks.wmksData._x).toBe((newW - initWidth) / 2);
                expect(wmks.wmksData._y).toBe((newH - initHeight) / 2);
            });

            it("with options rescale:false, changeResolution:true", function() {
                wmks.register(WMKS.CONST.Events.REMOTE_SCREEN_SIZE_CHANGE, function(event, data) {
                    setTimeout(function() {
                        console.log("in remote screen size change !");
                        expect(wmks.wmksData._scale).toBe(1);
                        expect(wmks.wmksData._x).toBe(0);
                        expect(wmks.wmksData._y).toBe(0);
                        done();
                    }, 1);

                });
                var readDesktopSizeStub = function(w, h) {
                    this._FBWidth = w;
                    this._FBHeight = h;
                    this.options.onNewDesktopSize(this._FBWidth, this._FBHeight);
                };
                var newW = 800,
                    newH = 600;
                $("#wmksContainer").css({
                    "height": "600px",
                    "width": "800px"
                });
                wmks.updateScreen();
                //here would not rescale
                expect(wmks.wmksData._scale).toBe(1);
                expect(wmks.wmksData._x).toBe((newW - initWidth) / 2);
                expect(wmks.wmksData._y).toBe((newH - initHeight) / 2);

                setTimeout(function() {
                    if (wmks.wmksData) {
                        readDesktopSizeStub.apply(wmks.wmksData._vncDecoder, [newW, newH]);
                    }
                }, 1);
            });

            it("with options rescale:false, changeResolution:false", function() {
                spyOn(wmks.wmksData, "updateFitGuestSize").and.callThrough();
                var newW = 800,
                    newH = 600;
                $("#wmksContainer").css({
                    "height": "600px",
                    "width": "800px"
                });
                wmks.updateScreen();
                var cnt = wmks.wmksData.updateFitGuestSize.calls.count();
                expect(cnt).toBe(0);

                expect(wmks.wmksData._scale).toBe(1);
                expect(wmks.wmksData._x).toBe((newW - initWidth) / 2);
                expect(wmks.wmksData._y).toBe((newH - initHeight) / 2);
            });
        });
    });

    describe("Input related API", function() {

        function UInt8ArrayToString(uInt8Array) {
            var s = "[";
            for (var i = 0; i < uInt8Array.length; i++) {
                if (i > 0)
                    s += ", ";
                s += uInt8Array[i];
            }
            s += "]";
            return s;
        };

        var wmks, needDestroy;

        beforeEach(function(done) {
            wmks = WMKS.createWMKS("wmksContainer", {});
            wmks.register(WMKS.CONST.Events.CONNECTION_STATE_CHANGE, function(event, data) {
                if (data.state == WMKS.CONST.ConnectionState.CONNECTED) {
                    setTimeout(function() {
                        done();
                    }, 1);
                }
            });
            wmks.connect(url);
        });

        afterEach(function(done) {

            if (wmks && needDestroy)
                wmks.destroy();
            done();
        });

        it("sendKeyCodes", function() {
            var sendSpy = WMKS.send.calls;
            sendSpy.reset();
            wmks.sendKeyCodes([71],[0x22]);
            var sentData = new Uint8Array(sendSpy.argsFor(0)[0]);
            expect(sentData).toEqual(new Uint8Array([127, 0, 0, 8, 0, 34, 1, 0]));
            sentData = new Uint8Array(sendSpy.argsFor(1)[0]);
            expect(sentData).toEqual(new Uint8Array([127, 0, 0, 8, 0, 34, 0, 0]));
        });

        it("sendInputString in one line", function() {
            //notice here, some character such as caps, would involve the shift key
            var result = [
                [127, 0, 0, 8, 0, 2, 1, 0],
                [127, 0, 0, 8, 0, 2, 0, 0],
                [127, 0, 0, 8, 0, 42, 1, 0],
                [127, 0, 0, 8, 0, 30, 1, 0],
                [127, 0, 0, 8, 0, 30, 0, 0],
                [127, 0, 0, 8, 0, 42, 0, 0]
            ];
            var sendSpy = WMKS.send.calls;
            sendSpy.reset();
            wmks.sendInputString("1A");
            var count = expect(sendSpy.count()).toBe(6);
            for (var i = 0; i < 6; i++) {
                var sentData = new Uint8Array(sendSpy.argsFor(i)[0]);
                expect(sentData).toEqual(new Uint8Array(result[i]));
            }
        });

        it("sendInputString in multiple line", function() {
            var result = [
                [127, 0, 0, 8, 0, 2, 1, 0],
                [127, 0, 0, 8, 0, 2, 0, 0],
                [127, 0, 0, 8, 0, 28, 1, 0],
                [127, 0, 0, 8, 0, 28, 0, 0],
                [127, 0, 0, 8, 0, 2, 1, 0],
                [127, 0, 0, 8, 0, 2, 0, 0]
            ];
            var sendSpy = WMKS.send.calls;
            sendSpy.reset();
            wmks.sendInputString("1\n1");
            var count = expect(sendSpy.count()).toBe(6);
            for (var i = 0; i < 6; i++) {
                var sentData = new Uint8Array(sendSpy.argsFor(i)[0]);
                expect(sentData).toEqual(new Uint8Array(result[i]));
            }
        });

        it("sendCAD", function() {
            var result = [
                [127, 0, 0, 8, 0, 29, 1, 0],
                [127, 0, 0, 8, 0, 56, 1, 0],
                [127, 0, 0, 8, 1, 83, 1, 0],
                [127, 0, 0, 8, 0, 29, 0, 0],
                [127, 0, 0, 8, 0, 56, 0, 0],
                [127, 0, 0, 8, 1, 83, 0, 0]
            ];
            var sendSpy = WMKS.send.calls;
            sendSpy.reset();
            wmks.sendCAD();
            expect(sendSpy.count()).toEqual(6);
            for (var i = 0; i < 6; i++) {
                var sentData = new Uint8Array(sendSpy.argsFor(i)[0]);
                expect(sentData).toEqual(new Uint8Array(result[i]));
            }
            needDestroy = true;
        });

    });
});