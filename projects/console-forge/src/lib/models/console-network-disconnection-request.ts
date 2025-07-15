export interface ConsoleNetworkDisconnectionRequest {
    /**
     * The which should be disconnected. If this value is falsey, interpret as
     * a request to disconnect all NICs.
     */
    nic?: string;
}
