// Copyright 2026 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

export interface ConsoleNetworkDisconnectionRequest {
    /**
     * The which should be disconnected. If this value is falsey, interpret as
     * a request to disconnect all NICs.
     */
    nic?: string;
}
