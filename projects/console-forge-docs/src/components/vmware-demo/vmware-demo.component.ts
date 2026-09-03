import { CommonModule } from '@angular/common';
import { Component, computed, inject, model, signal, viewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ConsoleClientType, ConsoleComponent, ConsoleComponentConfig, ConsoleConnectionStatus, getTextFromClipboardItem } from 'console-forge';

@Component({
  selector: 'app-vmware-demo',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    ConsoleComponent,
  ],
  templateUrl: './vmware-demo.component.html',
  styleUrl: './vmware-demo.component.scss'
})
export class VmwareDemoComponent {
  private snackbarService = inject(MatSnackBar);

  protected cfConfig?: ConsoleComponentConfig;
  protected cfConsole = viewChild(ConsoleComponent);
  protected configForm = new FormGroup({
    autoFocusOnConnect: new FormControl(false),
    consoleClientType: new FormControl<ConsoleClientType>("vmware"),
    url: new FormControl("wss://esxi-dev.cmrtest.org:443/ticket/4b352b9e1703a405a74a14f65a51cec4")
  });
  protected isConnected = signal(false);
  protected isViewOnly = model(false);

  protected handleConnectionStatusChanged(status?: ConsoleConnectionStatus) {
    this.isConnected.update(() => status === "connected");
  }

  protected handleConsoleClipboardUpdated(text: string) {
    this.showToast(`Sent to console clipboard: ${text}`, "Hype 🔥");
  }

  protected handleFormSubmit() {
    if (!this.configForm.value.url) {
      return;
    }

    // setting the config is enough: the console component autoconnects when it receives one
    this.cfConfig = {
      autoFocusOnConnect: this.configForm.value.autoFocusOnConnect || false,
      consoleClientType: "vmware",
      url: this.configForm.value.url
    };
  }

  protected handleConnectFailed(error: Error) {
    this.showToast(`Connection failed: ${error.message}`, "Rats");
  }

  protected async handleDisconnect() {
    await this.cfConsole()?.disconnect();
  }

  protected handleCtrlAltDelSent() {
    this.showToast("Ctrl+Alt+Del sent!", "Sweet!");
  }

  protected async handleLocalClipboardUpdated(clipboardItem: ClipboardItem) {
    const text = await getTextFromClipboardItem(clipboardItem);

    if (text) {
      this.showToast(`Copied to local clipboard: ${text}`, "Yeahhh");
    }
  }

  protected handleScreenshotCopied(blob: Blob) {
    this.showToast("Copied a screenshot from the console!", "Nice!");
  }

  private showToast(message: string, action: string) {
    this.snackbarService.open(message, action, { duration: 3000 })
  }
}
