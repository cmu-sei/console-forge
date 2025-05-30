//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { Directive, ElementRef, HostListener, inject, input } from '@angular/core';

@Directive({ selector: '[cfClassOnHover]' })
export class ClassOnHoverDirective {
  applyClasses = input.required<string>();
  directiveHost = inject(ElementRef);

  @HostListener("mouseenter")
  protected handleMouseEnter() {
    if (this.directiveHost?.nativeElement) {
      this.directiveHost.nativeElement.classList.add(this.applyClasses());
    }
  }

  @HostListener("mouseleave")
  protected handleMouseLeave() {
    if (this.directiveHost?.nativeElement) {
      this.directiveHost.nativeElement.classList.remove(this.applyClasses());
    }
  }
}
