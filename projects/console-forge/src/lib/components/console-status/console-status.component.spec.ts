import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsoleStatusComponent } from './console-status.component';

describe('ConsoleStatusComponent', () => {
  let component: ConsoleStatusComponent;
  let fixture: ComponentFixture<ConsoleStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsoleStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsoleStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
