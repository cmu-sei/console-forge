// Copyright 2026 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutWithNavComponent } from './layout-with-nav.component';

describe('LayoutWithNavComponent', () => {
  let component: LayoutWithNavComponent;
  let fixture: ComponentFixture<LayoutWithNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutWithNavComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayoutWithNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
