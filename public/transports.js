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
      if (this.device) {
        this.device.removeEventListener('gattserverdisconnected', this._boundHandleDisconnection);
      }
      if (this.txCharacteristic) {
        try {
          await this.txCharacteristic.stopNotifications();
        } catch (e) {}
      }
      if (this.device && this.device.gatt && this.device.gatt.connected) {
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

export class WebSocketTransport {
  constructor(baseUrl = '') {
    // Convert http/https to ws/wss
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = baseUrl || window.location.host;
    this.wsUrl = `${protocol}//${host}/ws`;
    this.socket = null;
    this.onReceiveCallback = null;
    this.disconnectCallbacks = [];
    this.connected = false;
  }

  async connect() {
    if (this.socket) await this.disconnect();

    return new Promise((resolve, reject) => {
      try {
        this.socket = new WebSocket(this.wsUrl);

        this.socket.onopen = () => {
          this.connected = true;
          resolve(true);
        };

        this.socket.onerror = (err) => {
          console.error('WebSocket Error:', err);
          if (!this.connected) {
            reject(new Error('Failed to connect to WebSocket'));
          }
        };

        this.socket.onclose = () => {
          this._handleDisconnection();
        };

        this.socket.onmessage = (event) => {
          if (this.onReceiveCallback) {
            this.onReceiveCallback(event.data);
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  async disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this._handleDisconnection();
  }

  async send(data) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not open');
    }
    // G-code protocol usually expects newline
    const d = data.endsWith('\n') ? data : data + '\n';
    this.socket.send(d);
  }

  onReceive(callback) {
    this.onReceiveCallback = callback;
  }

  onDisconnected(callback) {
    this.disconnectCallbacks.push(callback);
  }

  isConnected() {
    return this.connected && this.socket && this.socket.readyState === WebSocket.OPEN;
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
          this.onReceiveCallback(event.data);
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
    // Reverting to /cmd if needed, or keeping existing logic
    const url = `${this.baseUrl}/cmd?val=${encodeURIComponent(trimmed)}`;

    try {
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
      const text = await resp.text();
      if (text && this.onReceiveCallback) {
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
