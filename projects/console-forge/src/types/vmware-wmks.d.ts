declare namespace WMKS {
    function createWMKS(hostElementId: string)
    function getVersion(): string;
}

// class WmksClient {
//     // function connect(url: string): void;
//     // function disconnect(): void;
// }

// interface WmksOptions {
//     /**
//      * If true, WMKS sends a change resolution request to the connected VM. The requested resolution matches the container size. If the request fails, use the rescale and position operations to change the resolution manually.
//      *
//      * Default is true.
//      */
//     changeResolution?: boolean;

//     /**
//      * Indicates whether to rescale the remote screen to fit the container size.
//      *
//      * Default is true.
//      */
//     rescale?: boolean;

//     /**
//      * Enables a standard VNC handshake. Implement this option when the endpoint uses standard VNC authentication. Set to false if connecting
//      * to a proxy that uses authd for authentication and does not perform a VNC handshake.
//      *
//      * Default is true.
//      */
// }
// audioEncodeType	Indicates the type of audio encoding method being used.Possible values for WMKS.CONST.AudioEncodeType are: vorbis, opus, or aac.enum	
// changeResolution	If true, WMKS sends a change resolution request to the connected VM.The requested resolution matches the container size.If the request fails, use the rescale and position operations to change the resolution manually.Boolean	Default is true.
// enableUint8Utf8	If true, enables the uint8utf8 protocol for projects that do not support the binary protocol.Boolean	Default is false.
// fixANSIEquivalentKeys	If true, enables translation of non - ANSI US keyboard layouts to ANSI US keyboard layout equivalents.Tries to match keys on the international keyboard to keys in different locations or with different Shift status on the US keyboard.Boolean	Default is false.
// ignoredRawKeyCodes	Ignores the keycodes.Do not send keycodes to the server.array	Default is empty.
// keyboardLayoutId	Provides different language keyboard setups for the Guest OS.Remote desktop and local desktop keyboard layouts must be the same.For international mapping, WMKS supports vScancode.This option does not support mobile devices.See keyBoardLayoutId Details	string	Default value is en - US.
// position	Indicates where the remote screen should appear in the container.Values are either center or top left.enum	Default value is WMKS.CONST.Position.CENTER
// rescale	Indicates whether to rescale the remote screen to fit the container size.Boolean	Default is true.
// retryConnectionInterval	The interval in milliseconds before attempting to reconnect the Web client and server after a failed attempt.If less than 0, WMKS does not attempt to create the connection again.integer	Default value is - 1.
// reverseScrollY	If true, sends the opposite value of the mouse when to the connected VM.This is for touch devices that scroll in the opposite direction.Boolean	Default is false.
// sendProperMouseWheelDeltas	If true, actual mouse wheel event delta values are sent from the browser to the server.If unspecified, normalized event deltas values are either: -1, 0, or 1.	Boolean	Default is false.
// useNativePixels	Enables the use of native pixel sizes on the device.For example, on the iPhone 4 + or iPad 3 + devices, the true setting enables Retina mode, providing more screen space for the guest and making everything appear smaller.Boolean	Default is false.
// useUnicodeKeyboardinput	If true, WMKS attempts to send Unicode messages from the user to the server.If unspecified, WMKS sends messages using either Unicode or keyboard scan codes.Boolean	Default is false.
// useVNCHandshake	Enables a standard VNC handshake.Implement this option when the endpoint uses standard VNC authentication.Set to false if connecting to a proxy that uses authd for authentication and does not perform a VNC handshake.Boolean	Default is true.
// VCDProxyHandshakeVmxPath	The string passed by the VNC protocol.If a connection request for a VMX path is received, the VNC protocol responds with the VCDProxyHandshakeVmxPath when connecting to vCloud Director.string	Default value is null.
