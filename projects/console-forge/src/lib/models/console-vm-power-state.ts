//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

/**
 * The power state of the machine hosting a console, as reported by the consuming application.
 * ConsoleForge can't discover this itself: VNC/noVNC and VMWare WMKS both expose console
 * connection state and (optionally) power *commands*, but never the machine's current power state.
 */
export type ConsoleVmPowerState = "off" | "on" | "unknown";
