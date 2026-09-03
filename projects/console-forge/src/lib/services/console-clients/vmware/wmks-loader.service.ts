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
  widget?: unknown;
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
    const existing = (this.window as WmksWindow).WMKS;

    if (existing) {
      const problem = this.validateSdk(existing, "The VMWare HTML Console SDK already on window.WMKS");
      return problem ? Promise.reject(problem) : Promise.resolve();
    }

    if (!this.loading) {
      this.loading = this.load().catch(err => {
        this.loading = undefined;
        throw err;
      });
    }

    return this.loading;
  }

  /** Returns an error describing why `wmks` isn't a usable SDK build, or undefined if it is. */
  private validateSdk(wmks: WMKS | undefined, source: string): Error | undefined {
    if (!wmks) {
      return this.fail(`${source} didn't define a global WMKS object.`);
    }

    if (typeof wmks.createWMKS !== "function") {
      return this.fail(`${source} doesn't expose WMKS.createWMKS. This isn't a usable VMWare HTML Console SDK build for ConsoleForge — some SDK builds ship only the jQuery widget ($.widget("wmks.wmks")) and omit the createWMKS factory. Use a build which provides createWMKS.`);
    }

    if (wmks.version && wmks.version !== this.cfConfig.wmks.version) {
      this.logger.log(LogLevel.WARNING, `ConsoleForge is configured for WMKS ${this.cfConfig.wmks.version}, but the loaded SDK reports ${wmks.version}.`);
    }

    return undefined;
  }

  private fail(message: string): Error {
    this.logger.log(LogLevel.ERROR, message);
    return new Error(message);
  }

  private load(): Promise<void> {
    const assetsPath = this.cfConfig.wmks.assetsPath;

    // the URLs below are relative, so the browser resolves them against the document's <base href>. That's what lets an
    // app deployed under a path prefix find its assets. A single leading slash defeats that; "//host/..." and
    // "https://host/..." are deliberate CDN choices, so leave those alone.
    if (assetsPath.startsWith("/") && !assetsPath.startsWith("//")) {
      this.logger.log(LogLevel.WARNING, `The configured WMKS assetsPath "${assetsPath}" is absolute, so it ignores your app's <base href>. Apps deployed under a sub-path should use a relative path like "assets/vmware-wmks".`);
    }

    const basePath = `${assetsPath.replace(/\/+$/, "")}/${this.cfConfig.wmks.version}`;
    this.logger.log(LogLevel.DEBUG, "Loading the VMWare HTML Console SDK...", basePath);

    const windowWithWmks = this.window as WmksWindow;
    const jquery = windowWithWmks.jQuery;

    if (!jquery) {
      this.logger.log(LogLevel.WARNING, "jQuery isn't loaded. The VMWare HTML Console SDK requires jQuery and jQuery UI; install them and add them to your app's angular.json \"scripts\" before connecting to a VMWare console.");
    } else if (typeof jquery.widget !== "function" || !jquery.fn?.dialog) {
      this.logger.log(LogLevel.WARNING, "jQuery is loaded but jQuery UI isn't. The VMWare HTML Console SDK registers a jQuery UI widget as it loads; add jquery-ui to your app's angular.json \"scripts\" after jQuery.");
    }

    return new Promise<void>((resolve, reject) => {
      const link = this.document.createElement("link");
      link.rel = "stylesheet";
      link.href = `${basePath}/css/wmks-all.css`;
      this.document.head.appendChild(link);

      const script = this.document.createElement("script");
      script.src = `${basePath}/js/wmks.min.js`;
      script.async = true;

      script.onload = () => {
        const problem = this.validateSdk(windowWithWmks.WMKS, `The script loaded from "${script.src}"`);

        if (problem) {
          reject(problem);
          return;
        }

        this.logger.log(LogLevel.DEBUG, "VMWare HTML Console SDK loaded.", windowWithWmks.WMKS?.version);
        resolve();
      };

      script.onerror = () => {
        // drop both elements so a retry doesn't stack a second stylesheet/script pair on the document
        link.remove();
        script.remove();
        reject(this.fail(`Couldn't load the VMWare HTML Console SDK from "${script.src}". Is ConsoleForge's "assets" directory copied into your app's assets? (See ConsoleForge's README.)`));
      };

      this.document.head.appendChild(script);
    });
  }
}
