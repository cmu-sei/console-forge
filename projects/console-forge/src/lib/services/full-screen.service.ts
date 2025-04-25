import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FullScreenService {
  private doc = inject(DOCUMENT);

  public readonly isAvailable = signal(this.doc.fullscreenEnabled);

  constructor() {
    this.doc.addEventListener("fullscreenchange", () => {
      this.isAvailable.update(() => this.doc.fullscreenEnabled && !this.doc.fullscreenElement);
    });
    this.doc.addEventListener("fullscreenerror", () => {
      this.isAvailable.update(() => this.doc.fullscreenEnabled && !this.doc.fullscreenElement);
    });
  }

  public async exitFullscreen(): Promise<void> {
    return this.doc.exitFullscreen();
  }

  public async tryFullscreen(element: Element): Promise<void> {
    return element.requestFullscreen();
  }
}
