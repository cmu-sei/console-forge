import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, TitleStrategy } from '@angular/router';
import { LogLevel, provideConsoleForge } from 'console-forge';
import { routes } from './app.routes';
import { AppTitleStrategy } from './app.title-strategy';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    { provide: TitleStrategy, useClass: AppTitleStrategy },
    provideConsoleForge({ logThreshold: LogLevel.DEBUG })
  ]
};
