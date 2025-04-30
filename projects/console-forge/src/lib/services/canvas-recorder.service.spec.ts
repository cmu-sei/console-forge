import { TestBed } from '@angular/core/testing';

import { CanvasRecorderService } from './canvas-recorder.service';

describe('CanvasRecorderService', () => {
  let service: CanvasRecorderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CanvasRecorderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
