import { Component, inject, Type } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConsoleComponent, ConsoleComponentConfig, ConsoleToolbarComponentBase } from 'console-forge';
import { MatButtonModule } from '@angular/material/button';
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

  protected consoleConfig?: ConsoleComponentConfig;
  protected configForm = new FormGroup({
    password: new FormControl("mypw"),
    url: new FormControl("http://localhost:5950")
  });
  protected customToolbar: Type<ConsoleToolbarComponentBase> = CustomConsoleToolbarComponent;

  protected handleConfigFormSubmit() {
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
  }

  protected handleConsoleClipboardUpdated(text: string) {
    this.showToast(`Sent to console clipboard: ${text}`, "Hype 🔥");
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

  private showToast(message: string, action: string) {
    this.snackbarService.open(message, action, { duration: 3000, horizontalPosition: "end", "verticalPosition": "top" });
  }
}
