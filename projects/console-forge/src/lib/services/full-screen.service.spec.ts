//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { TestBed } from '@angular/core/testing';

import { FullScreenService } from './full-screen.service';

describe('FullScreenService', () => {
  let service: FullScreenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FullScreenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
