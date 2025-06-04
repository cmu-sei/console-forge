import { Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { ConsoleToolbarComponentBase, ConsoleToolbarContext, ConsoleToolbarPosition } from 'console-forge';

@Component({
  selector: 'app-custom-console-toolbar',
  imports: [
    MatButtonModule,
    MatButtonToggleModule,
  ],
  standalone: true,
  templateUrl: './custom-console-toolbar.component.html',
  styleUrl: './custom-console-toolbar.component.scss'
})
export class CustomConsoleToolbarComponent implements ConsoleToolbarComponentBase {
  public consoleContext = input.required<ConsoleToolbarContext>();

  protected handleClipboardSend() {
    this.consoleContext().console.sendTextToClipboard(new Date().toLocaleDateString());
  }

  protected handleFullscreen() {
    this.consoleContext().console.toggleFullscreen();
  }

  protected handleDockToChange(dockTo: string) {
    this.consoleContext().userSettings.patch({ toolbar: { dockTo: dockTo as ConsoleToolbarPosition } });
  }
}
