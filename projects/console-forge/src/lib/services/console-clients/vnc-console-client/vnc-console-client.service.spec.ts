//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { TestBed } from '@angular/core/testing';

import { VncConsoleClientService } from './vnc-console-client.service';
import { provideConsoleForge } from '../../../config/provide-console-forge';
import type NoVncClient from '@novnc/novnc/lib/rfb';
import { LoggerService } from '../../logger.service';

describe('VncConsoleClientService', () => {
  let service: VncConsoleClientService;
  let host: HTMLElement;
  let connections: Promise<void>[];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideConsoleForge()]
    });
    service = TestBed.inject(VncConsoleClientService);
    host = document.createElement('div');
    document.body.append(host);
    connections = [];
    const connecting = WebSocket.CONNECTING;
    const closed = WebSocket.CLOSED;
    // Real noVNC clients, but sockets remain in their handshake without network traffic.
    spyOn(window, 'WebSocket').and.callFake(function () {
      const socket = {
        readyState: connecting as number,
        binaryType: 'arraybuffer',
        protocol: '',
        onopen: null,
        onmessage: null,
        onerror: null,
        onclose: null as ((event: CloseEvent) => void) | null,
        send: () => {},
        close: () => {
          socket.readyState = closed;
          socket.onclose?.(new CloseEvent('close', { wasClean: true }));
        }
      };
      return socket as unknown as WebSocket;
    });
  });

  afterEach(async () => {
    await service.disconnect();
    await Promise.all(connections);
    host.remove();
  });

  function beginConnection() {
    const settled = service.connect('wss://example.test/console', { hostElement: host }).catch(() => {});
    connections.push(settled);
    const client = (service as unknown as { noVncClient: NoVncClient }).noVncClient;
    return { client, settled };
  }

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('clears the noVNC dark background before the handshake', () => {
    beginConnection();
    expect(service.connectionStatus()).toBe('connecting');
    expect(host.querySelector('div')!.style.background).toBe('transparent');
  });

  it('ignores a connect event from a replaced client', async () => {
    const old = beginConnection();
    const current = beginConnection();
    old.client.capabilities.power = true;
    old.client.dispatchEvent(new CustomEvent('connect'));
    expect(service.connectionStatus()).toBe('connecting');
    expect(service.supportedFeatures().powerManagement).toBeFalse();
    current.client.dispatchEvent(new CustomEvent('connect'));
    await current.settled;
    expect(service.connectionStatus()).toBe('connected');
  });

  it('types pasted text exactly, keeping indentation, blank lines and the final Enter', async () => {
    const { client } = beginConnection();
    const sendKey = spyOn(client, 'sendKey');
    await service.sendKeyboardInput('\tif x:\r\n\n  y\n');
    const pressed = sendKey.calls.allArgs().filter(([keysym, , down]) => down && keysym !== 0xffe1);
    expect(pressed.map(args => args[0])).toEqual([
      0xff09, 0x69, 0x66, 0x20, 0x78, 0x3a, 0xff0d, 0xff0d, 0x20, 0x20, 0x79, 0xff0d
    ]);
  });

  it('holds Shift while it types a shifted character, so QEMU types "(" and not "9"', async () => {
    const { client } = beginConnection();
    const sendKey = spyOn(client, 'sendKey');
    await service.sendKeyboardInput('(');
    expect(sendKey.calls.allArgs()).toEqual([
      [0xffe1, null, true],
      [0x28, null, true],
      [0x28, null, false],
      [0xffe1, null, false],
    ]);
  });

  it("doesn't log the text it types", async () => {
    const { client } = beginConnection();
    spyOn(client, 'sendKey');
    const log = spyOn(TestBed.inject(LoggerService), 'log');
    await service.sendKeyboardInput('hunter2');
    expect(log).toHaveBeenCalled();
    const logged = JSON.stringify(log.calls.allArgs());
    expect(logged).not.toContain('hunter2');
  });
});
