//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

export enum WmksAudioEncodingType {
    AAC = "aac",
    OPUS = "opus",
    VORBIS = "vorbis"
}

export enum WmksConnectionState {
    CONNECTED = "connected",
    CONNECTING = "connecting",
    DISCONNECTED = "disconnected"
}

export enum WmksErrorType {
    AUTHENTICATION_FAILED = "authenticationfailed",
    PROTOCOL_ERROR = "protocolerror",
    WEBSOCKET_ERROR = "websocketerror"
}

export enum WmksEvents {
    AUDIO = "audio",
    CONNECTION_STATE_CHANGE = "connectionstatechange",
    COPY = "copy",
    ERROR = "error",
    FULL_SCREEN_CHANGE = "fullscreenchange",
    HEARTBEAT = "heartbeat",
    KEYBOARD_LEDS_CHANGE = "keyboardledschanged",
    REMOTE_SCREEN_SIZE_CHANGE = "screensizechange",
    TOGGLE = "toggle"
}

export interface WmksEventData {
    state: WmksConnectionState;
}

export enum WmksPosition {
    CENTER = 0,
    LEFT_TOP = 1
}

export type WmksSettableOptions = "changeResolution" | "position" | "rescale"
