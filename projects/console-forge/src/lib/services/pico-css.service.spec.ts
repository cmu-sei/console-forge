// Copyright 2026 Carnegie Mellon University. All rights reserved.
// Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.

import { TestBed } from '@angular/core/testing';
import { PicoCssService } from './pico-css.service';

describe('PicoCssService', () => {
  let service: PicoCssService;
  let fetchStyle: jasmine.Spy<typeof fetch>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PicoCssService);
    fetchStyle = spyOn(window, 'fetch');
  });

  it('shares one request and stylesheet across concurrent and later callers', async () => {
    fetchStyle.and.resolveTo(new Response('body { color: red; }'));
    const first = service.loadStyleSheet();
    expect(service.loadStyleSheet()).toBe(first);
    const sheet = await first;
    expect(sheet.cssRules.length).toBe(1);
    expect(service.loadStyleSheet()).toBe(first);
    expect(await service.loadStyleSheet()).toBe(sheet);
    expect(fetchStyle).toHaveBeenCalledOnceWith('assets/pico.min.css');
  });

  it('rejects an HTTP error without caching its response as CSS', async () => {
    fetchStyle.and.resolveTo(new Response('Unavailable', { status: 503 }));
    await expectAsync(service.loadStyleSheet()).toBeRejectedWithError('Could not load Pico stylesheet (503).');

    fetchStyle.and.resolveTo(new Response('body { color: red; }'));
    expect((await service.loadStyleSheet()).cssRules.length).toBe(1);
    expect(fetchStyle).toHaveBeenCalledTimes(2);
  });

});
