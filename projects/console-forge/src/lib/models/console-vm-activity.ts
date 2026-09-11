// Copyright 2026 Carnegie Mellon University. All rights reserved.
// Released under an MIT (SEI)-style license. See LICENSE.md for license information.

/** Application-owned operation feedback, independent of power and console connection state. */
export interface ConsoleVmActivity {
  kind: "starting" | "migrating" | "busy" | "unknown";
  status: "active" | "failed";
  message?: string | null;
}
