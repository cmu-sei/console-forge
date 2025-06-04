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
    register(event: WmksEvents, handler: WmksEventHandler): WmksClient;

    /**
     * Sends a Ctrl+Alt+Del key combination to the remote machine.
     */
    sendCAD(): void;

    /**
     * Set an option WMKS client.
     * 
     * @param option - which option's value to update.
     * @param value - a boolean value enabling/disabling the option.
     */
    setOption(option: WmksSettableOptions, value: boolean): void;

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
    rescale?: boolean;
    useVNCHandshake?: boolean;
}

export interface WMKS {
    get version(): string;
    createWMKS(hostElementId: string, options?: WmksClientCreateOptions): WmksClient;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WmksEventHandler = (e: any, data: any) => void;
