import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApplyToolbarThemeDirective } from './apply-toolbar-theme.directive';
import { provideConsoleForge } from '../config/provide-console-forge';
import { UserSettingsService } from '../services/user-settings.service';

@Component({
  template: '<div cfApplyToolbarTheme></div>',
  imports: [ApplyToolbarThemeDirective]
})
class TestHostComponent {}

describe('ApplyToolbarThemeDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideZonelessChangeDetection(), provideConsoleForge()]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    TestBed.inject(UserSettingsService).patch({ toolbar: { preferTheme: undefined } });
    await fixture.whenStable();
  });

  it('binds Light and Dark and removes the attribute when returning to Auto', async () => {
    const settings = TestBed.inject(UserSettingsService);
    const host = fixture.nativeElement.querySelector('div');
    for (const theme of ['light', 'dark', undefined] as const) {
      settings.patch({ toolbar: { preferTheme: theme } });
      await fixture.whenStable();
      expect(host.getAttribute('data-theme')).toBe(theme ?? null);
    }
  });
});
