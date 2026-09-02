//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { DOCUMENT } from "@angular/common";
import { inject, Injectable } from "@angular/core";
import { ConsoleForgeConfig } from "../../../config/console-forge-config";
import { WINDOW } from "../../../injection/window.injection-token";
import { LogLevel } from "../../../models/log-level";
import { LoggerService } from "../../logger.service";
import type { WMKS } from "../../../shims/vmware-wmks.shim";

interface WmksJQuery {
  fn?: {
    dialog?: unknown;
  };
}

interface WmksWindow extends Window {
  WMKS?: WMKS;
  jQuery?: WmksJQuery;
}

@Injectable({ providedIn: 'root' })
export class WmksLoaderService {
  private readonly cfConfig = inject(ConsoleForgeConfig);
  private readonly document = inject(DOCUMENT);
  private readonly logger = inject(LoggerService);
  private readonly window = inject(WINDOW);
  private loading?: Promise<void>;

  public ensureLoaded(): Promise<void> {
    const windowWithWmks = this.window as WmksWindow;

    if (windowWithWmks.WMKS) {
      return Promise.resolve();
    }

    if (!this.loading) {
      this.loading = this.load().catch(err => {
        this.loading = undefined;
        throw err;
      });
    }

    return this.loading;
  }

  private load(): Promise<void> {
    const version = this.cfConfig.wmks.version;
    const basePath = `assets/vmware-wmks/${version}`;
    this.logger.log(LogLevel.DEBUG, "Loading the VMWare HTML Console SDK...", basePath);

    const windowWithWmks = this.window as WmksWindow;
    const jquery = windowWithWmks.jQuery;

    if (!jquery) {
      this.logger.log(LogLevel.WARNING, "jQuery isn't loaded. The VMWare HTML Console SDK requires jQuery and jQuery UI; install them and add them to your app's angular.json \"scripts\" before connecting to a VMWare console.");
    } else if (!jquery.fn?.dialog) {
      this.logger.log(LogLevel.WARNING, "jQuery is loaded but jQuery UI isn't. The VMWare HTML Console SDK registers a jQuery UI widget as it loads; add jquery-ui to your app's angular.json \"scripts\" after jQuery.");
    }

    const link = this.document.createElement("link");
    link.rel = "stylesheet";
    link.href = `${basePath}/css/wmks-all.css`;
    this.document.head.appendChild(link);

    return new Promise<void>((resolve, reject) => {
      const script = this.document.createElement("script");
      script.src = `${basePath}/js/wmks.min.js`;
      script.async = true;

      script.onload = () => {
        const wmks = windowWithWmks.WMKS;

        if (!wmks) {
          const message = `Loaded "${script.src}", but it didn't define a global WMKS object.`;
          this.logger.log(LogLevel.ERROR, message);
          reject(new Error(message));
          return;
        }

        if (typeof wmks.createWMKS !== "function") {
          const message = `Loaded "${script.src}", but it doesn't expose WMKS.createWMKS. This isn't a usable VMWare HTML Console SDK build for ConsoleForge — SDK 2.2.1 and later ship only the jQuery widget ($.widget("wmks.wmks")) and omit the createWMKS factory. Use an SDK build that provides it (2.2.0 does).`;
          this.logger.log(LogLevel.ERROR, message);
          reject(new Error(message));
          return;
        }

        if (wmks.version && wmks.version !== version) {
          this.logger.log(LogLevel.WARNING, `ConsoleForge is configured for WMKS ${version}, but the loaded SDK reports ${wmks.version}.`);
        }

        this.logger.log(LogLevel.DEBUG, "VMWare HTML Console SDK loaded.", wmks.version);
        resolve();
      };

      script.onerror = () => {
        const message = `Couldn't load the VMWare HTML Console SDK from "${script.src}". Is ConsoleForge's "assets" directory copied into your app's assets? (See ConsoleForge's README.)`;
        this.logger.log(LogLevel.ERROR, message);
        reject(new Error(message));
      };

      this.document.head.appendChild(script);
    });
  }
}
