import { Inject, Injectable } from '@angular/core';

class SimpleObjectStorage implements Storage {
  private storage = {};

  get length(): number {
    return Object.keys(this.storage).length;
  }

  clear(): void {
    this.storage = {};
  }

  getItem(key: string): string {
    return this.storage[key];
  }

  key(index: number): string {
    const keys = Object.keys(this.storage);
    if (index < keys.length) {return keys[index];}
    else {return null;}
  }

  removeItem(key: string): void {
    delete this.storage[key];
  }

  setItem(key: string, value: string): void {
    this.storage[key] = value;
  }

}

/**
 * Provides localStorage and sessionStorage globally
 * even when not supported by browser
 */
@Injectable({ providedIn: 'root' })
export class StorageProviderService {

  private readonly localStorage: Storage;
  private readonly sessionStorage: Storage;

  constructor(@Inject('Window') window: Window) {
    if (window.localStorage && this.isStorageAvailable(window.localStorage)) {
      this.localStorage = window.localStorage;
    } else {
      this.localStorage = new SimpleObjectStorage();
    }

    if (window.sessionStorage && this.isStorageAvailable(window.sessionStorage)) {
      this.sessionStorage = window.sessionStorage;
    } else {
      this.sessionStorage = new SimpleObjectStorage();
    }
  }

  private isStorageAvailable(storage: Storage): boolean {
    const test = 'test-123';
    try {
      storage.setItem(test, test);
      storage.removeItem(test);
      return true;
    } catch(e) {
      return false;
    }
  }

  getLocalStorage(): Storage {
    return this.localStorage;
  }

  getSessionStorage(): Storage {
    return this.sessionStorage;
  }
}
