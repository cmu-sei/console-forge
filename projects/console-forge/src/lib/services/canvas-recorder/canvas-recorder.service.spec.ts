//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { TestBed } from '@angular/core/testing';

import { CanvasRecorderService } from './canvas-recorder.service';

describe('CanvasRecorderService', () => {
  let service: CanvasRecorderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CanvasRecorderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
