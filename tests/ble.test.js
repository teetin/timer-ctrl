import { test, expect } from 'bun:test';
import { BLEDevice } from '../public/ble.js';

// Mock Bluetooth device for tests
class MockDevice {
  constructor() {
    this.listeners = {};
  }

  addEventListener(event, cb) {
    this.listeners[event] = cb;
  }

  removeEventListener(event, cb) {
    if (this.listeners[event] === cb) {
      delete this.listeners[event];
    }
  }

  trigger(event) {
    if (this.listeners[event]) {
      this.listeners[event]();
    }
  }
}

test('onDisconnected callback is called on handleDisconnection', () => {
  const ble = new BLEDevice();
  ble.device = new MockDevice();
  let called = false;
  ble.onDisconnected(() => {
    called = true;
  });

  ble._handleDisconnection();

  expect(called).toBe(true);
  expect(ble.device).toBe(null);
});
