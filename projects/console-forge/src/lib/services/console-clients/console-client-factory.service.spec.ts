//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { TestBed } from '@angular/core/testing';

import { ConsoleClientFactoryService } from './console-client-factory.service';

describe('ConsoleClientFactoryService', () => {
  let service: ConsoleClientFactoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConsoleClientFactoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
