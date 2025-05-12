import { TestBed } from '@angular/core/testing';
import { BrowserNotificationsService } from './browser-notifications.service';

describe('BrowserNotificationsService', () => {
  let service: BrowserNotificationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BrowserNotificationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
