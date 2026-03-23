//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { TestBed } from '@angular/core/testing';
import { ClipboardService } from './clipboard.service';
import { provideConsoleForge } from '../../config/provide-console-forge';

describe('ClipboardService', () => {
  let service: ClipboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideConsoleForge()]
    });
    service = TestBed.inject(ClipboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
