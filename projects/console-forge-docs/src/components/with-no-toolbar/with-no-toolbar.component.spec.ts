import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WithNoToolbarComponent } from './with-no-toolbar.component';

describe('WithNoToolbarComponent', () => {
  let component: WithNoToolbarComponent;
  let fixture: ComponentFixture<WithNoToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WithNoToolbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WithNoToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
