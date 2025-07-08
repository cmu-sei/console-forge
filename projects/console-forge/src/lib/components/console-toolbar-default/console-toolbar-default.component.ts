//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { AfterViewInit, Component, ElementRef, inject, input, model, viewChild, ViewEncapsulation } from '@angular/core';
import { ConsoleToolbarContext } from '../../models/console-toolbar-context';
import { ConsoleToolbarDefaultButtonComponent } from './console-toolbar-default-button/console-toolbar-default-button.component';
import { ConsoleToolbarComponentBase } from '../../models/console-toolbar-component-base';
import { ConsoleForgeConfig } from '../../config/console-forge-config';
import { ConsolePowerRequest } from '../../models/console-power-request';
import { ConsoleToolbarPosition } from '../../models/console-toolbar-position';
import { ConsoleToolbarTheme } from '../../models/console-toolbar-theme';
import { ClipboardService } from '../../services/clipboard/clipboard.service';
import { FormsModule } from '@angular/forms';
import { PicoCssService } from '../../services/pico-css.service';
import { ApplyToolbarThemeDirective } from '../../directives/apply-toolbar-theme.directive';

@Component({
  selector: 'cf-console-toolbar-default',
  imports: [
    FormsModule,
    ApplyToolbarThemeDirective,
    ConsoleToolbarDefaultButtonComponent
  ],
  standalone: true,
  templateUrl: './console-toolbar-default.component.html',
  styleUrl: './console-toolbar-default.component.scss',
  encapsulation: ViewEncapsulation.ShadowDom
})
export class ConsoleToolbarDefaultComponent implements AfterViewInit, ConsoleToolbarComponentBase {
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
  private readonly picoCssService = inject(PicoCssService);
  private readonly hostElement = inject(ElementRef<HTMLElement>);

  async ngAfterViewInit(): Promise<void> {
    // apply pico to this component
    const sheet = await this.picoCssService.loadStyleSheet();

    if (this.hostElement.nativeElement.shadowRoot) {
      this.hostElement.nativeElement.shadowRoot.adoptedStyleSheets = [sheet];
    }
  }

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

  protected handleToolbarThemeChange(theme?: ConsoleToolbarTheme) {
    this.consoleContext().userSettings.patch({ toolbar: { preferTheme: theme } });
  }
}
