//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { TestBed } from '@angular/core/testing';

import { VncConsoleClientService } from './vnc-console-client.service';
import { provideConsoleForge } from '../../../config/provide-console-forge';

describe('VncConsoleClientService', () => {
  let service: VncConsoleClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideConsoleForge()]
    });
    service = TestBed.inject(VncConsoleClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  for (const background of [undefined, 'rgb(24, 48, 72)']) {
    it(`sets the noVNC background before the handshake (${background ?? 'transparent'})`, async () => {
      // Hold a real noVNC client in its initial handshake without opening a network connection.
      const socket = {
        readyState: WebSocket.CONNECTING as number,
        binaryType: 'arraybuffer',
        protocol: '',
        onopen: null,
        onmessage: null,
        onerror: null,
        onclose: null as ((event: CloseEvent) => void) | null,
        send: () => {},
        close: () => {
          socket.readyState = WebSocket.CLOSED;
          socket.onclose?.(new CloseEvent('close', { wasClean: true }));
        }
      };
      spyOn(window, 'WebSocket').and.returnValue(socket as unknown as WebSocket);
      const host = document.createElement('div');
      document.body.append(host);
      const connection = service.connect('wss://example.test/console', {
        hostElement: host, backgroundStyle: background
      }).catch(() => {});
      try {
        expect(service.connectionStatus()).toBe('connecting');
        const screen = host.querySelector('div')!;
        expect(screen).toBeTruthy();
        expect(screen.style.background).toBe(background ?? 'transparent');
      } finally {
        await service.disconnect();
        await connection;
        host.remove();
      }
    });
  }
});
