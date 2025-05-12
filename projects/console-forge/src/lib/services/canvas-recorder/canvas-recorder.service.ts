import { inject, Injectable } from '@angular/core';
import { CanvasRecording } from './canvas-recording';
import { WINDOW } from '../../injection/window.injection-token';

@Injectable({ providedIn: 'root' })
export class CanvasRecorderService {
  private readonly window = inject(WINDOW);

  public isRecording = false;

  public startRecord(canvas: HTMLCanvasElement): CanvasRecording {
    return new CanvasRecording(canvas.captureStream(25), this.window);
  }
}
