import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsoleTileComponent } from './console-tile.component';

describe('ConsoleTileComponent', () => {
  let component: ConsoleTileComponent;
  let fixture: ComponentFixture<ConsoleTileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsoleTileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsoleTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
