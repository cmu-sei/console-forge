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
