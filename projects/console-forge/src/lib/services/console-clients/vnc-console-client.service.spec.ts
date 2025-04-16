import { TestBed } from '@angular/core/testing';

import { VncConsoleClientService } from './vnc-console-client.service';

describe('VncConsoleClientService', () => {
  let service: VncConsoleClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VncConsoleClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
