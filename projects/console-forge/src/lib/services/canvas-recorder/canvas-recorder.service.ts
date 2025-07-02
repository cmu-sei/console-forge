//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { inject, Injectable, signal } from '@angular/core';
import { CanvasRecording } from './canvas-recording';
import { WINDOW } from '../../injection/window.injection-token';
import { UuidService } from '../uuid.service';
import { ConsoleForgeConfig } from '../../config/console-forge-config';

@Injectable({ providedIn: 'root' })
export class CanvasRecorderService {
  private readonly cfConfig = inject(ConsoleForgeConfig);
  private readonly uuids = inject(UuidService);
  private readonly window = inject(WINDOW);

  private readonly activeRecordings = new Set<CanvasRecording>();
  private readonly _isRecording = signal<boolean>(false);
  public readonly isRecording = this._isRecording.asReadonly();

  public startRecord(canvas: HTMLCanvasElement): CanvasRecording {
    if (this.cfConfig.disabledFeatures.consoleScreenRecord) {
      throw new Error("Console recording has been disabled in ConsoleForge.");
    }

    const recording = new CanvasRecording({
      id: this.uuids.get(),
      stream: canvas.captureStream(this.cfConfig.canvasRecording.frameRate || 25),
      window: this.window,
      chunkLength: this.cfConfig.canvasRecording.chunkLength || 1000,
      maxDuration: this.cfConfig.canvasRecording.maxDuration || 60000,
      mimeType: this.cfConfig.canvasRecording.mimeType || "video/webm",
      onStopCallback: () => this.recordingStopped(recording)
    });

    this.activeRecordings.add(recording);
    this._isRecording.set(true);
    return recording;
  }

  private recordingStopped(recording: CanvasRecording) {
    this.activeRecordings.delete(recording);
    this._isRecording.set(this.activeRecordings.size > 0)
  }
}
