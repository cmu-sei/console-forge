import { CommonModule } from '@angular/common';
import { Component, computed, inject, model, viewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ConsoleClientType, ConsoleComponent, ConsoleComponentConfig } from 'console-forge';

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
    url: new FormControl("wss://launchpad.cisa.gov/console/ticket/9fb75377b84c13cb?vmhost=10.52.32.9")
  });
  protected isConnected = computed(() => this.cfConsole()?.status() === "connected");
  protected scaleToContainer = model(false);
  protected isViewOnly = model(false);

  protected handleConsoleClipboardUpdated(text: string) {
    this.showToast(`Sent to console clipboard: ${text}`, "Hype 🔥");
  }

  protected async handleFormSubmit() {
    if (!this.configForm.value.url) {
      return;
    }

    this.cfConfig = {
      autoFocusOnConnect: this.configForm.value.autoFocusOnConnect || false,
      consoleClientType: "vmware",
      url: this.configForm.value.url
    };

    await this.cfConsole()?.connect(this.cfConfig)!;
  }

  protected async handleDisconnect() {
    await this.cfConsole()?.disconnect();
  }

  protected handleCtrlAltDelSent() {
    this.showToast("Ctrl+Alt+Del sent!", "Sweet!");
  }

  protected handleLocalClipboardUpdated(text: string) {
    this.showToast(`Copied to local clipboard: ${text}`, "Yeahhh");
  }

  protected handleScreenshotCopied(blob: Blob) {
    this.showToast("Copied a screenshot from the console!", "Nice!");
  }

  protected handleToggleScale() {
    this.scaleToContainer.update(() => !this.scaleToContainer());
  }

  private showToast(message: string, action: string) {
    this.snackbarService.open(message, action, { duration: 3000 })
  }
}
