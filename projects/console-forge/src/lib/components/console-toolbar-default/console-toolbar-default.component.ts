import { Component, ElementRef, input, viewChild } from '@angular/core';
import { ConsoleToolbarContext } from '../../models/console-toolbar-context';
import { ConsoleToolbarDefaultButtonComponent } from './console-toolbar-default-button/console-toolbar-default-button.component';
import { ConsoleToolbarComponentBase } from '../../models/console-toolbar-component-base';

@Component({
  selector: 'cf-console-toolbar-default',
  imports: [ConsoleToolbarDefaultButtonComponent],
  standalone: true,
  templateUrl: './console-toolbar-default.component.html',
  styleUrl: './console-toolbar-default.component.scss'
})
export class ConsoleToolbarDefaultComponent implements ConsoleToolbarComponentBase {
  consoleContext = input.required<ConsoleToolbarContext>();

  protected isClipboardDialogOpen = false;
  protected isNetworkDialogOpen = false;
  protected isPowerDialogOpen = false;
  protected clipboardTextInput = viewChild<ElementRef>("clipboardText");

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

  protected handleSendClipboardText(event: Event, text: string) {
    event.preventDefault();
    this.consoleContext().console.sendTextToClipboard(text);
    this.isClipboardDialogOpen = false;
  }
}
