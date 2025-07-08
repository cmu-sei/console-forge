import { Component, inject, model, signal, viewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ConsoleComponent, ConsoleComponentConfig, ConsoleComponentNetworkConfig, ConsoleConnectionStatus } from 'console-forge';

@Component({
  selector: 'app-with-x11vnc',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    ConsoleComponent
  ],
  templateUrl: './with-x11vnc.component.html',
  styleUrl: './with-x11vnc.component.scss'
})
export class WithX11vncComponent {
  private readonly snackbarService = inject(MatSnackBar);

  protected cfConfig: ConsoleComponentConfig = {
    autoFocusOnConnect: true,
    consoleClientType: "vnc",
    credentials: {
      password: "mypw",
    },
    url: "http://localhost:5950"
  };
  protected cfConsole = viewChild(ConsoleComponent);
  protected configForm = new FormGroup({
    autoFocusOnConnect: new FormControl(false),
    isViewOnly: new FormControl(false),
    password: new FormControl("mypw"),
    url: new FormControl("http://localhost:5950"),
  });

  // make some imaginary networks, just to show off the network switching UI
  protected networkConfig = model<ConsoleComponentNetworkConfig>({
    available: ["GreenNet", "PurpleNet"],
    current: "GreenNet"
  });
  protected isConnected = signal<boolean>(false);
  protected isViewOnly = model(false);

  protected async configFormSubmit() {
    let url = this.configForm.value.url || "";

    this.cfConfig = {
      autoFocusOnConnect: this.configForm.value.autoFocusOnConnect || false,
      consoleClientType: "vnc",
      credentials: {
        password: this.configForm.value.password || undefined,
      },
      url: url
    };
  }

  protected handleConnectionStatusChanged(status?: ConsoleConnectionStatus) {
    this.isConnected.update(() => status === "connected");
  }

  protected async handleDisconnect() {
    await this.cfConsole()?.disconnect();
  }

  protected handleReconnectRequest() {
    this.configFormSubmit();
  }
}
