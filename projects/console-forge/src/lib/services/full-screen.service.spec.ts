//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { TestBed } from '@angular/core/testing';

import { FullScreenService } from './full-screen.service';
import { provideConsoleForge } from '../config/provide-console-forge';

describe('FullScreenService', () => {
  let service: FullScreenService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideConsoleForge()]
    });
    service = TestBed.inject(FullScreenService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
