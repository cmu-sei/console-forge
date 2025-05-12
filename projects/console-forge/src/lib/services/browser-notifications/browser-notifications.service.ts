import { inject, Injectable } from '@angular/core';
import { WINDOW } from '../../injection/window.injection-token';
import { SendBrowserNotificationArgs } from './send-browser-notification';
import { LoggerService } from '../logger.service';
import { LogLevel } from '../../models/log-level';
import { ConsoleForgeConfig } from '../../config/console-forge-config';

@Injectable({ providedIn: 'root' })
export class BrowserNotificationsService {
  private config = inject(ConsoleForgeConfig);
  private logger = inject(LoggerService);
  private window = inject(WINDOW);

  public async send(args: SendBrowserNotificationArgs): Promise<void> {
    if (!this.config.showBrowserNotificationsOnConsoleEvents) {
      return;
    }

    const hasBrowserPermission = await Notification.requestPermission();
    if (hasBrowserPermission == "denied") {
      this.logger.log(LogLevel.WARNING, "Can't send notification - browser permission denied.", args);
    }

    const notification = new Notification(args.title, {
      body: args.body,
      tag: args.tag,
    });

    if (args.href?.url) {
      notification.onclick = (ev) => {
        ev.preventDefault();
        this.window.open(args.href?.url, args.href?.target);
      }
    }
  }
}
