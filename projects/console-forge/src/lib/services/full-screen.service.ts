//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FullScreenService {
  private doc = inject(DOCUMENT);

  private readonly _isAvailable = signal(this.doc.fullscreenEnabled);
  public readonly isAvailable = this._isAvailable.asReadonly();

  private readonly _isActive = signal(false);
  public readonly isActive = this._isActive.asReadonly();

  constructor() {
    this.doc.addEventListener("fullscreenchange", () => {
      this._isAvailable.update(() => this.doc.fullscreenEnabled && !this.doc.fullscreenElement);
      this._isActive.update(() => !!this.doc.fullscreenElement);
    });
    this.doc.addEventListener("fullscreenerror", () => {
      this._isAvailable.update(() => this.doc.fullscreenEnabled && !this.doc.fullscreenElement);
    });
  }

  public async exitFullscreen(): Promise<void> {
    return this.doc.exitFullscreen();
  }

  public async tryFullscreen(element: Element): Promise<void> {
    return element.requestFullscreen({ navigationUI: "hide" });
  }
}
