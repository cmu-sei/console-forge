// Copyright 2026 Carnegie Mellon University. All Rights Reserved.
// Released under a MIT (SEI)-style license. See LICENSE.md in the project root for license information.

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
