import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsoleToolbarDefaultButtonComponent } from './console-toolbar-default-button.component';

describe('ConsoleToolbarDefaultButtonComponent', () => {
  let component: ConsoleToolbarDefaultButtonComponent;
  let fixture: ComponentFixture<ConsoleToolbarDefaultButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsoleToolbarDefaultButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsoleToolbarDefaultButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
