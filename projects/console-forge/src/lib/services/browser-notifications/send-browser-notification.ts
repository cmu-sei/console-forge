export interface SendBrowserNotificationArgs {
    title: string;
    body: string;
    href?: {
        url: string | URL;
        target?: string;
    },
    tag?: string;
}
