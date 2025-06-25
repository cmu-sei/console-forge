import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsoleTilesDemoComponent } from './console-tiles-demo.component';

describe('ConsoleTilesDemoComponent', () => {
  let component: ConsoleTilesDemoComponent;
  let fixture: ComponentFixture<ConsoleTilesDemoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsoleTilesDemoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsoleTilesDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
