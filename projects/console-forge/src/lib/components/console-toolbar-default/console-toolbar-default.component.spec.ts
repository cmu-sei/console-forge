//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsoleToolbarDefaultComponent } from './console-toolbar-default.component';
import { provideConsoleForge } from '../../config/provide-console-forge';

describe('ConsoleToolbarDefaultComponent', () => {
  let component: ConsoleToolbarDefaultComponent;
  let fixture: ComponentFixture<ConsoleToolbarDefaultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsoleToolbarDefaultComponent],
      providers: [provideConsoleForge()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsoleToolbarDefaultComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
