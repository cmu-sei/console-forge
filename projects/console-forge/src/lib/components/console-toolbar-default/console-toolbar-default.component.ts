import { Component, ElementRef, input, viewChild } from '@angular/core';
import { ConsoleToolbarTemplateContext } from '../../models/console-toolbar-template-context';
import { ConsoleToolbarDefaultButtonComponent } from './console-toolbar-default-button/console-toolbar-default-button.component';

@Component({
  selector: 'cf-console-toolbar-default',
  imports: [ConsoleToolbarDefaultButtonComponent],
  standalone: true,
  templateUrl: './console-toolbar-default.component.html',
  styleUrl: './console-toolbar-default.component.scss'
})
export class ConsoleToolbarDefaultComponent {
  context = input.required<ConsoleToolbarTemplateContext>();

  protected isClipboardDialogOpen = false;
  protected isPowerDialogOpen = false;
  protected clipboardTextInput = viewChild<ElementRef>("clipboardText");

  handleClipboardDialogOpenClose(isOpen: boolean) {
    this.isClipboardDialogOpen = isOpen;

    if (isOpen) {
      // Is there a better way to ensure .focus works other than timeouting it?
      setTimeout(() => this.clipboardTextInput()?.nativeElement?.focus(), 100);
    }
  }

  handlePowerDialogOpenClose(isOpen: boolean) {
    this.isPowerDialogOpen = isOpen;
  }

  handleSendClipboardText(event: Event, text: string) {
    event.preventDefault();
    this.context().console.sendTextToClipboard(text);
    this.isClipboardDialogOpen = false;
  }
}
