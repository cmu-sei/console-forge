//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import {
  WmksConnectionState,
  WmksEvents,
  WmksPosition,
  WmksSettableOptions,
} from './vmware-mks.models';

function resolveWMKSLib(): WMKS {
  const windowWithWmks = window as Window & { WMKS?: WMKS };
  const lib = windowWithWmks.WMKS;

  if (!lib) {
    throw new Error(
      "The VMWare HTML Console SDK isn't loaded. ConsoleForge loads it on demand; check the browser console for a load failure.",
    );
  }

  return lib;
}

export function createWmksClient(
  hostElementId: string,
  options?: WmksClientCreateOptions,
): WmksClient {
  const result = resolveWMKSLib();
  return result.createWMKS(hostElementId, options);
}

/**
 * Works around a defect in VMWare HTML Console SDK 2.2.0 which prevents the guest OS from ever seeing
 * Caps Lock / Num Lock / Scroll Lock keypresses.
 *
 * In 2.2.0, `KeyboardManager2.sendVScanKey` only forwards a real keystroke (`_vncDecoder.onKeyVScan`) for
 * keys which are NOT lock keys. For lock keys it instead sends an `onKeyboardLedStatsChanged` state
 * declaration, so the guest never receives the keypress: its Num Lock stays latched on and its Caps Lock
 * latched off while every other key works normally.
 *
 * @param client A connected client returned by {@link createWmksClient}.
 * @returns true if the patch was applied (or was already in place), false if the SDK internals it needs
 * couldn't be resolved — in which case lock keys simply keep the unpatched behavior.
 */
export function patchWmksLockKeys(client: WmksClient): boolean {
  const lib = resolveWMKSLib();
  const ledKeys = lib.CONST?.KB2?.LedKeys;
  const modifierKeys = lib.CONST?.KB2?.ModifierKeys;
  const keyboardManager = client.wmksData?._keyboardManager;

  if (!keyboardManager || !ledKeys || !modifierKeys) {
    return false;
  }

  if (keyboardManager.__cfLockKeyPatchApplied) {
    return true;
  }

  // nothing to do if we're on an SDK which already sends lock keys correctly
  if (
    typeof keyboardManager.sendVScanKey !== 'function' ||
    typeof keyboardManager._onLedKeyChanged !== 'function'
  ) {
    return false;
  }

  keyboardManager.sendVScanKey = function (
    vScanCode: number,
    isDown: boolean,
  ): void {
    // `this` matters here: the SDK's implementation is a closure over the manager instance, and callers
    // invoke it as a method, so preserve that rather than capturing `keyboardManager`.
    const manager = this as WmksKeyboardManager;

    manager._vncDecoder.onKeyVScan(vScanCode, isDown);

    if (modifierKeys.indexOf(vScanCode) !== -1) {
      manager._serverModifierStatus[vScanCode] = isDown;
    }

    if (ledKeys.indexOf(vScanCode) !== -1 && isDown) {
      manager._onLedKeyChanged(vScanCode);
    }
  };

  keyboardManager.__cfLockKeyPatchApplied = true;
  return true;
}

export interface WmksClient {
  connect(url: string): Promise<void>;
  destroy(): void;
  disconnect(): void;

  getConnectionState(): WmksConnectionState;

  /**
   * This function is not documented by Broadcom but seems to exist and may be strictly related to
   * focus on the virtual console OR clipboard reading OR both OR neither.
   */
  grab(): void;

  register(event: WmksEvents, handler: WmksEventHandler): WmksClient;

  /**
   * Sends a Ctrl+Alt+Del key combination to the remote machine.
   */
  sendCAD(): void;

  /**
   * Sends a string as keyboard input to the server.
   */
  sendInputString(input: string): void;

  /**
   * Set an option WMKS client.
   *
   * @param option - which option's value to update.
   * @param value - a boolean value enabling/disabling the option.
   */
  setOption(option: WmksSettableOptions, value: boolean): void;

  showKeyboard(): void;

  /**
   * Forcibly remove focus from the remote console (I think)
   */
  ungrab(): void;

  /**
   * Broadcom's description: Changes the resolution or rescales the remote screen to match the container size. Behavior depends on settings for changeResolution, rescale, and position options described in createMKS Options.
   *
   * See: https://techdocs.broadcom.com/us/en/vmware-cis/vsphere/vsphere-sdks-tools/8-0/html-console-sdk-programming-guide/html-console-sdk-api/display-related-apis.html
   */
  updateScreen(): void;

  /**
   * Undocumented. The jQuery widget instance behind this client, used only by {@link patchWmksLockKeys}
   * to reach the keyboard manager. Absent until the client has connected.
   */
  wmksData?: {
    _keyboardManager?: WmksKeyboardManager;
  };
}

/**
 * Undocumented internals of the SDK's `KeyboardManager2`, declared only to support
 * {@link patchWmksLockKeys}. Do not depend on these anywhere else.
 */
export interface WmksKeyboardManager {
  __cfLockKeyPatchApplied?: boolean;
  _onLedKeyChanged(vScanCode: number): void;
  _serverModifierStatus: Record<number, boolean>;
  _vncDecoder: { onKeyVScan(vScanCode: number, isDown: boolean): void };
  sendVScanKey(vScanCode: number, isDown: boolean): void;
}

export interface WmksClientCreateOptions {
  changeResolution?: boolean;
  position?: WmksPosition;

  /**
   * Indicates whether to rescale the remote screen to fit the container size. (Defaults to true)
   */
  rescale?: boolean;
  useNativePixels?: boolean;
  useVNCHandshake?: boolean;
}

export interface WMKS {
  get version(): string;

  /**
   * A subset of the SDK's constants — only the members {@link patchWmksLockKeys} needs. `KB2` is absent
   * on SDK builds which don't ship the vscan keyboard manager.
   */
  CONST?: {
    KB2?: {
      LedKeys?: number[];
      ModifierKeys?: number[];
    };
  };

  /**
   * Create a client which connects to a remote console hosted on a VMWare cluster.
   *
   * @param hostElementId The ID of a DOM element that will have a canvas injected into it by Broadcom's HTML Console SDK upon successful connection.
   * @param options Options which identify and specify the behavior of the virtual console.
   */
  createWMKS(
    hostElementId: string,
    options?: WmksClientCreateOptions,
  ): WmksClient;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WmksEventHandler = (e: any, data: any) => void;
