import { Injectable, signal } from '@angular/core';

// EXPLICITLY not provided in root - this is provided by ConsoleComponent,
// and each should get its own
@Injectable()
export class CanvasService {
  private readonly _canvas = signal<HTMLCanvasElement | null>(null);
  public readonly canvas = this._canvas.asReadonly();

  clearCanvas() {
    this._canvas.update(() => null);
  }

  setCanvas(canvas: HTMLCanvasElement) {
    this._canvas.update(() => canvas);
  }
}
