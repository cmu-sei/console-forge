//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsoleToolbarDefaultComponent } from './console-toolbar-default.component';

describe('ConsoleToolbarDefaultComponent', () => {
  let component: ConsoleToolbarDefaultComponent;
  let fixture: ComponentFixture<ConsoleToolbarDefaultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsoleToolbarDefaultComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsoleToolbarDefaultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
