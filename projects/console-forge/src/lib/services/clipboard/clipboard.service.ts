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
    // We don't have any cases where we autocopy blobs for now, so we just pass false here
    return this.writeToClipboard(new ClipboardItem({ [blob.type]: blob }), false);
  }

  /**
   * Copy text to the local user's clipboard.
   * @param text Copy this text content to the local user's clipboard
   * @param isAutoCopy Express whether this copy operation is something manually initiated by the user, or is an automatic copy triggered by, for example, a console client's clipboard events.
   * @returns 
   */
  public copyText(text: string, isAutoCopy: boolean) {
    return this.writeToClipboard(getClipboardItemFromText(text), isAutoCopy);
  }

  public async readText() {
    const clipboard = this.getClipboard();
    if (!clipboard) {
      throw new Error("Can't access the clipboard to read text");
    }

    return clipboard.readText();
  }

  private getClipboard(): Clipboard | undefined {
    if (this.cfConfig.disabledFeatures.clipboard) {
      throw new Error("ConsoleForge's clipboard access has been disabled.");
    }

    return this.document?.defaultView?.navigator?.clipboard;
  }

  private writeToClipboard(item: ClipboardItem, isAutoCopy: boolean) {
    const clipboard = this.getClipboard();
    if (!clipboard) {
      throw new Error("Can't access the clipboard to write content");
    }

    if (isAutoCopy && !this.userSettings.settings().console.allowCopyToLocalClipboard) {
      throw new Error("User has disabled ConsoleForge's access to their local clipboard.");
    }

    clipboard.write([item]);
    this._localClipboardContentWritten.update(() => item);
  }
}
