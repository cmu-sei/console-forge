//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConsoleComponent } from './console.component';
import { provideConsoleForge } from '../../config/provide-console-forge';
import { Component, viewChild } from '@angular/core';

@Component({
    template: `<cf-console [config]="consoleConfig" />`,
    imports: [ConsoleComponent]
})
class TestHostComponent {
    consoleConfig = { url: 'ws://localhost:5900' };
    console = viewChild(ConsoleComponent);
}

describe('ConsoleComponent', () => {
    let fixture: ComponentFixture<TestHostComponent>;

    beforeEach(async () => {
        await TestBed
            .configureTestingModule({
                imports: [TestHostComponent],
                providers: [provideConsoleForge()]
            })
            .compileComponents();

        fixture = TestBed.createComponent(TestHostComponent);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(fixture.componentInstance.console()).toBeTruthy();
    });
});
