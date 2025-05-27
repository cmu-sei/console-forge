//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

import { InjectionToken } from "@angular/core";

export const WINDOW = new InjectionToken<Window>("Global window", { factory: () => window });
