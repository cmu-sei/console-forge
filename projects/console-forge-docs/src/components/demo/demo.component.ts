import { Component, computed, inject, model, viewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ConsoleComponent, ConsoleComponentConfig, ConsoleComponentNetworkConfig, ConsoleConnectionStatus, getTextFromClipboardItem } from 'console-forge';

@Component({
  selector: 'app-demo',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    ConsoleComponent
  ],
  templateUrl: './demo.component.html',
  styleUrl: './demo.component.scss'
})
export class DemoComponent {
  private readonly snackbarService = inject(MatSnackBar);

  protected cfConfig?: ConsoleComponentConfig;
  protected cfConsole = viewChild(ConsoleComponent);
  protected configForm = new FormGroup({
    autoFocusOnConnect: new FormControl(false),
    isViewOnly: new FormControl(false),
    url: new FormControl("")
  });

  protected networkConfig = model<ConsoleComponentNetworkConfig>({
    available: ["GreenNet", "PurpleNet"],
    current: "GreenNet"
  });
  protected isConnected = model(false);
  protected isViewOnly = model(false);

  protected async configFormSubmit() {
    if (!this.configForm.value.url) {
      throw new Error("Can't connect without a URL");
    }

    const url = new URL(this.configForm.value.url);

    this.cfConfig = {
      autoFocusOnConnect: this.configForm.value.autoFocusOnConnect || false,
      consoleClientType: "vnc",
      credentials: {
        accessTicket: decodeURIComponent(url.searchParams.get("vncticket") || "")
      },
      url: url.toString()
    };
  }

  protected async handleConnectClick() {
    if (this.cfConsole() && this.cfConfig) {
      console.log("DEMO COMPONENT INSTIGATING CONNECTION", this.cfConfig);
      await this.cfConsole()!.connect(this.cfConfig);
    } else {
      console.log("Can't connect - can't resolve console/config");
    }
  }

  protected handleConnectionStatusChanged(status?: ConsoleConnectionStatus) {
    this.isConnected.update(() => status === "connected");
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

  protected async handleLocalClipboardUpdated(clipboardItem: ClipboardItem) {
    const text = await getTextFromClipboardItem(clipboardItem);

    if (text) {
      this.showToast(`Copied to local clipboard: ${text}`, "Yeahhh");
    }
  }

  protected handleNetworkConnectionRequest(networkName: string) {
    this.showToast(`This console wants to change to the ${networkName} network.`, "We better do that");
  }

  protected handleNetworkDisconnectRequest() {
    this.showToast("This console wants to disconnect from all networks.", "Gosh, fine.");
  }

  protected handleScreenshotCopied(blob: Blob) {
    this.showToast("Copied a screenshot from the console!", "Nice!");
  }

  private showToast(message: string, action: string) {
    this.snackbarService.open(message, action, { duration: 3000, horizontalPosition: "end", verticalPosition: "top" });
  }
}
