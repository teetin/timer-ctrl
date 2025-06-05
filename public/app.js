import { BLEDevice } from './ble.js';
import { Terminal } from './terminal.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize BLE device and Terminal
  const bleDevice = new BLEDevice();
  const terminal = new Terminal(document.getElementById('terminal'));

  bleDevice.onDisconnected(() => {
    onDisconnected();
    terminal.print('Disconnected from device', 'info');
  });

  // Get UI elements
  const connectBtn = document.getElementById('connectBtn');
  const disconnectBtn = document.getElementById('disconnectBtn');
  const deviceInfo = document.getElementById('deviceInfo');
  const deviceName = document.getElementById('deviceName');
  const messageInput = document.getElementById('messageInput');
  const sendBtn = document.getElementById('sendBtn');
  const clearBtn = document.getElementById('clearBtn');
  const saveBtn = document.getElementById('saveBtn');

  // Connect button handler
  connectBtn.addEventListener('click', async () => {
    try {
      await bleDevice.connect();
      onConnected();
      terminal.print('Connected to device: ' + bleDevice.getDeviceName(), 'success');

      // Set up receive handler
      bleDevice.onReceive((data) => {
        terminal.print('Received: ' + data, 'received');
      });
    } catch (error) {
      terminal.print('Connection failed: ' + error.message, 'error');
    }
  });

  // Disconnect button handler
  disconnectBtn.addEventListener('click', async () => {
    try {
      await bleDevice.disconnect();
    } catch (error) {
      terminal.print('Disconnect failed: ' + error.message, 'error');
    }
  });

  // Send button handler
  sendBtn.addEventListener('click', async () => {
    const message = messageInput.value.trim();
    if (message) {
      try {
        await bleDevice.send(message);
        terminal.print('Sent: ' + message, 'sent');
        messageInput.value = '';
      } catch (error) {
        terminal.print('Send failed: ' + error.message, 'error');
      }
    }
  });

  // Message input enter key handler
  messageInput.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
      sendBtn.click();
    }
  });

  // Clear button handler
  clearBtn.addEventListener('click', () => {
    terminal.clear();
  });

  // Save button handler
  saveBtn.addEventListener('click', async () => {
    await terminal.saveLogs();
  });

  // Update UI on connection
  function onConnected() {
    connectBtn.classList.add('hidden');
    deviceInfo.classList.remove('hidden');
    deviceName.textContent = bleDevice.getDeviceName();
    messageInput.disabled = false;
    sendBtn.disabled = false;
  }

  // Update UI on disconnection
  function onDisconnected() {
    connectBtn.classList.remove('hidden');
    deviceInfo.classList.add('hidden');
    deviceName.textContent = 'None';
    messageInput.disabled = true;
    sendBtn.disabled = true;
  }

  // Initial state
  onDisconnected();
});
