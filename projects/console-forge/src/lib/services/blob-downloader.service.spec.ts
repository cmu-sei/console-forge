//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { TestBed } from '@angular/core/testing';

import { BlobDownloaderService } from './blob-downloader.service';

describe('BlobDownloaderService', () => {
  let service: BlobDownloaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BlobDownloaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
