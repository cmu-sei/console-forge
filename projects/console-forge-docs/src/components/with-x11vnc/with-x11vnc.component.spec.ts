import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WithX11vncComponent } from './with-x11vnc.component';

describe('WithX11vncComponent', () => {
  let component: WithX11vncComponent;
  let fixture: ComponentFixture<WithX11vncComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WithX11vncComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WithX11vncComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
