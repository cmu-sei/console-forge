//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

export const XK_TAB = 0xff09;
export const XK_RETURN = 0xff0d;

/** X11's Unicode keysym range: keysym 0x01000000 + code point stands for that character. */
const UNICODE_KEYSYM = 0x0100_0000;

/**
 * Converts text into the X11 keysyms that type it. Line breaks (\n, \r\n or \r) become Return and tabs become Tab, so
 * pasted text keeps its blank lines, indentation and trailing newline. Other control characters have no key and are
 * dropped. Latin-1 keysyms are the code points themselves; anything beyond Latin-1 uses X11's Unicode keysym range
 * (0x01000000 | code point), which servers accept for any character, so no lookup table is needed.
 */
export function keysymsForText(text: string): number[] {
  const result: number[] = [];

  for (const character of text.replace(/\r\n?/g, "\n")) {
    if (character === "\n") {
      result.push(XK_RETURN);
      continue;
    }

    if (character === "\t") {
      result.push(XK_TAB);
      continue;
    }

    const codePoint = character.codePointAt(0)!;

    if (codePoint < 0x20 || (codePoint >= 0x7f && codePoint < 0xa0)) {
      continue;
    }

    result.push(codePoint <= 0xff ? codePoint : UNICODE_KEYSYM | codePoint);
  }

  return result;
}
