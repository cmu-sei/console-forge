import { Component, computed, inject, model, viewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ConsoleComponent, ConsoleComponentConfig } from 'console-forge';
import { BlobDownloaderService } from '../../services/blob-downloader.service';

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
  private readonly blobDownloader = inject(BlobDownloaderService);
  private readonly snackbarService = inject(MatSnackBar);

  protected cfConfig?: ConsoleComponentConfig;
  protected cfConsole = viewChild(ConsoleComponent);
  protected configForm = new FormGroup({
    autoFocusOnConnect: new FormControl(false),
    isViewOnly: new FormControl(false),
    password: new FormControl(""),
    ticket: new FormControl(""),
    url: new FormControl("http://localhost:5950"),
    vmId: new FormControl("180672005")
  });

  protected availableNetworks = model<string[]>(["lan1", "lan2"]);
  protected currentNetwork = model<string>("lan1");
  protected isConnected = computed(() => this.cfConsole()?.status() === "connected");
  protected isViewOnly = model(false);
  protected scaleToContainer = model(false);

  protected async configFormSubmit() {
    let url = this.configForm.value.url || "";

    if (this.configForm.value.ticket) {
      url = `wss://foundry.nivix/api2/json/nodes/foundry/qemu/${this.configForm.value.vmId}/vncwebsocket?port=5900&vncticket=${encodeURIComponent(this.configForm.value.ticket)}`;
    }

    this.cfConfig = {
      autoFocusOnConnect: this.configForm.value.autoFocusOnConnect || false,
      consoleClientType: "vnc",
      credentials: {
        accessTicket: this.configForm.value.ticket || undefined,
        password: this.configForm.value.password || undefined,
      },
      url: url
    };

    if (this.cfConsole()) {
      await this.cfConsole()!.connect(this.cfConfig);
    }
  }

  protected handleConsoleClipboardUpdated(text: string) {
    this.showToast(`Sent to console clipboard: ${text}`, "Hype 🔥");
  }

  protected handleConsoleRecorded(blob: Blob) {
    this.blobDownloader.download(blob, "your-screen-recording.webm");
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

  protected handleNetworkConnectionRequest(networkName: string) {
    this.showToast(`This console wants to change to the ${networkName} network.`, "We better do that");
  }

  protected handleNetworkDisconnectRequest() {
    this.showToast("This console wants to disconnect from all networks.", "Gosh, fine.");
  }

  protected handleScreenshotCopied(blob: Blob) {
    this.showToast("Copied a screenshot from the console!", "Nice!");
  }

  protected handleToggleScale() {
    this.scaleToContainer.update(() => !this.scaleToContainer());
  }

  private showToast(message: string, action: string) {
    this.snackbarService.open(message, action, { duration: 3000, horizontalPosition: "end", "verticalPosition": "top" });
  }
}
