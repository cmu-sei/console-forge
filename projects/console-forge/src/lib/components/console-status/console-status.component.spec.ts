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

  it('keeps a connected console visible despite stale activity', () => {
    fixture.componentRef.setInput("status", "connected");
    fixture.componentRef.setInput("vmPowerState", "off");
    fixture.componentRef.setInput("vmActivity", { kind: "migrating", status: "active" });
    fixture.detectChanges();
    expect((fixture.nativeElement.shadowRoot as ShadowRoot).querySelector(".power-off-overlay")).toBeNull();
  });

});
