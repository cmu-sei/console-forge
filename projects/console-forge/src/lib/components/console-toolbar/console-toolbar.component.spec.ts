//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsoleToolbarComponent } from './console-toolbar.component';
import { provideConsoleForge } from '../../config/provide-console-forge';
import { CanvasService } from '../../services/canvas.service';

describe('ConsoleToolbarComponent', () => {
  let component: ConsoleToolbarComponent;
  let fixture: ComponentFixture<ConsoleToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsoleToolbarComponent],
      providers: [provideConsoleForge(), CanvasService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsoleToolbarComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
