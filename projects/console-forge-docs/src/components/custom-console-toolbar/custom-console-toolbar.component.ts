import { Component, input } from '@angular/core';
import { ConsoleToolbarTemplateContext } from 'console-forge';

@Component({
  selector: 'app-custom-console-toolbar',
  imports: [],
  templateUrl: './custom-console-toolbar.component.html',
  styleUrl: './custom-console-toolbar.component.scss'
})
export class CustomConsoleToolbarComponent {
  public context = input<ConsoleToolbarTemplateContext>();
}
