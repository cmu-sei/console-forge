//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { TestBed } from '@angular/core/testing';

import { CanvasRecorderService } from './canvas-recorder.service';
import { provideConsoleForge } from '../../config/provide-console-forge';

describe('CanvasRecorderService', () => {
  let service: CanvasRecorderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideConsoleForge()]
    });
    service = TestBed.inject(CanvasRecorderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
