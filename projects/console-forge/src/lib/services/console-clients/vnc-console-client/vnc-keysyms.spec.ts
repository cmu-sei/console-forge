//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { keyEventsForText, XK_RETURN, XK_SHIFT_L, XK_TAB } from './vnc-keysyms';

/** The keysyms pressed for `text`, leaving out Shift. */
function keysymsForText(text: string): number[] {
  return keyEventsForText(text)
    .filter(event => event.down && event.keysym !== XK_SHIFT_L)
    .map(event => event.keysym);
}

describe('keyEventsForText', () => {
  it('sends printable ASCII as its code point', () => {
    expect(keysymsForText('ls -a')).toEqual([0x6c, 0x73, 0x20, 0x2d, 0x61]);
  });

  it('keeps indentation, blank lines and the trailing newline', () => {
    expect(keysymsForText('  a\n\nb\n')).toEqual([0x20, 0x20, 0x61, XK_RETURN, XK_RETURN, 0x62, XK_RETURN]);
  });

  it('treats \\r\\n and a bare \\r as one Return', () => {
    expect(keysymsForText('a\r\nb\rc')).toEqual([0x61, XK_RETURN, 0x62, XK_RETURN, 0x63]);
  });

  it('sends a tab as the Tab key, not keysym 0x09', () => {
    expect(keysymsForText('\tx')).toEqual([XK_TAB, 0x78]);
  });

  it('drops control characters that have no key', () => {
    expect(keysymsForText('a\u0000\u001b\u007f\u0085b')).toEqual([0x61, 0x62]);
  });

  it('keeps Latin-1 as its code point', () => {
    expect(keysymsForText('é')).toEqual([0xe9]);
  });

  it('maps characters beyond Latin-1 to Unicode keysyms', () => {
    expect(keysymsForText('€α')).toEqual([0x0100_0000 | 0x20ac, 0x0100_0000 | 0x3b1]);
  });

  it('presses and releases each key, with no Shift for an unshifted character', () => {
    expect(keyEventsForText('a1')).toEqual([
      { keysym: 0x61, down: true },
      { keysym: 0x61, down: false },
      { keysym: 0x31, down: true },
      { keysym: 0x31, down: false },
    ]);
  });

  // QEMU's VNC server picks the key from the Shift state the client holds and never adds Shift, so a bare 0x28
  // arrives as "9". Confirmed on a QEMU guest: unshifted, "(test)" typed "9test0".
  it('holds Shift around a character a US layout types with Shift', () => {
    expect(keyEventsForText('(A')).toEqual([
      { keysym: XK_SHIFT_L, down: true },
      { keysym: 0x28, down: true },
      { keysym: 0x28, down: false },
      { keysym: XK_SHIFT_L, down: false },
      { keysym: XK_SHIFT_L, down: true },
      { keysym: 0x41, down: true },
      { keysym: 0x41, down: false },
      { keysym: XK_SHIFT_L, down: false },
    ]);
  });

  it('holds Shift for exactly the US-shifted characters', () => {
    const events = keyEventsForText('aZ1!2@3#4$5%6^7&8*9(0)-_=+[{]}\\|;:\'",<.>/?`~ \té');
    const shifted = events
      .filter((event, i) => event.down && event.keysym !== XK_SHIFT_L && events[i - 1]?.keysym === XK_SHIFT_L && events[i - 1].down)
      .map(event => String.fromCodePoint(event.keysym))
      .join('');
    expect(shifted).toBe('Z!@#$%^&*()_+{}|:"<>?~');
  });

  it('maps a character outside the BMP to a Unicode keysym rather than splitting its surrogates', () => {
    expect(keysymsForText('😀')).toEqual([0x0100_0000 | 0x1f600]);
  });
});
