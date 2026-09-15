//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConsoleComponent } from './console.component';
import { provideConsoleForge } from '../../config/provide-console-forge';
import { Component, signal, viewChild } from '@angular/core';
import { ConsoleClientFactoryService } from '../../services/console-clients/console-client-factory.service';
import { ConsoleClientService } from '../../services/console-clients/console-client.service';

@Component({
    template: `<cf-console [config]="consoleConfig" [autoConnect]="false" />`,
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

    it('ignores a late rejection from an attempt replaced by a newer connection', async () => {
        let rejectFirst!: (error: Error) => void;
        const client = {
            connectionStatus: signal("disconnected"),
            supportedFeatures: signal({}),
            consoleClipboardUpdated: signal(""),
            connect: jasmine.createSpy().and.returnValues(
                new Promise<void>((_, reject) => rejectFirst = reject),
                Promise.resolve()
            ),
            dispose: () => Promise.resolve()
        } as unknown as ConsoleClientService;
        spyOn(TestBed.inject(ConsoleClientFactoryService), "get").and.returnValue(client);
        const component = fixture.componentInstance.console()!;
        const failures = jasmine.createSpy("connectFailed");
        component.connectFailed.subscribe(failures);
        const first = component.connect({ url: "wss://example.test/first", consoleClientType: "vnc" });
        await component.connect({ url: "wss://example.test/second", consoleClientType: "vnc" });
        rejectFirst(new Error("Old connection failed"));
        await first;
        expect(failures).not.toHaveBeenCalled();
    });
});
