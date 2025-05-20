import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, TitleStrategy } from '@angular/router';
import { LogLevel, provideConsoleForge } from 'console-forge';
import { routes } from './app.routes';
import { AppTitleStrategy } from './app.title-strategy';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: TitleStrategy, useClass: AppTitleStrategy },
    provideConsoleForge({
      canvasRecording: {
        frameRate: 30
      },
      logThreshold: LogLevel.DEBUG,
      showBrowserNotificationsOnConsoleEvents: true
    })
  ]
};
