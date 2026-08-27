//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsoleStatusComponent } from './console-status.component';
import { provideConsoleForge } from '../../config/provide-console-forge';

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
    fixture.detectChanges();
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

  it('emits a power on request and shows progress when the power-on button is clicked', () => {
    let powerOnRequestCount = 0;
    component.powerOnRequest.subscribe(() => powerOnRequestCount++);

    fixture.componentRef.setInput("vmPowerState", "off");
    fixture.detectChanges();

    ((fixture.nativeElement.shadowRoot as ShadowRoot).querySelector(".power-on-button") as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(powerOnRequestCount).toBe(1);
    expect((fixture.nativeElement.shadowRoot as ShadowRoot).querySelector("progress")).toBeTruthy();
    expect((fixture.nativeElement.shadowRoot as ShadowRoot).querySelector(".power-on-button")).toBeNull();
  });

  it('still renders the disconnected banner when the machine power state is unknown', () => {
    fixture.componentRef.setInput("status", "disconnected");
    fixture.componentRef.setInput("vmPowerState", "unknown");
    fixture.detectChanges();

    expect((fixture.nativeElement.shadowRoot as ShadowRoot).querySelector(".disconnected-banner")).toBeTruthy();
    expect((fixture.nativeElement.shadowRoot as ShadowRoot).querySelector(".power-on-button")).toBeNull();
  });
});
