export class BLEDevice {
  constructor() {
    this.device = null;
    this.server = null;
    this.service = null;
    this.rxCharacteristic = null;
    this.txCharacteristic = null;
    this.disconnectCallbacks = [];
    this._boundHandleDisconnection = this._handleDisconnection.bind(this);
    this.NUS_SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
    this.RX_CHARACTERISTIC_UUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
    this.TX_CHARACTERISTIC_UUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';
  }

  async connect() {
    try {
      // Request device that provides the Nordic UART Service (NUS)
      this.device = await navigator.bluetooth.requestDevice({
        filters: [
          {
            services: [this.NUS_SERVICE_UUID],
          },
        ],
      });

      // Connect to GATT server
      this.server = await this.device.gatt.connect();

      // Get NUS service
      this.service = await this.server.getPrimaryService(this.NUS_SERVICE_UUID);

      // Get characteristics
      this.rxCharacteristic = await this.service.getCharacteristic(this.RX_CHARACTERISTIC_UUID);
      this.txCharacteristic = await this.service.getCharacteristic(this.TX_CHARACTERISTIC_UUID);

      // Start notifications
      await this.txCharacteristic.startNotifications();

      // Listen for unexpected disconnections
      this.device.addEventListener('gattserverdisconnected', this._boundHandleDisconnection);

      return true;
    } catch (error) {
      console.error('BLE Connection Error:', error);
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.txCharacteristic) {
        await this.txCharacteristic.stopNotifications();
      }

      if (this.device && this.device.gatt.connected) {
        await this.device.gatt.disconnect();
      }
    } catch (error) {
      console.error('BLE Disconnect Error:', error);
      throw error;
    } finally {
      this._handleDisconnection();
    }
  }

  async send(data) {
    if (!this.rxCharacteristic) {
      throw new Error('Device not connected');
    }

    const encoder = new TextEncoder();
    await this.rxCharacteristic.writeValue(encoder.encode(data));
  }

  onReceive(callback) {
    if (!this.txCharacteristic) {
      throw new Error('Device not connected');
    }

    this.txCharacteristic.addEventListener('characteristicvaluechanged', (event) => {
      const decoder = new TextDecoder();
      const value = decoder.decode(event.target.value);
      callback(value);
    });
  }

  onDisconnected(callback) {
    this.disconnectCallbacks.push(callback);
  }

  _handleDisconnection() {
    if (this.device) {
      this.device.removeEventListener('gattserverdisconnected', this._boundHandleDisconnection);
    }
    this.device = null;
    this.server = null;
    this.service = null;
    this.rxCharacteristic = null;
    this.txCharacteristic = null;

    this.disconnectCallbacks.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.error('Disconnect callback error:', err);
      }
    });
    this.disconnectCallbacks = [];
  }

  // Checks if the device is connected by verifying the presence of `this.device`,
  // `this.device.gatt`, and `this.device.gatt.connected`. The `!!` operator ensures
  // a boolean return value.
  isConnected() {
    return !!(this.device && this.device.gatt && this.device.gatt.connected);
  }

  getDeviceName() {
    return this.device ? this.device.name : null;
  }
}
