// Copyright 2026 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WithCustomToolbarComponent } from './with-custom-toolbar.component';

describe('WithCustomToolbarComponent', () => {
  let component: WithCustomToolbarComponent;
  let fixture: ComponentFixture<WithCustomToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WithCustomToolbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WithCustomToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
