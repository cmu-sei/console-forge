// Copyright 2026 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { Component } from '@angular/core';
import { ConsoleComponent, ConsoleComponentConfig } from 'console-forge';

@Component({
  selector: 'app-with-full-page',
  imports: [ConsoleComponent],
  templateUrl: './with-full-page.component.html',
  styleUrl: './with-full-page.component.scss'
})
export class WithFullPageComponent {
  protected cfConfig: ConsoleComponentConfig = {
    autoFocusOnConnect: true,
    consoleClientType: "vnc",
    credentials: {
      "password": "mypw"
    },
    url: "http://localhost:5950"
  };
}
