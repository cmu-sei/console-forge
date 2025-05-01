import { Component, ElementRef, inject, input, viewChild } from '@angular/core';
import { ConsoleToolbarContext } from '../../models/console-toolbar-context';
import { ConsoleToolbarDefaultButtonComponent } from './console-toolbar-default-button/console-toolbar-default-button.component';
import { ConsoleToolbarComponentBase } from '../../models/console-toolbar-component-base';
import { ConsoleForgeConfig } from '../../config/console-forge-config';
import { ConsoleToolbarPosition } from '../../models/console-toolbar-position';

@Component({
  selector: 'cf-console-toolbar-default',
  imports: [ConsoleToolbarDefaultButtonComponent],
  standalone: true,
  templateUrl: './console-toolbar-default.component.html',
  styleUrl: './console-toolbar-default.component.scss',
  // host: {
  //   '[class.horizontal]': 'this.consoleContext().toolbar.orientation() == "top"',
  // }
})
export class ConsoleToolbarDefaultComponent implements ConsoleToolbarComponentBase {
  consoleContext = input.required<ConsoleToolbarContext>();

  protected isClipboardDialogOpen = false;
  protected isDockDialogOpen = false;
  protected isNetworkDialogOpen = false;
  protected isPowerDialogOpen = false;
  protected readonly cfConfig = inject(ConsoleForgeConfig);
  protected readonly clipboardTextInput = viewChild<ElementRef>("clipboardText");

  protected handleChangeToolbarPosition(position: ConsoleToolbarPosition) {
    this.consoleContext().toolbar.dockTo(position);
    this.isDockDialogOpen = false;
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

  protected handlePowerDialogOpenClose(isOpen: boolean) {
    this.isPowerDialogOpen = isOpen;
  }

  protected async handleRecordRequest() {
    await this.consoleContext().console.recordScreen();
  }

  protected handleSendClipboardText(event: Event, text: string) {
    event.preventDefault();
    this.consoleContext().console.sendTextToClipboard(text);
    this.isClipboardDialogOpen = false;
  }
}
