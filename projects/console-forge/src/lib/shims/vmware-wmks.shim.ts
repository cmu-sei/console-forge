//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { WmksConnectionState, WmksEvents, WmksPosition, WmksSettableOptions } from "./vmware-mks.models";

function resolveWMKSLib(): WMKS {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (window as any).WMKS;
}

export function createWmksClient(hostElementId: string, options?: WmksClientCreateOptions): WmksClient {
    const result = resolveWMKSLib();
    return result.createWMKS(hostElementId, options);
}

export interface WmksClient {
    connect(url: string): Promise<void>;
    destroy(): void;
    disconnect(): void;

    getConnectionState(): WmksConnectionState;

    /**
     * This function is not documented by Broadcom but seems to exist and may be strictly related to
     * focus on the virtual console OR clipboard reading OR both OR neither.
     */
    grab(): void;

    register(event: WmksEvents, handler: WmksEventHandler): WmksClient;

    /**
     * Sends a Ctrl+Alt+Del key combination to the remote machine.
     */
    sendCAD(): void;

    /**
     * Sends a string as keyboard input to the server.
     */
    sendInputString(input: string): void;

    /**
     * Set an option WMKS client.
     * 
     * @param option - which option's value to update.
     * @param value - a boolean value enabling/disabling the option.
     */
    setOption(option: WmksSettableOptions, value: boolean): void;

    showKeyboard(): void;

    /**
     * Forcibly remove focus from the remote console (I think)
     */
    ungrab(): void;

    /**
     * Broadcom's description: Changes the resolution or rescales the remote screen to match the container size. Behavior depends on settings for changeResolution, rescale, and position options described in createMKS Options.
     * 
     * See: https://techdocs.broadcom.com/us/en/vmware-cis/vsphere/vsphere-sdks-tools/8-0/html-console-sdk-programming-guide/html-console-sdk-api/display-related-apis.html
     */
    updateScreen(): void;
}

export interface WmksClientCreateOptions {
    changeResolution?: boolean;
    position?: WmksPosition;

    /**
     * Indicates whether to rescale the remote screen to fit the container size. (Defaults to true)
     */
    rescale?: boolean;
    useNativePixels?: boolean;
    useVNCHandshake?: boolean;
}

export interface WMKS {
    get version(): string;

    /**
     * Create a client which connects to a remote console hosted on a VMWare cluster.
     * 
     * @param hostElementId The ID of a DOM element that will have a canvas injected into it by Broadcom's HTML Console SDK upon successful connection.
     * @param options Options which identify and specify the behavior of the virtual console.
     */
    createWMKS(hostElementId: string, options?: WmksClientCreateOptions): WmksClient;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WmksEventHandler = (e: any, data: any) => void;
