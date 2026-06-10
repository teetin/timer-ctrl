export class BLETransport {
  constructor() {
    this.device = null;
    this.server = null;
    this.service = null;
    this.rxCharacteristic = null;
    this.txCharacteristic = null;
    this.onReceiveCallback = null;
    this.disconnectCallbacks = [];
    this._boundHandleDisconnection = this._handleDisconnection.bind(this);
    this.NUS_SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
    this.RX_CHARACTERISTIC_UUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
    this.TX_CHARACTERISTIC_UUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';
  }

  async connect() {
    try {
      this.device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [this.NUS_SERVICE_UUID] }],
      });

      this.server = await this.device.gatt.connect();
      this.service = await this.server.getPrimaryService(this.NUS_SERVICE_UUID);
      this.rxCharacteristic = await this.service.getCharacteristic(this.RX_CHARACTERISTIC_UUID);
      this.txCharacteristic = await this.service.getCharacteristic(this.TX_CHARACTERISTIC_UUID);

      await this.txCharacteristic.startNotifications();
      this.txCharacteristic.addEventListener('characteristicvaluechanged', (event) => {
        const decoder = new TextDecoder();
        const value = decoder.decode(event.target.value);
        if (this.onReceiveCallback) this.onReceiveCallback(value);
      });

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
    } finally {
      this._handleDisconnection();
    }
  }

  async send(data) {
    if (!this.rxCharacteristic) throw new Error('Not connected');
    const encoder = new TextEncoder();
    // Protocol requires newline termination
    const d = data.endsWith('\n') ? data : data + '\n';
    await this.rxCharacteristic.writeValue(encoder.encode(d));
  }

  onReceive(callback) {
    this.onReceiveCallback = callback;
  }

  onDisconnected(callback) {
    this.disconnectCallbacks.push(callback);
  }

  isConnected() {
    return !!(this.device && this.device.gatt && this.device.gatt.connected);
  }

  getDeviceName() {
    return this.device ? this.device.name : 'BLE Device';
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

    this.disconnectCallbacks.forEach((cb) => cb());
  }
}

export class HTTPTransport {
  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
    this.eventSource = null;
    this.onReceiveCallback = null;
    this.disconnectCallbacks = [];
    this.connected = false;
  }

  async connect() {
    if (this.eventSource) this.disconnect();

    return new Promise((resolve, reject) => {
      try {
        this.eventSource = new EventSource(`${this.baseUrl}/events/stream`);

        this.eventSource.onopen = () => {
          this.connected = true;
          resolve(true);
        };

        this.eventSource.onerror = (err) => {
          console.error('SSE Error:', err);
          if (!this.connected) {
            reject(new Error('Failed to connect to SSE'));
          } else {
            this._handleDisconnection();
          }
        };

        this.eventSource.onmessage = (event) => {
          if (!this.onReceiveCallback) return;

          try {
            const data = JSON.parse(event.data);
            if (typeof data === 'string') {
              this.onReceiveCallback(data);
            } else if (data.id !== undefined) {
              // Reconstruct G-code string from JSON
              // Format: E<code> <ts:hex> [args...]
              let msg = `E${data.id} ${(data.ts || 0).toString(16)}`;

              // Map common keys if they exist in the JSON
              if (data.meta !== undefined) msg += ` M${data.meta.toString(16)}`;
              if (data.lane !== undefined) msg += ` L${data.lane}`;
              if (data.state !== undefined) msg += ` S${data.state}`;
              if (data.node !== undefined) msg += ` N${data.node}`;
              if (data.athlete !== undefined) msg += ` A${data.athlete.toString(16)}`;

              this.onReceiveCallback(msg);
            }
          } catch (e) {
            this.onReceiveCallback(event.data);
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  async disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this._handleDisconnection();
  }

  async send(data) {
    const trimmed = data.trim();
    const url = `${this.baseUrl}/cmd?val=${encodeURIComponent(trimmed)}`;

    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
      const text = await resp.text();
      if (text && this.onReceiveCallback) {
        // Many G-code implementations echo the command or return OK
        this.onReceiveCallback(text);
      }
    } catch (error) {
      console.error('HTTP Send Error:', error);
      throw error;
    }
  }

  onReceive(callback) {
    this.onReceiveCallback = callback;
  }

  onDisconnected(callback) {
    this.disconnectCallbacks.push(callback);
  }

  isConnected() {
    return this.connected;
  }

  getDeviceName() {
    return `Unit (${window.location.hostname})`;
  }

  _handleDisconnection() {
    if (this.connected) {
      this.connected = false;
      this.disconnectCallbacks.forEach((cb) => cb());
    }
  }
}
