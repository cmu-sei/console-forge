import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VmwareDemoComponent } from './vmware-demo.component';

describe('VmwareDemoComponent', () => {
  let component: VmwareDemoComponent;
  let fixture: ComponentFixture<VmwareDemoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VmwareDemoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VmwareDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
