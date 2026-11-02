// Copyright 2026 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

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
