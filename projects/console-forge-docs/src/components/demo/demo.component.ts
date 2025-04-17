import { Component } from '@angular/core';
import { ConsoleComponent, ConsoleComponentConfig } from 'console-forge';

@Component({
  selector: 'app-demo',
  imports: [
    ConsoleComponent
  ],
  templateUrl: './demo.component.html',
  styleUrl: './demo.component.scss'
})
export class DemoComponent {
  protected cfConfig: ConsoleComponentConfig = {
    consoleClientType: "vnc",
    url: "https://google.com"
  }
}
