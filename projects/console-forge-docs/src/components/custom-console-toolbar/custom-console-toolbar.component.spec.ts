import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomConsoleToolbarComponent } from './custom-console-toolbar.component';

describe('CustomConsoleToolbarComponent', () => {
  let component: CustomConsoleToolbarComponent;
  let fixture: ComponentFixture<CustomConsoleToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomConsoleToolbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomConsoleToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
