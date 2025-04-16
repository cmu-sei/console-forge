import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ClipboardService {
  private document = inject(DOCUMENT);

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
