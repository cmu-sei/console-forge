//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

// @ts-expect-error -- @types/novnc__novnc doesn't declare noVNC's Unicode-to-keysym table
import keysymdef from '@novnc/novnc/lib/input/keysymdef';

interface KeysymTable {
  /** Returns the X11 keysym for a Unicode code point. */
  lookup(codePoint: number): number;
}

// same CommonJS/ESM interop workaround as noVNC's RFB class in vnc-console-client.service.ts
const keysymdefModule = keysymdef as KeysymTable | { default: KeysymTable };
const keysyms = "lookup" in keysymdefModule ? keysymdefModule : keysymdefModule.default;

export const XK_TAB = 0xff09;
export const XK_RETURN = 0xff0d;

/**
 * Converts text into the X11 keysyms that type it. Line breaks (\n, \r\n or \r) become Return and tabs become Tab, so
 * pasted text keeps its blank lines, indentation and trailing newline. Other control characters have no key and are
 * dropped. Keysyms aren't Unicode code points outside Latin-1, so everything else goes through noVNC's keysym table.
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

    result.push(keysyms.lookup(codePoint));
  }

  return result;
}
