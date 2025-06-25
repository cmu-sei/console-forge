import { Component } from '@angular/core';
import { ConsoleComponentConfig, ConsoleTileComponent } from 'console-forge';

@Component({
  selector: 'app-console-tiles-demo',
  imports: [ConsoleTileComponent],
  templateUrl: './console-tiles-demo.component.html',
  styleUrl: './console-tiles-demo.component.scss'
})
export class ConsoleTilesDemoComponent {
  protected cfConfig: ConsoleComponentConfig = {
    autoFocusOnConnect: true,
    consoleClientType: "vnc",
    credentials: {
      "password": "mypw"
    },
    url: "http://localhost:5950"
  };
}
