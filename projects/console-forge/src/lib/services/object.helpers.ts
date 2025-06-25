//  ===BEGIN LICENSE===
//  Copyright 2025 Carnegie Mellon University. All rights reserved.
//  Released under an MIT (SEI)-style license. See the LICENSE.md file for license information.
//  ===END LICENSE===

export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export function deepMerge<T>(target: T, patch: DeepPartial<T>): T {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = { ...target };
    for (const key in patch) {
        const patchValue = patch[key];
        const targetValue = target[key];
        if (
            patchValue &&
            typeof patchValue === 'object' &&
            !Array.isArray(patchValue) &&
            typeof targetValue === 'object'
        ) {
            result[key] = deepMerge(targetValue, patchValue);
        } else {
            result[key] = patchValue;
        }
    }
    return result;
}
