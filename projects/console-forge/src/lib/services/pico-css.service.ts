// Copyright 2026 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PicoCssService {
  private loading?: Promise<CSSStyleSheet>;

  loadStyleSheet(): Promise<CSSStyleSheet> {
    return this.loading ??= fetch('assets/pico.min.css')
        .then(r => {
          if (!r.ok) throw new Error(`Could not load Pico stylesheet (${r.status}).`);
          return r.text();
        })
        .then(css => {
          const sheet = new CSSStyleSheet();
          sheet.replaceSync(css);
          return sheet;
        })
        .catch(error => {
          this.loading = undefined;
          throw error;
        });
  }
}
