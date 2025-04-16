import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UuidService {
  get(): `${string}-${string}-${string}-${string}-${string}` {
    if (!crypto) {
      throw new Error("Failed to generate UUID: Can't resolve the `crypto` dependency in this environment.");
    }

    return crypto.randomUUID();
  }
}
