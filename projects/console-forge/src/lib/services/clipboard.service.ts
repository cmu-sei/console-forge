//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ClipboardService {
  private document = inject(DOCUMENT);

  public copyBlob(blob: Blob) {
    const clipboard = this.getClipboard();
    if (!clipboard) {
      throw new Error("Can't access the clipboard to copy blob");
    }

    return clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
  }

  public async copyText(text: string) {
    const clipboard = this.getClipboard();
    if (!clipboard) {
      throw new Error(`Can't access the clipboard to copy text "${text}"`);
    }

    clipboard.writeText(text);
  }

  public async readText() {
    const clipboard = this.getClipboard();
    if (!clipboard) {
      throw new Error("Can't access the clipboard to read text");
    }

    clipboard.readText();
  }

  private getClipboard(): Clipboard | undefined {
    return this.document?.defaultView?.navigator?.clipboard;
  }
}
