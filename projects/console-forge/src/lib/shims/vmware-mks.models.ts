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
