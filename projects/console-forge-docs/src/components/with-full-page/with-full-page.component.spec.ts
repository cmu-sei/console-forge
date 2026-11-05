// Copyright 2026 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WithFullPageComponent } from './with-full-page.component';

describe('WithFullPageComponent', () => {
  let component: WithFullPageComponent;
  let fixture: ComponentFixture<WithFullPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WithFullPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WithFullPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
