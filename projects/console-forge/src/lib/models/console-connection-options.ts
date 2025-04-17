export interface ConsoleConnectionOptions {
    credentials?: {
        password?: string;
        username?: string;
    }
    hostElement: HTMLElement;
    isViewOnly?: boolean;
}
