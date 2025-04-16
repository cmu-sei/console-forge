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
