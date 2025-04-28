import { Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ConsoleToolbarComponentBase, ConsoleToolbarContext } from 'console-forge';

@Component({
  selector: 'app-custom-console-toolbar',
  imports: [
    MatButtonModule,
  ],
  standalone: true,
  templateUrl: './custom-console-toolbar.component.html',
  styleUrl: './custom-console-toolbar.component.scss'
})
export class CustomConsoleToolbarComponent implements ConsoleToolbarComponentBase {
  public consoleContext = input.required<ConsoleToolbarContext>();
}
