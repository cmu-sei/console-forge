import { TestBed } from '@angular/core/testing';

import { VncConsoleClientService } from './vnc-console-client.service';
import { provideConsoleForge } from '@/config/provide-console-forge';

describe('VncConsoleClientService', () => {
  let service: VncConsoleClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideConsoleForge()]
    });
    service = TestBed.inject(VncConsoleClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
