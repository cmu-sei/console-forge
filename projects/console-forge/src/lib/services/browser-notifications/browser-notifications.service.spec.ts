//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { TestBed } from '@angular/core/testing';
import { BrowserNotificationsService } from './browser-notifications.service';

describe('BrowserNotificationsService', () => {
  let service: BrowserNotificationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BrowserNotificationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
