/*********************************************************
 * Copyright (C) 2015 VMware, Inc. All rights reserved.
 *********************************************************/
/*
 *  This file include mobile related test suites
 *  - enable/disable keyboard
 *  - enable/disable trackpad
 *  - enable/disable extendedkeypad
 *  - show/hide keyboar
 *  - toggle trackpad extendedkeypad
 *  - trigger toggle keyboard,trackpad,extendedkeypad event
 *
 */
describe("webmks mobile", function() {
    var wmks, deviceType = WMKS.CONST.InputDeviceType, toggleKeyboard;

    beforeEach(function() {
        jasmine.getFixtures().fixturesPath = 'base/view/';
        loadFixtures("index.html");

        spyOn(WMKS.BROWSER, "isTouchDevice").and.returnValue(true);
        spyOn(WMKS.BROWSER, "isAndroid").and.returnValue(true);
        spyOn(WMKS.BROWSER, "isLinux").and.returnValue(true);

        var isMobile = WMKS.BROWSER.isTouchDevice();
        expect(isMobile).toBe(true);
        var opts = {
            allowMobileKeyboardInput: false,
            allowMobileExtendedKeypad: false,
            allowMobileTrackpad: false
        };
        wmks = WMKS.createWMKS("wmksContainer", opts);
        toggleKeyboard = sinon.spy(WMKS.widgetProto.toggleKeyboard);

    });
    afterEach(function() {
        if (wmks) wmks.destroy();
    });

    it("enable keyboard", function() {

        wmks.enableInputDevice(deviceType.KEYBOARD);
        var inputDivNum = $("#input-proxy").length;
        expect(inputDivNum).toBe(1);
    });

    it("disable keyboard", function() {
        spyOn(wmks.wmksData._touchHandler, "removeMobileFeature").and.callThrough();
        wmks.enableInputDevice(deviceType.KEYBOARD);
        var inputDivNum = $("#input-proxy").length;
        expect(inputDivNum).toBe(1);
        wmks.disableInputDevice(deviceType.KEYBOARD);
        var calls = wmks.wmksData._touchHandler.removeMobileFeature.calls;
        expect(calls.count()).toBe(2);
        expect(calls.argsFor(0)[0]).toBe(WMKS.CONST.TOUCH.FEATURE.SoftKeyboard);
    });

    it("show keyboard", function() {
        wmks.enableInputDevice(deviceType.KEYBOARD);
        wmks.showKeyboard();
        expect(document.activeElement.id).toEqual("input-proxy");

    });

    it("hide keyboard", function() {
        var bak = WMKS.CONST.TOUCH.minKeyboardToggleTime;
        WMKS.CONST.TOUCH.minKeyboardToggleTime = -1;
        wmks.enableInputDevice(deviceType.KEYBOARD);
        wmks.showKeyboard();
        expect(toggleKeyboard.withArgs(true).calledOnce);

        wmks.hideKeyboard();
        expect(toggleKeyboard.withArgs(false).calledOnce);
        WMKS.CONST.TOUCH.minKeyboardToggleTime = bak;
    });

    it("can trigger show keyboard event", function(done) {
        var eventType = WMKS.CONST.Events.TOGGLE;

        expect(Object.keys(wmks.eventHandlers).length).toBe(0);
        var vncDecoder = wmks.wmksData._vncDecoder;
        var handlers = {
            handler: function(event, data) {
                expect(data.type).toBe("KEYBOARD");
                expect(data.visibility).toBe(true);
            }
        };
        spyOn(handlers, "handler").and.callThrough();
        wmks.register(eventType, handlers.handler);

        WMKS.CONST.TOUCH.minKeyboardToggleTime = -1;
        wmks.enableInputDevice(deviceType.KEYBOARD);
        wmks.showKeyboard();
        expect(toggleKeyboard.withArgs(true).calledOnce);
        wmks.unregister(eventType);
        done();
    });

    it("enable extendKeyboard", function() {
        wmks.enableInputDevice(deviceType.EXTENDED_KEYBOARD);
        var num = $("#ctrlPanePopup").length;
        expect(num).toBe(1);
    });

    it("disable extendKeyboard", function() {
        wmks.enableInputDevice(deviceType.EXTENDED_KEYBOARD);
        var num = $("#ctrlPanePopup").length;
        expect(num).toBe(1);
        wmks.disableInputDevice(deviceType.EXTENDED_KEYBOARD);
        num = $("#ctrlPanePopup").length;
        expect(num).toBe(0);
    });

    it("toggle extendKeyboard", function() {
        wmks.enableInputDevice(deviceType.EXTENDED_KEYBOARD);
        var vis = $("#ctrlPaneWidget").css("display");
        expect(vis).toBe("none");
        wmks.toggleExtendedKeypad({
            minToggleTime: -1
        });
        vis = $("#ctrlPaneWidget").css("display");
        expect(vis).not.toBe("none");
        wmks.toggleExtendedKeypad({
            minToggleTime: -1
        });
        vis = $("#ctrlPaneWidget").css("display");
        expect(vis).toBe("none");
    });

    it("can trigger show extendKeyboard event", function(done) {
        var eventType = WMKS.CONST.Events.TOGGLE;

        expect(Object.keys(wmks.eventHandlers).length).toBe(0);
        var vncDecoder = wmks.wmksData._vncDecoder;
        var handlers = {
            handler: function(event, data) {
                expect(data.type).toBe("EXTENDED_KEYPAD");
                expect(data.visibility).toBe(true);
            }
        };
        spyOn(handlers, "handler").and.callThrough();
        wmks.register(eventType, handlers.handler);

        wmks.enableInputDevice(deviceType.EXTENDED_KEYBOARD);
        wmks.toggleExtendedKeypad({
            minToggleTime: -1
        });
        var cnt = handlers.handler.calls.count();
        expect(cnt).toBe(1);
        wmks.unregister(eventType);
        done();
    });

    it("enable trackpad", function() {
        wmks.enableInputDevice(deviceType.TRACKPAD);
        var num = $(".trackpad-wrapper").length;
        expect(num).toBe(1);
    });

    it("disable trackpad", function() {
        wmks.enableInputDevice(deviceType.TRACKPAD);
        var num = $(".trackpad-wrapper").length;
        expect(num).toBe(1);
        wmks.disableInputDevice(deviceType.TRACKPAD);
        num = $(".trackpad-wrapper").length;
        expect(num).toBe(0);
    });

    it("toggle trackpad", function() {
        wmks.enableInputDevice(deviceType.TRACKPAD);
        var vis = $(".trackpad-wrapper").css("display");
        expect(vis).toBe("none");
        //here set the option minToggleTime as -1 to make this test case can call toggle 2 twice
        wmks.toggleTrackpad({
            minToggleTime: -1
        });
        vis = $(".trackpad-wrapper").css("display");
        expect(vis).not.toBe("none");
        wmks.toggleTrackpad({
            minToggleTime: -1
        });
        vis = $(".trackpad-wrapper").css("display");
        expect(vis).toBe("none");
    });

    it("can trigger show extendKeyboard event", function(done) {
        var eventType = WMKS.CONST.Events.TOGGLE;

        expect(Object.keys(wmks.eventHandlers).length).toBe(0);
        var vncDecoder = wmks.wmksData._vncDecoder;
        var handlers = {
            handler: function(event, data) {
                expect(data.type).toBe("TRACKPAD");
                expect(data.visibility).toBe(true);
            }
        };
        spyOn(handlers, "handler").and.callThrough();
        wmks.register(eventType, handlers.handler);

        wmks.enableInputDevice(deviceType.TRACKPAD);
        wmks.toggleTrackpad({
            minToggleTime: -1
        });
        var cnt = handlers.handler.calls.count();
        expect(cnt).toBe(1);
        wmks.unregister(eventType);
        done();
    });
});