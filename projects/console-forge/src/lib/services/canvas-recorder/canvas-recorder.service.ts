import { inject, Injectable } from '@angular/core';
import { CanvasRecording } from './canvas-recording';
import { WINDOW } from '../../injection/window.injection-token';
import { UuidService } from '../uuid.service';
import { ConsoleForgeConfig } from '../../config/console-forge-config';

@Injectable({ providedIn: 'root' })
export class CanvasRecorderService {
  private readonly cfConfig = inject(ConsoleForgeConfig);
  private readonly uuids = inject(UuidService);
  private readonly window = inject(WINDOW);

  public startRecord(canvas: HTMLCanvasElement): CanvasRecording {
    return new CanvasRecording({
      id: this.uuids.get(),
      stream: canvas.captureStream(this.cfConfig.canvasRecording.frameRate || 25),
      window: this.window,
      chunkLength: this.cfConfig.canvasRecording.chunkLength || 1000,
      maxDuration: this.cfConfig.canvasRecording.maxDuration || 60000,
      mimeType: this.cfConfig.canvasRecording.mimeType || "video/webm"
    });
  }
}
