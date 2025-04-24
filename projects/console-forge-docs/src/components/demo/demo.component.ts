import { Component, computed, inject, model, viewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ConsoleClientType, ConsoleComponent, ConsoleComponentConfig } from 'console-forge';

@Component({
  selector: 'app-demo',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ConsoleComponent
  ],
  templateUrl: './demo.component.html',
  styleUrl: './demo.component.scss'
})
export class DemoComponent {
  private snackbarService = inject(MatSnackBar);

  protected cfConfig?: ConsoleComponentConfig;
  protected cfConsole = viewChild(ConsoleComponent);
  protected configForm = new FormGroup({
    autoFocusOnConnect: new FormControl(false),
    consoleClientType: new FormControl<ConsoleClientType>("vnc"),
    isViewOnly: new FormControl(false),
    password: new FormControl("mypw"),
    url: new FormControl("http://localhost:5950")
  });

  protected isConnected = computed(() => this.cfConsole()?.status() === "connected");
  protected scaleToContainer = model(false);
  protected isViewOnly = model(false);

  protected configFormSubmit() {
    if (!this.configForm.value.url) {
      return;
    }

    this.cfConfig = {
      autoFocusOnConnect: this.configForm.value.autoFocusOnConnect || false,
      consoleClientType: this.configForm.value.consoleClientType || "vnc",
      credentials: {
        password: this.configForm.value.password || undefined
      },
      url: this.configForm.value.url
    };
  }

  protected handleConsoleClipboardUpdated(text: string) {
    this.showToast(`Sent to console clipboard: ${text}`, "Hype 🔥");
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
