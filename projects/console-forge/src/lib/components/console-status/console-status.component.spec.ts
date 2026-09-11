//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsoleStatusComponent } from './console-status.component';
import { provideConsoleForge } from '../../config/provide-console-forge';
import { UserSettingsService } from '../../services/user-settings.service';
import { PicoCssService } from '../../services/pico-css.service';

describe('ConsoleStatusComponent', () => {
  let component: ConsoleStatusComponent;
  let fixture: ComponentFixture<ConsoleStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsoleStatusComponent],
      providers: [provideConsoleForge()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsoleStatusComponent);
    component = fixture.componentInstance;
    TestBed.inject(UserSettingsService).patch({ toolbar: { preferTheme: "light" } });
    fixture.detectChanges();
    await TestBed.inject(PicoCssService).loadStyleSheet();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the power-on button instead of the disconnected banner when the machine is off', () => {
    fixture.componentRef.setInput("status", "disconnected");
    fixture.componentRef.setInput("vmPowerState", "off");
    fixture.detectChanges();

    expect((fixture.nativeElement.shadowRoot as ShadowRoot).querySelector(".power-on-button")).toBeTruthy();
    expect((fixture.nativeElement.shadowRoot as ShadowRoot).querySelector(".disconnected-banner")).toBeNull();
  });

  it('emits a request and lets the application control progress and recovery', () => {
    let powerOnRequestCount = 0;
    component.powerOnRequest.subscribe(() => powerOnRequestCount++);

    fixture.componentRef.setInput("vmPowerState", "off");
    fixture.detectChanges();

    ((fixture.nativeElement.shadowRoot as ShadowRoot).querySelector(".power-on-button") as HTMLButtonElement).click();
    fixture.componentRef.setInput("vmActivity", { kind: "starting", status: "active" });
    fixture.detectChanges();

    expect(powerOnRequestCount).toBe(1);
    expect((fixture.nativeElement.shadowRoot as ShadowRoot).querySelector("progress")).toBeTruthy();
    expect((fixture.nativeElement.shadowRoot as ShadowRoot).querySelector(".power-on-button")).toBeNull();
    fixture.componentRef.setInput("vmActivity", { kind: "starting", status: "failed", message: "Start failed" });
    fixture.detectChanges();
    expect((fixture.nativeElement.shadowRoot as ShadowRoot).querySelector("progress")).toBeNull();
    expect((fixture.nativeElement.shadowRoot as ShadowRoot).querySelector("button")).toBeTruthy();
  });

  it('still renders the disconnected banner when the machine power state is unknown', () => {
    fixture.componentRef.setInput("status", "disconnected");
    fixture.componentRef.setInput("vmPowerState", "unknown");
    fixture.detectChanges();

    expect((fixture.nativeElement.shadowRoot as ShadowRoot).querySelector(".disconnected-banner")).toBeTruthy();
    expect((fixture.nativeElement.shadowRoot as ShadowRoot).querySelector(".power-on-button")).toBeNull();
  });

  it('shows migration on an off VM without another Power On button', () => {
    fixture.componentRef.setInput("vmPowerState", "off");
    fixture.componentRef.setInput("vmActivity", { kind: "migrating", status: "active" });
    fixture.detectChanges();
    const shadow = fixture.nativeElement.shadowRoot as ShadowRoot;
    expect(shadow.textContent).toContain("Migrating VM");
    expect(shadow.querySelector("button")).toBeNull();
    expect(shadow.querySelector("progress")?.getAttribute("aria-label")).toContain("Migrating VM");
  });

  it('keeps a connected console visible despite stale activity', () => {
    fixture.componentRef.setInput("status", "connected");
    fixture.componentRef.setInput("vmPowerState", "off");
    fixture.componentRef.setInput("vmActivity", { kind: "migrating", status: "active" });
    fixture.detectChanges();
    expect((fixture.nativeElement.shadowRoot as ShadowRoot).querySelector(".power-off-overlay")).toBeNull();
  });

  it('shows suspended state without offering Power On', () => {
    fixture.componentRef.setInput("vmPowerState", "suspended");
    fixture.detectChanges();
    const shadow = fixture.nativeElement.shadowRoot as ShadowRoot;
    expect(shadow.textContent).toContain("VM suspended");
    expect(shadow.querySelector("button")).toBeNull();
  });

  it('paints the overlay with Light/Dark/Auto using the real Pico stylesheet', () => {
    const settings = TestBed.inject(UserSettingsService);
    fixture.componentRef.setInput("vmPowerState", "off");
    fixture.detectChanges();
    const surface = (fixture.nativeElement.shadowRoot as ShadowRoot).querySelector(".status-content")!;
    const light = getComputedStyle(surface).backgroundColor;
    expect(light).not.toBe("rgba(0, 0, 0, 0)");
    settings.patch({ toolbar: { preferTheme: "dark" } });
    fixture.detectChanges();
    const dark = getComputedStyle(surface).backgroundColor;
    expect(dark).not.toBe(light);
    expect(dark).not.toBe("rgba(0, 0, 0, 0)");
    settings.patch({ toolbar: { preferTheme: undefined } });
    fixture.detectChanges();
    expect(surface.hasAttribute("data-theme")).toBeFalse();
    expect(getComputedStyle(surface).backgroundColor)
      .toBe(matchMedia("(prefers-color-scheme: dark)").matches ? dark : light);
  });
});
