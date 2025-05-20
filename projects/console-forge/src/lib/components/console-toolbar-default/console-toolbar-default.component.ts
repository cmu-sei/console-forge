import { Component, ElementRef, inject, input, viewChild } from '@angular/core';
import { ConsoleToolbarContext } from '../../models/console-toolbar-context';
import { ConsoleToolbarDefaultButtonComponent } from './console-toolbar-default-button/console-toolbar-default-button.component';
import { ConsoleToolbarComponentBase } from '../../models/console-toolbar-component-base';
import { ConsoleForgeConfig } from '../../config/console-forge-config';
import { ConsoleToolbarPosition } from '../../models/console-toolbar-position';
import { UserSettingsService } from '../../services/user-settings.service';
import { ConsoleUserSettings } from '../../models/console-user-settings';
import { ConsolePowerRequest } from '../../models/console-power-request';

@Component({
  selector: 'cf-console-toolbar-default',
  imports: [ConsoleToolbarDefaultButtonComponent],
  standalone: true,
  templateUrl: './console-toolbar-default.component.html',
  styleUrl: './console-toolbar-default.component.scss'
})
export class ConsoleToolbarDefaultComponent implements ConsoleToolbarComponentBase {
  consoleContext = input.required<ConsoleToolbarContext>();

  // component state
  protected isClipboardDialogOpen = false;
  protected isNetworkDialogOpen = false;
  protected isPowerDialogOpen = false;
  protected isSettingsDialogOpen = false;

  // services and viewkids
  protected readonly cfConfig = inject(ConsoleForgeConfig);
  protected readonly clipboardTextInput = viewChild<ElementRef>("clipboardText");
  protected readonly userSettings = inject(UserSettingsService);

  protected handleChangeToolbarPosition(position: ConsoleToolbarPosition) {
    this.userSettings.update({ toolbar: { dockTo: position } });
  }

  protected handleClipboardDialogOpenClose(isOpen: boolean) {
    this.isClipboardDialogOpen = isOpen;

    if (isOpen) {
      // Is there a better way to ensure .focus works other than timeouting it?
      setTimeout(() => this.clipboardTextInput()?.nativeElement?.focus(), 100);
    }
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

  protected handleSendClipboardText(event: Event, text: string) {
    event.preventDefault();

    if (text) {
      this.consoleContext().console.sendTextToClipboard(text);
    }

    this.isClipboardDialogOpen = false;
  }

  protected async handleSendPowerRequest(request: ConsolePowerRequest): Promise<void> {
    await this.consoleContext().console.sendPowerRequest(request);
    this.isPowerDialogOpen = false;
  }

  protected handleSettingsDialogOpenClose(isOpen: boolean) {
    this.isSettingsDialogOpen = isOpen;
  }

  protected handleSettingsChanged(settings: Partial<ConsoleUserSettings>) {
    this.consoleContext().settings.update(settings);
  }

  protected handleSettingsAllowLocalClipboardWrite(allow: boolean) {
    const currentSettings = this.consoleContext().settings.current();
    currentSettings.console.allowCopyToLocalClipboard = allow;
    this.consoleContext().settings.update(currentSettings);
  }

  protected handleSettingsPreserveAspectRatioChange(preserveAspectRatioOnScale: boolean) {
    // do a simple copy from the current settings (spread doesn't work here because of the hierarchy of the object, maybe a sign of something amiss)
    const currentSettings = this.consoleContext().settings.current();
    currentSettings.console.preserveAspectRatioOnScale = preserveAspectRatioOnScale;
    this.consoleContext().settings.update(currentSettings);
  }
}
