import { Component, inject, Type, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConsoleComponent, ConsoleComponentConfig, ConsoleNetworkConnectionRequest, ConsoleNetworkDisconnectionRequest, ConsoleToolbarComponentBase, getTextFromClipboardItem } from 'console-forge';
import { CustomConsoleToolbarComponent } from '../custom-console-toolbar/custom-console-toolbar.component';

@Component({
  selector: 'app-with-custom-toolbar',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    ConsoleComponent
  ],
  standalone: true,
  templateUrl: './with-custom-toolbar.component.html',
  styleUrl: './with-custom-toolbar.component.scss'
})
export class WithCustomToolbarComponent {
  private readonly snackbarService = inject(MatSnackBar);

  protected cfConsole = viewChild<ConsoleComponent>("cfConsole");
  protected consoleConfig?: ConsoleComponentConfig;
  protected configForm = new FormGroup({
    password: new FormControl("mypw"),
    url: new FormControl("http://localhost:5950")
  });
  protected customToolbar: Type<ConsoleToolbarComponentBase> = CustomConsoleToolbarComponent;

  protected async handleConfigFormSubmit() {
    if (!this.configForm.value.url) {
      return;
    }

    this.consoleConfig = {
      consoleClientType: "vnc",
      credentials: {
        password: this.configForm.value.password || undefined
      },
      url: this.configForm.value.url
    };
    if (this.cfConsole()) {
      await this.cfConsole()?.connect(this.consoleConfig);
    }
  }

  protected handleConsoleClipboardUpdated(text: string) {
    this.showToast(`Sent to console clipboard: ${text}`, "Hype 🔥");
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

  protected handleNetworkConnectionRequest(request: ConsoleNetworkConnectionRequest) {
    this.showToast(`This console wants to change NIC ${request.nic} to the ${request.network} network.`, "We better do that");
  }

  protected handleNetworkDisconnectRequest(request?: ConsoleNetworkDisconnectionRequest) {
    if (request?.nic) {
      this.showToast(`This console wants to disconnect NIC ${request.nic}.`, "On it");
    } else {
      this.showToast("This console wants to disconnect all NICS.", "Gosh, fine.");
    }
  }

  protected handleScreenshotCopied(blob: Blob) {
    this.showToast("Copied a screenshot from the console!", "Nice!");
  }

  private showToast(message: string, action: string) {
    this.snackbarService.open(message, action, { duration: 3000, horizontalPosition: "end", "verticalPosition": "top" });
  }
}
