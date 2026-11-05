//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';

import { WmksLoaderService } from './wmks-loader.service';
import { ConsoleForgeConfig } from '../../../config/console-forge-config';
import { provideConsoleForge } from '../../../config/provide-console-forge';
import { WINDOW } from '../../../injection/window.injection-token';
import { LogLevel } from '../../../models/log-level';
import { DeepPartial } from '../../object.helpers';
import { LoggerService } from '../../logger.service';

interface FakeElement {
  tagName: string;
  href?: string;
  rel?: string;
  src?: string;
  async?: boolean;
  onload?: () => void;
  onerror?: () => void;
  remove(): void;
}

/** Stands in for the window globals the loader reads; both are `unknown` because the loader must cope with junk. */
interface FakeWindow {
  WMKS?: unknown;
  jQuery?: unknown;
}

interface LoaderTestContext {
  service: WmksLoaderService;
  appended: FakeElement[];
  fakeWindow: FakeWindow;
  logSpy: jasmine.Spy;
}

/**
 * A minimal document whose appended elements are inspectable and whose load handlers can be fired on demand.
 * The real DOM would fetch the script for real, so the failure paths couldn't be exercised.
 */
function configure(config?: DeepPartial<ConsoleForgeConfig>): LoaderTestContext {
  const appended: FakeElement[] = [];
  const createElement = (tag: string): FakeElement => {
    const element: FakeElement = {
      tagName: tag.toUpperCase(),
      remove: () => {
        const at = appended.indexOf(element);

        if (at !== -1) {
          appended.splice(at, 1);
        }
      }
    };

    return element;
  };

  const fakeDocument = {
    createElement,
    head: { appendChild: (element: FakeElement) => { appended.push(element); return element; } }
  } as unknown as Document;
  const fakeWindow: FakeWindow = {};

  TestBed.configureTestingModule({
    providers: [
      provideConsoleForge(config),
      { provide: DOCUMENT, useValue: fakeDocument },
      { provide: WINDOW, useValue: fakeWindow as unknown as Window }
    ]
  });

  // spy before the loader is injected so it receives the spied singleton
  const logSpy = spyOn(TestBed.inject(LoggerService), "log");

  return { service: TestBed.inject(WmksLoaderService), appended, fakeWindow, logSpy };
}

/** The shape the loader requires of a usable SDK build. */
const usableSdk = { version: "2.2.0", createWMKS: () => ({}) };

function warnings(logSpy: jasmine.Spy): string[] {
  return logSpy.calls.allArgs()
    .filter(args => args[0] === LogLevel.WARNING)
    .map(args => String(args[1]));
}

describe('WmksLoaderService', () => {
  it('resolves without injecting anything when a usable SDK is already on window', async () => {
    const ctx = configure();
    ctx.fakeWindow.WMKS = usableSdk;

    await expectAsync(ctx.service.ensureLoaded()).toBeResolved();
    expect(ctx.appended.length).toBe(0);
  });

  it('rejects an SDK already on window which has no createWMKS', async () => {
    const ctx = configure();
    // a build which ships only the jQuery widget, so it has no createWMKS factory to call
    ctx.fakeWindow.WMKS = { version: "2.2.0" };

    await expectAsync(ctx.service.ensureLoaded()).toBeRejectedWithError(/createWMKS/);
    expect(ctx.appended.length).toBe(0);
  });

  it('injects the bundled SDK at the default path', async () => {
    const ctx = configure();
    const loaded = ctx.service.ensureLoaded();

    const script = ctx.appended.find(e => e.tagName === "SCRIPT");
    const link = ctx.appended.find(e => e.tagName === "LINK");
    expect(script?.src).toBe("assets/vmware-wmks/2.2.0/js/wmks.min.js");
    expect(link?.href).toBe("assets/vmware-wmks/2.2.0/css/wmks-all.css");
    expect(link?.rel).toBe("stylesheet");

    ctx.fakeWindow.WMKS = usableSdk;
    script!.onload!();

    await expectAsync(loaded).toBeResolved();
  });

  it('honors a configured assetsPath and version', async () => {
    const ctx = configure({ wmks: { assetsPath: "static/wmks/", version: "2.2.0" } });
    const loaded = ctx.service.ensureLoaded();

    const script = ctx.appended.find(e => e.tagName === "SCRIPT");
    expect(script?.src).toBe("static/wmks/2.2.0/js/wmks.min.js");

    ctx.fakeWindow.WMKS = usableSdk;
    script!.onload!();

    await expectAsync(loaded).toBeResolved();
  });

  it('rejects and cleans up its elements when the script fails to load', async () => {
    const ctx = configure();
    const loaded = ctx.service.ensureLoaded();

    ctx.appended.find(e => e.tagName === "SCRIPT")!.onerror!();

    await expectAsync(loaded).toBeRejectedWithError(/assets/);
    expect(ctx.appended.length).toBe(0);
  });

  it('rejects when the loaded script defines no global WMKS', async () => {
    const ctx = configure();
    const loaded = ctx.service.ensureLoaded();

    ctx.appended.find(e => e.tagName === "SCRIPT")!.onload!();

    await expectAsync(loaded).toBeRejectedWithError(/global WMKS/);
  });

  it('cleans up and does not stack elements when a loaded script is unusable', async () => {
    const ctx = configure();
    const failed = ctx.service.ensureLoaded();

    // a build that loads fine but exposes no createWMKS factory
    ctx.fakeWindow.WMKS = { version: "2.2.0" };
    ctx.appended.find(e => e.tagName === "SCRIPT")!.onload!();

    await expectAsync(failed).toBeRejectedWithError(/createWMKS/);
    expect(ctx.appended.length).toBe(0);

    ctx.fakeWindow.WMKS = undefined;
    const retried = ctx.service.ensureLoaded();

    expect(ctx.appended.filter(e => e.tagName === "SCRIPT").length).toBe(1);
    expect(ctx.appended.filter(e => e.tagName === "LINK").length).toBe(1);

    ctx.fakeWindow.WMKS = usableSdk;
    ctx.appended.find(e => e.tagName === "SCRIPT")!.onload!();
    await expectAsync(retried).toBeResolved();
  });

  it('warns when the loaded SDK version disagrees with the configured one', async () => {
    const ctx = configure();
    const loaded = ctx.service.ensureLoaded();

    ctx.fakeWindow.WMKS = { version: "2.2.5", createWMKS: () => ({}) };
    ctx.appended.find(e => e.tagName === "SCRIPT")!.onload!();

    await expectAsync(loaded).toBeResolved();
    expect(warnings(ctx.logSpy).some(message => message.includes("2.2.5"))).toBeTrue();
  });

  it('injects the SDK once for concurrent callers', async () => {
    const ctx = configure();
    const first = ctx.service.ensureLoaded();
    const second = ctx.service.ensureLoaded();

    expect(ctx.appended.filter(e => e.tagName === "SCRIPT").length).toBe(1);

    ctx.fakeWindow.WMKS = usableSdk;
    ctx.appended.find(e => e.tagName === "SCRIPT")!.onload!();

    await expectAsync(first).toBeResolved();
    await expectAsync(second).toBeResolved();
  });

  it('retries after a failed load without stacking elements', async () => {
    const ctx = configure();
    const failed = ctx.service.ensureLoaded();
    ctx.appended.find(e => e.tagName === "SCRIPT")!.onerror!();
    await expectAsync(failed).toBeRejected();

    const retried = ctx.service.ensureLoaded();

    expect(ctx.appended.filter(e => e.tagName === "SCRIPT").length).toBe(1);
    expect(ctx.appended.filter(e => e.tagName === "LINK").length).toBe(1);

    ctx.fakeWindow.WMKS = usableSdk;
    ctx.appended.find(e => e.tagName === "SCRIPT")!.onload!();

    await expectAsync(retried).toBeResolved();
  });

  it('warns naming jQuery when it is missing, and jQuery UI when only jQuery is present', () => {
    const withoutJquery = configure();
    withoutJquery.service.ensureLoaded();

    expect(warnings(withoutJquery.logSpy).some(message => message.includes("jQuery isn't loaded"))).toBeTrue();

    TestBed.resetTestingModule();
    const withoutJqueryUi = configure();
    // jQuery with neither the widget factory nor .dialog: jQuery UI hasn't registered itself
    withoutJqueryUi.fakeWindow.jQuery = {};
    withoutJqueryUi.service.ensureLoaded();

    expect(warnings(withoutJqueryUi.logSpy).some(message => message.includes("jQuery UI"))).toBeTrue();
  });

  it('warns when the configured assetsPath is absolute', () => {
    const ctx = configure({ wmks: { assetsPath: "/assets/vmware-wmks" } });
    ctx.service.ensureLoaded();

    expect(warnings(ctx.logSpy).some(message => message.includes("<base href>"))).toBeTrue();
    expect(ctx.appended.find(e => e.tagName === "SCRIPT")?.src).toBe("/assets/vmware-wmks/2.2.0/js/wmks.min.js");
  });

  it('warns when an empty assetsPath resolves to a root-absolute path', () => {
    const ctx = configure({ wmks: { assetsPath: "" } });
    ctx.service.ensureLoaded();

    expect(warnings(ctx.logSpy).some(message => message.includes("<base href>"))).toBeTrue();
    expect(ctx.appended.find(e => e.tagName === "SCRIPT")?.src).toBe("/2.2.0/js/wmks.min.js");
  });
});
