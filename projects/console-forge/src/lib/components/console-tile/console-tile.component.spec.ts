// Copyright 2026 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsoleTileComponent } from './console-tile.component';
import { provideConsoleForge } from '../../config/provide-console-forge';

describe('ConsoleTileComponent', () => {
  let component: ConsoleTileComponent;
  let fixture: ComponentFixture<ConsoleTileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsoleTileComponent],
      providers: [provideConsoleForge()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsoleTileComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
