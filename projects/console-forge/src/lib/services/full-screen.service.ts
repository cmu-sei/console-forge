import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FullScreenService {
  private doc = inject(DOCUMENT);

  private readonly _isAvailable = signal(this.doc.fullscreenEnabled);
  public readonly isAvailable = this._isAvailable.asReadonly();

  constructor() {
    this.doc.addEventListener("fullscreenchange", () => {
      this._isAvailable.update(() => this.doc.fullscreenEnabled && !this.doc.fullscreenElement);
    });
    this.doc.addEventListener("fullscreenerror", () => {
      this._isAvailable.update(() => this.doc.fullscreenEnabled && !this.doc.fullscreenElement);
    });
  }

  public async exitFullscreen(): Promise<void> {
    return this.doc.exitFullscreen();
  }

  public async tryFullscreen(element: Element): Promise<void> {
    return element.requestFullscreen();
  }
}
