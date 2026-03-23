//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClassOnHoverDirective } from './class-on-hover.directive';

@Component({
  template: '<div cfClassOnHover applyClasses="test-class"></div>',
  imports: [ClassOnHoverDirective]
})
class TestHostComponent {}

describe('ClassOnHoverDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it('should create an instance', () => {
    expect(fixture.nativeElement.querySelector('[cfClassOnHover]')).toBeTruthy();
  });
});
