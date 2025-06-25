import { Component } from '@angular/core';
import { ConsoleComponent, ConsoleComponentConfig } from 'console-forge';

@Component({
  selector: 'app-with-no-toolbar',
  imports: [ConsoleComponent],
  templateUrl: './with-no-toolbar.component.html',
  styleUrl: './with-no-toolbar.component.scss'
})
export class WithNoToolbarComponent {
  protected cfConfig: ConsoleComponentConfig = {
    autoFocusOnConnect: true,
    consoleClientType: "vnc",
    credentials: {
      "password": "mypw"
    },
    url: "http://localhost:5950"
  };
}
