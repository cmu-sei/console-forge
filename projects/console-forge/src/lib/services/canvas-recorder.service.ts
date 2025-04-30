import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CanvasRecorderService {
  startRecord(canvas: HTMLCanvasElement, durationMs: number): Promise<Blob> {
    const mimeType = "video/webm";
    // default to 25 fps for now
    const stream = canvas.captureStream(25);
    const mediaRecorder = new MediaRecorder(stream, { mimeType });
    const chunks: Blob[] = [];

    return new Promise((resolve, reject) => {
      try {
        mediaRecorder.ondataavailable = ev => chunks.push(ev.data);
        mediaRecorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
        mediaRecorder.start(durationMs);
        setTimeout(() => mediaRecorder.stop(), durationMs);
      }
      catch (err) {
        reject(err);
      }
    });
  }
}
