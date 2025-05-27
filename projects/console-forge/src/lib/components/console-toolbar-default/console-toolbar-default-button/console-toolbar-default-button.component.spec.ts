//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

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
