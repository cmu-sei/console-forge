//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { Component, ElementRef, inject, input, model, viewChild, ViewEncapsulation } from '@angular/core';
import { ConsoleToolbarContext } from '../../models/console-toolbar-context';
import { ConsoleToolbarDefaultButtonComponent } from './console-toolbar-default-button/console-toolbar-default-button.component';
import { ConsoleToolbarComponentBase } from '../../models/console-toolbar-component-base';
import { ConsoleForgeConfig } from '../../config/console-forge-config';
import { ConsoleToolbarPosition } from '../../models/console-toolbar-position';
import { ConsolePowerRequest } from '../../models/console-power-request';
import { ClipboardService } from '../../services/clipboard/clipboard.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'cf-console-toolbar-default',
  imports: [
    FormsModule,
    ConsoleToolbarDefaultButtonComponent
  ],
  standalone: true,
  templateUrl: './console-toolbar-default.component.html',
  styleUrl: './console-toolbar-default.component.scss',
  // using ViewEncapsulation.ShadowDom lets us apply styling from this component to child components.
  // Critically, we do this do allow PicoCSS to apply to this element's children, but nothing else on the page
  // (because PicoCSS is really aggressive about styling whatever it can on the page). This also stops
  // us from loading PicoCSS if the default toolbar is replaced.
  encapsulation: ViewEncapsulation.ShadowDom
})
export class ConsoleToolbarDefaultComponent implements ConsoleToolbarComponentBase {
  consoleContext = input.required<ConsoleToolbarContext>();

  // component state
  protected isClipboardDialogOpen = false;
  protected isKeyboardDialogOpen = false;
  protected isNetworkDialogOpen = false;
  protected isPowerDialogOpen = false;
  protected isSettingsDialogOpen = false;

  protected keyboardInputText = model<string>("");

  // services and viewkids
  protected readonly cfConfig = inject(ConsoleForgeConfig);
  private readonly clipboardService = inject(ClipboardService);
  protected readonly clipboardTextInput = viewChild<ElementRef>("clipboardText");

  protected handleChangeToolbarPosition(position: ConsoleToolbarPosition) {
    this.consoleContext().userSettings.patch({ toolbar: { dockTo: position } });
  }

  protected handleClipboardDialogOpenClose(isOpen: boolean) {
    this.isClipboardDialogOpen = isOpen;

    if (isOpen) {
      // Is there a better way to ensure .focus works other than timeouting it?
      setTimeout(() => this.clipboardTextInput()?.nativeElement?.focus(), 100);
    }
  }

  protected handleClipboardCopyLastText(text: string) {
    this.clipboardService.copyText(text);
  }

  protected handleNetworkChangeRequested(networkName?: string) {
    if (!networkName) {
      this.consoleContext().networks.disconnectRequested();
    } else {
      this.consoleContext().networks.connectionRequested(networkName);
    }
    this.isNetworkDialogOpen = false;
  }

  protected handleNetworkDialogOpenClose(isOpen: boolean) {
    this.isNetworkDialogOpen = isOpen;
  }

  protected handleRecordToggle() {
    if (this.consoleContext().state.activeConsoleRecording()) {
      this.consoleContext().console.recordScreenStop();
    } else {
      this.consoleContext().console.recordScreenStart();
    }
  }

  protected async handleSendClipboardText(event: Event, text: string) {
    event.preventDefault();

    if (text) {
      await this.consoleContext().clipboard.sendTextToConsoleClipboard(text);
    }

    this.isClipboardDialogOpen = false;
  }

  protected async handlSendKeyboardCtrlAltDel(): Promise<void> {
    await this.consoleContext().console.sendCtrlAltDel();
    this.isKeyboardDialogOpen = false;
  }

  protected async handleSendKeyboardInput(event: Event, text: string) {
    // prevent the form submit default
    event.preventDefault();

    if (text) {
      await this.consoleContext().console.sendKeyboardInput(text);
    }

    this.keyboardInputText.update(() => "");
    this.isKeyboardDialogOpen = false;
  }

  protected async handleSendPowerRequest(request: ConsolePowerRequest): Promise<void> {
    await this.consoleContext().console.sendPowerRequest(request);
    this.isPowerDialogOpen = false;
  }

  protected handleSettingsDialogOpenClose(isOpen: boolean) {
    this.isSettingsDialogOpen = isOpen;
  }

  protected handleSettingsAllowLocalClipboardWrite(allow: boolean) {
    this.consoleContext().userSettings.patch({ console: { allowCopyToLocalClipboard: allow } });
  }

  protected handleSettingsPreserveAspectRatioChange(preserveAspectRatioOnScale: boolean) {
    this.consoleContext().userSettings.patch({ console: { preserveAspectRatioOnScale } });
  }
}
