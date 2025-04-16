import { TestBed } from '@angular/core/testing';

import { LoggerService } from './logger.service';
import { provideConsoleForge } from '@/config/provide-console-forge';

describe('LoggerService', () => {
  let service: LoggerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideConsoleForge()]
    });
    service = TestBed.inject(LoggerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
