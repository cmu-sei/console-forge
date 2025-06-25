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
