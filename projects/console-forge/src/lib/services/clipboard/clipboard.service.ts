//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { DOCUMENT } from '@angular/common';
import { inject, Injectable, signal } from '@angular/core';
import { ConsoleForgeConfig } from '../../config/console-forge-config';
import { UserSettingsService } from '../user-settings.service';
import { getClipboardItemFromText } from './clipboard.helpers';

@Injectable({ providedIn: 'root' })
export class ClipboardService {
  private readonly cfConfig = inject(ConsoleForgeConfig);
  private readonly document = inject(DOCUMENT);
  private readonly userSettings = inject(UserSettingsService);

  private _localClipboardContentWritten = signal<ClipboardItem | undefined>(undefined);
  public localClipboardContentWritten = this._localClipboardContentWritten.asReadonly();

  public copyBlob(blob: Blob) {
    return this.writeToClipboard(new ClipboardItem({ [blob.type]: blob }));
  }

  public copyText(text: string) {
    return this.writeToClipboard(getClipboardItemFromText(text));
  }

  public async readText() {
    const clipboard = this.getClipboard();
    if (!clipboard) {
      throw new Error("Can't access the clipboard to read text");
    }

    return clipboard.readText();
  }

  private getClipboard(): Clipboard | undefined {
    if (!this.cfConfig.enableClipboard) {
      throw new Error("ConsoleForge's clipboard access has been disabled.");
    }

    return this.document?.defaultView?.navigator?.clipboard;
  }

  private writeToClipboard(item: ClipboardItem) {
    const clipboard = this.getClipboard();
    if (!clipboard) {
      throw new Error("Can't access the clipboard to write content");
    }

    if (!this.userSettings.settings().console.allowCopyToLocalClipboard) {
      throw new Error("User has disabled ConsoleForge's access to their local clipboard.");
    }

    clipboard.write([item]);
    this._localClipboardContentWritten.update(() => item);
  }
}
