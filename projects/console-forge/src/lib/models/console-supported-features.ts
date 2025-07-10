//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

export interface ConsoleSupportedFeatures {
    /**
     * This is basically a stupid kludge that is only here because VMWare's client has a very weird implementation of "copy".
     * 
     * The VMWare "WMKS" client only emits clipboard events after the remote console's clipboard receives new data (i.e. you copy some content on the remote desktop)
     * AND after the console canvas loses focus. That is, no matter how much copying you do, the client doesn't know about until the canvas housing the console
     * is blurred. 
     * 
     * The downstream effect of this that, unlike with other protocols, we can't gracefully emit events when copies happen or automatically copy to your local
     * clipboard in a reasonable way, because we can't know when the remote copy happened and if you really want it copied to your local CB or not. So when this
     * flag is set to false (VMWare is the only service which does this), we show a panel in the default toolbar that you can manually copy content from and
     * automatically receives the last "copy" event from the console.
     * 
     * Yuck.
     */
    clipboardAutomaticLocalCopy: boolean;

    /**
     * Indicates whether the remote console protocol allows us to write content directly to the clipboard of the remote machine. 
     */
    clipboardRemoteWrite: boolean;

    /**
     * Indicates whether there remote console offers an on-screen keyboard. (Hint: probably not. As far as we know, VMWare's WMKS is the only one that will do this.)
     */
    onScreenKeyboard: boolean;

    /**
     * Indicates whether the remote console protocol allows us to issue power requests (like restart, reboot, and hard reboot). This is typically a configuration detail
     * of the machine, so we usually have to rely on the protocol-specific service to tell us whether the feature is enabled (see our VNC client, wrapping noVnc, for an example)
     */
    powerManagement: boolean;

    /**
     * NoVNC seems to have a quirk that causes it to lose proper mouse tracking after leaving fullscreen. We're working around this by requesting a reconnection of the console
     * upon exiting. VMWare doesn't seem to need this.
     */
    requireReconnectOnExitingFullscreen?: boolean;

    /**
     * Whether the remote console protocol/library supports a "view/read"-only canvas. If it doesn't, we have to do some CSS/JS hacking in the console component, so 
     * we prefer the client lib/protocol's implementation if we can get it.
     */
    viewOnlyMode: boolean;
}
