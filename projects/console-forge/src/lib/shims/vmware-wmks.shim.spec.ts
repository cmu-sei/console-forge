//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { patchWmksLockKeys, WmksClient, WmksKeyboardManager } from './vmware-wmks.shim';

// Caps Lock / Num Lock / Scroll Lock, and a couple of modifiers, as the SDK numbers them.
const VSCAN_CAPSLOCK = 58;
const VSCAN_NUMLOCK = 69;
const VSCAN_SCROLL = 70;
const VSCAN_LSHIFT = 42;
const VSCAN_A = 30;

interface TestHarness {
  client: WmksClient;
  manager: WmksKeyboardManager;
  vScanCalls: { vScanCode: number, isDown: boolean }[];
  ledKeyChangedCalls: number[];
  originalSendCalls: number[];
}

function buildHarness(): TestHarness {
  const vScanCalls: { vScanCode: number, isDown: boolean }[] = [];
  const ledKeyChangedCalls: number[] = [];
  const originalSendCalls: number[] = [];

  const manager: WmksKeyboardManager = {
    _onLedKeyChanged: (vScanCode: number) => { ledKeyChangedCalls.push(vScanCode); },
    _serverModifierStatus: {},
    _vncDecoder: { onKeyVScan: (vScanCode: number, isDown: boolean) => { vScanCalls.push({ vScanCode, isDown }); } },
    // stands in for SDK 2.2.0's implementation, which never forwards lock keys to the guest
    sendVScanKey: (vScanCode: number) => { originalSendCalls.push(vScanCode); }
  };

  return {
    client: { wmksData: { _keyboardManager: manager } } as WmksClient,
    manager,
    vScanCalls,
    ledKeyChangedCalls,
    originalSendCalls
  };
}

describe('patchWmksLockKeys', () => {
  let harness: TestHarness;

  beforeEach(() => {
    harness = buildHarness();
    (window as unknown as { WMKS: unknown }).WMKS = {
      version: '2.2.0',
      createWMKS: () => harness.client,
      CONST: { KB2: { LedKeys: [VSCAN_CAPSLOCK, VSCAN_NUMLOCK, VSCAN_SCROLL], ModifierKeys: [VSCAN_LSHIFT] } }
    };
  });

  afterEach(() => {
    delete (window as unknown as { WMKS?: unknown }).WMKS;
  });

  it('forwards lock keys to the guest, which SDK 2.2.0 does not', () => {
    expect(patchWmksLockKeys(harness.client)).toBe("applied");

    harness.manager.sendVScanKey(VSCAN_CAPSLOCK, true);
    harness.manager.sendVScanKey(VSCAN_CAPSLOCK, false);

    // the actual defect: without the patch, no keystroke reaches the guest at all
    expect(harness.vScanCalls).toEqual([
      { vScanCode: VSCAN_CAPSLOCK, isDown: true },
      { vScanCode: VSCAN_CAPSLOCK, isDown: false }
    ]);
    expect(harness.originalSendCalls).toEqual([]);
  });

  it('runs LED bookkeeping on keydown only', () => {
    patchWmksLockKeys(harness.client);

    harness.manager.sendVScanKey(VSCAN_NUMLOCK, true);
    harness.manager.sendVScanKey(VSCAN_NUMLOCK, false);

    expect(harness.ledKeyChangedCalls).toEqual([VSCAN_NUMLOCK]);
  });

  it('leaves non-lock keys and modifier bookkeeping intact', () => {
    patchWmksLockKeys(harness.client);

    harness.manager.sendVScanKey(VSCAN_A, true);
    harness.manager.sendVScanKey(VSCAN_LSHIFT, true);

    expect(harness.vScanCalls).toEqual([
      { vScanCode: VSCAN_A, isDown: true },
      { vScanCode: VSCAN_LSHIFT, isDown: true }
    ]);
    expect(harness.ledKeyChangedCalls).toEqual([]);
    expect(harness.manager._serverModifierStatus[VSCAN_LSHIFT]).toBeTrue();
    expect(harness.manager._serverModifierStatus[VSCAN_A]).toBeUndefined();
  });

  it('is idempotent, so reconnecting cannot stack wrappers', () => {
    expect(patchWmksLockKeys(harness.client)).toBe("applied");
    const afterFirst = harness.manager.sendVScanKey;

    expect(patchWmksLockKeys(harness.client)).toBe("applied");

    expect(harness.manager.sendVScanKey).toBe(afterFirst);

    harness.manager.sendVScanKey(VSCAN_CAPSLOCK, true);
    expect(harness.vScanCalls.length).toBe(1);
    expect(harness.ledKeyChangedCalls).toEqual([VSCAN_CAPSLOCK]);
  });

  it('preserves the calling context rather than a captured manager', () => {
    patchWmksLockKeys(harness.client);

    const other = buildHarness();
    // invoke the patched function as a method of a different manager instance
    other.manager.sendVScanKey = harness.manager.sendVScanKey;
    other.manager.sendVScanKey(VSCAN_CAPSLOCK, true);

    expect(other.vScanCalls).toEqual([{ vScanCode: VSCAN_CAPSLOCK, isDown: true }]);
    expect(harness.vScanCalls).toEqual([]);
  });

  it('reports failure when the SDK internals are missing instead of throwing', () => {
    const bare = { wmksData: {} } as WmksClient;
    expect(patchWmksLockKeys(bare)).toBe("failed");

    const noConsts = buildHarness();
    (window as unknown as { WMKS: unknown }).WMKS = { version: '2.2.0', createWMKS: () => noConsts.client };
    expect(patchWmksLockKeys(noConsts.client)).toBe("failed");
  });

  it('skips the patch on an SDK version which does not need it', () => {
    // same SDK surface as the beforeEach, but reporting a version which isn't in the defect list. CONST is
    // present so a "not-needed" result can only come from the version gate, not from unresolvable internals.
    (window as unknown as { WMKS: unknown }).WMKS = {
      version: '99.0.0',
      createWMKS: () => harness.client,
      CONST: { KB2: { LedKeys: [VSCAN_CAPSLOCK, VSCAN_NUMLOCK, VSCAN_SCROLL], ModifierKeys: [VSCAN_LSHIFT] } }
    };

    expect(patchWmksLockKeys(harness.client)).toBe("not-needed");

    // the original implementation is still in place, so the SDK's own lock-key handling stands
    harness.manager.sendVScanKey(VSCAN_CAPSLOCK, true);
    expect(harness.originalSendCalls).toEqual([VSCAN_CAPSLOCK]);
    expect(harness.vScanCalls).toEqual([]);
  });

  it('forwards repeated lock-key downs, which some platforms send without a matching up', () => {
    patchWmksLockKeys(harness.client);

    // SDK 2.2.0 sends NumLock down with no up on ChromeOS, so suppressing repeats would latch forever
    harness.manager.sendVScanKey(VSCAN_NUMLOCK, true);
    harness.manager.sendVScanKey(VSCAN_NUMLOCK, true);

    expect(harness.vScanCalls).toEqual([
      { vScanCode: VSCAN_NUMLOCK, isDown: true },
      { vScanCode: VSCAN_NUMLOCK, isDown: true }
    ]);
    expect(harness.ledKeyChangedCalls).toEqual([VSCAN_NUMLOCK, VSCAN_NUMLOCK]);
  });
});
