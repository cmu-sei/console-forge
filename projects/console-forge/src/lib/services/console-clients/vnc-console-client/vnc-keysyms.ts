//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

export const XK_TAB = 0xff09;
export const XK_RETURN = 0xff0d;

/** X11's Unicode keysym range: keysym 0x01000000 + code point stands for that character. */
const UNICODE_KEYSYM = 0x0100_0000;

export const XK_SHIFT_L = 0xffe1;

/** One key press or release, as noVNC's RFB.sendKey(keysym, code, down) takes it. */
export interface VncKeyEvent {
  keysym: number;
  down: boolean;
}

/** The characters a US keyboard layout types with Shift held: the capitals and the shifted symbols. */
const US_SHIFTED = new Set('ABCDEFGHIJKLMNOPQRSTUVWXYZ~!@#$%^&*()_+{}|:"<>?');

/**
 * Converts text into the key events that type it. Line breaks (\n, \r\n or \r) become Return and tabs become Tab, so
 * pasted text keeps its blank lines, indentation and trailing newline. Other control characters have no key and are
 * dropped. Latin-1 keysyms are the code points themselves; anything beyond Latin-1 uses X11's Unicode keysym range
 * (0x01000000 | code point), so no lookup table is needed.
 *
 * Characters a US layout types with Shift are sent with Shift_L held around them. A VNC server that maps keysyms to the
 * guest's keys, as QEMU's does, picks the key from the Shift state the client holds and never adds Shift itself, so a
 * bare "(" would arrive as "9". The guest is assumed to use a US layout; on any other layout some characters type
 * differently, which is why a real clipboard is preferable where the guest supports one.
 */
export function keyEventsForText(text: string): VncKeyEvent[] {
  const result: VncKeyEvent[] = [];

  for (const character of text.replace(/\r\n?/g, "\n")) {
    const keysym = keysymFor(character);

    if (keysym === null) {
      continue;
    }

    const shift = US_SHIFTED.has(character);

    if (shift) {
      result.push({ keysym: XK_SHIFT_L, down: true });
    }

    result.push({ keysym, down: true }, { keysym, down: false });

    if (shift) {
      result.push({ keysym: XK_SHIFT_L, down: false });
    }
  }

  return result;
}

/** The keysym that types one character, or null for a control character that has no key. */
function keysymFor(character: string): number | null {
  if (character === "\n") {
    return XK_RETURN;
  }

  if (character === "\t") {
    return XK_TAB;
  }

  const codePoint = character.codePointAt(0)!;

  if (codePoint < 0x20 || (codePoint >= 0x7f && codePoint < 0xa0)) {
    return null;
  }

  return codePoint <= 0xff ? codePoint : UNICODE_KEYSYM | codePoint;
}
