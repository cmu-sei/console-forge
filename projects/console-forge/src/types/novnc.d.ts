// the currently-available types (from @types/novnc__novnc) are awkward and maybe incorrect,
// and we consume very little from this API at present. so we just made our own:
declare module '@novnc/novnc' {
    export class NoVncClient {
        constructor(target: HTMLElement, url: string, options?: NoVncClientOptions);
        disconnect(): void;
    }

    export interface NoVncClientOptions {
        credentials?: {
            username?: string;
            password?: string;
            target?: string;
        };
        shared?: boolean;
        wsProtocols?: string[];
    }
}
