//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { TestBed } from '@angular/core/testing';

import { VmWareConsoleClientService } from './vmware-console-client.service';

describe('VmWareConsoleClientService', () => {
  let service: VmWareConsoleClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VmWareConsoleClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
