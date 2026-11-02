//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { keysymsForText, XK_RETURN, XK_TAB } from './vnc-keysyms';

describe('keysymsForText', () => {
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

  it('maps characters beyond Latin-1 to their X11 keysyms', () => {
    // XK_EuroSign, XK_Greek_alpha
    expect(keysymsForText('€α')).toEqual([0x20ac, 0x7e1]);
  });

  it('maps a character outside the BMP to a Unicode keysym rather than splitting its surrogates', () => {
    expect(keysymsForText('😀')).toEqual([0x0100_0000 | 0x1f600]);
  });
});
