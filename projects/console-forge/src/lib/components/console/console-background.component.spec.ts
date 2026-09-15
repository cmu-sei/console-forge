//  ===BEGIN LICENSE===
//  Copyright 2026 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConsoleComponent } from './console.component';
import { ConsoleConnectionStatus } from '../../models/console-connection-status';
import { provideConsoleForge } from '../../config/provide-console-forge';
import { PicoCssService } from '../../services/pico-css.service';
import { UserSettingsService } from '../../services/user-settings.service';
import { ConsoleClientFactoryService } from '../../services/console-clients/console-client-factory.service';
import { ConsoleClientService } from '../../services/console-clients/console-client.service';

describe('Console background', () => {
  let fixture: ComponentFixture<ConsoleComponent>;
  let surface: HTMLElement;
  let overlay: HTMLElement;
  const status = signal<ConsoleConnectionStatus>('disconnected');

  async function create(background?: string) {
    TestBed.configureTestingModule({
      imports: [ConsoleComponent],
      providers: [provideZonelessChangeDetection(), provideConsoleForge(
        background ? { consoleBackgroundStyle: background } : undefined
      )]
    });
    // The background must work even before the asynchronously fetched Pico stylesheet arrives.
    spyOn(TestBed.inject(PicoCssService), 'loadStyleSheet').and.returnValue(new Promise<CSSStyleSheet>(() => {}));
    TestBed.inject(UserSettingsService).patch({ toolbar: { preferTheme: 'light' } });
    status.set('disconnected');
    const client = {
      connectionStatus: status,
      supportedFeatures: signal({}),
      consoleClipboardUpdated: signal(''),
      connect: () => Promise.resolve(),
      dispose: () => Promise.resolve()
    } as unknown as ConsoleClientService;
    spyOn(TestBed.inject(ConsoleClientFactoryService), 'get').and.returnValue(client);
    fixture = TestBed.createComponent(ConsoleComponent);
    fixture.componentRef.setInput('autoConnect', false);
    fixture.componentRef.setInput('config', { url: 'wss://example.test/console', consoleClientType: 'vnc' });
    fixture.componentRef.setInput('toolbarDisabled', true);
    fixture.componentRef.setInput('vmPowerState', 'off');
    await fixture.whenStable();
    await fixture.componentInstance.connect({ url: 'wss://example.test/console', consoleClientType: 'vnc' });
    await fixture.whenStable();
    surface = fixture.nativeElement.querySelector('.console-host-container');
    overlay = fixture.nativeElement.querySelector('cf-console-status').shadowRoot.querySelector('.status-content');
  }

  it('shares contrasting Light/Dark/Auto colors through startup and connection, even before Pico loads', async () => {
    await create();
    for (const theme of ['light', 'dark', undefined] as const) {
      TestBed.inject(UserSettingsService).patch({ toolbar: { preferTheme: theme } });
      const expected = (theme === 'dark' || (!theme && matchMedia('(prefers-color-scheme: dark)').matches))
        ? 'rgb(40, 40, 40)' : 'rgb(238, 240, 243)';
      status.set('disconnected');
      fixture.componentRef.setInput('vmActivity', undefined);
      await fixture.whenStable();
      expect(getComputedStyle(surface).backgroundColor).toBe(expected);
      expect(getComputedStyle(overlay).backgroundColor).toBe(expected);
      expect(surface.getAttribute('data-theme')).toBe(theme ?? null);
      for (const kind of ['starting', 'migrating', 'busy'] as const) {
        fixture.componentRef.setInput('vmActivity', { kind, status: 'active' });
        await fixture.whenStable();
        expect(getComputedStyle(overlay).backgroundColor).toBe(expected);
      }
      for (const state of ['connecting', 'connected'] as const) {
        status.set(state);
        await fixture.whenStable();
        expect(getComputedStyle(surface).backgroundColor).toBe(expected);
      }
      expect(overlay.querySelector('.power-off-overlay')).toBeNull();
    }
  });

  it('honors an explicit application background on both surfaces', async () => {
    await create('rgb(24, 48, 72)');
    for (const theme of ['light', 'dark'] as const) {
      TestBed.inject(UserSettingsService).patch({ toolbar: { preferTheme: theme } });
      await fixture.whenStable();
      expect(getComputedStyle(surface).backgroundColor).toBe('rgb(24, 48, 72)');
      expect(getComputedStyle(overlay).backgroundColor).toBe('rgb(24, 48, 72)');
    }
  });
});
