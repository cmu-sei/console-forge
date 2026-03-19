//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { TestBed } from '@angular/core/testing';
import { BrowserNotificationsService } from './browser-notifications.service';
import { provideConsoleForge } from '../../config/provide-console-forge';

describe('BrowserNotificationsService', () => {
  let service: BrowserNotificationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideConsoleForge()]
    });
    service = TestBed.inject(BrowserNotificationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
