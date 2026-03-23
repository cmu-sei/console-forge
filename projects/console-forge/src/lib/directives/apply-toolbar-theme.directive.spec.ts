import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApplyToolbarThemeDirective } from './apply-toolbar-theme.directive';
import { provideConsoleForge } from '../config/provide-console-forge';

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
      providers: [provideConsoleForge()]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('should create an instance', () => {
    expect(fixture.nativeElement.querySelector('[data-theme]')).toBeTruthy();
  });
});
