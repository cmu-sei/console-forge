import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PicoCssService {
  private sheet?: CSSStyleSheet;
  private loading?: Promise<void>;

  loadStyleSheet(): Promise<CSSStyleSheet | undefined> {
    if (this.sheet) return Promise.resolve(this.sheet);

    if (!this.loading) {
      this.loading = fetch('assets/pico.min.css')
        .then(r => r.text())
        .then(css => {
          const sheet = new CSSStyleSheet();
          sheet.replaceSync(css);
          this.sheet = sheet;
        });
    }

    return this.loading.then(() => this.sheet);
  }
}
