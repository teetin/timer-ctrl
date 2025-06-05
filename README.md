# Web BLE UART Terminal

A web-based terminal for interacting with BLE devices that support Nordic UART Service (NUS).

## Features

- Connect to BLE devices supporting Nordic UART Service
- Send and receive text messages
- Terminal-style interface with timestamps
- Save logs to file
- Clean and responsive UI

## Requirements

- A web browser that supports Web Bluetooth API (Chrome, Edge, or Opera)
- A BLE device that implements Nordic UART Service (NUS)

## Usage

1. Start a local server:

   ```bash
   bunx serve
   ```

2. Open your browser and navigate to the local server address (typically `http://localhost:3000`)

3. Click "Connect to Device" and select your BLE device from the popup dialog

4. Once connected, you can:
   - Send messages using the input field
   - View received messages in the terminal
   - Clear the terminal using the "Clear Terminal" button
   - Save logs to a file using the "Save Log" button
   - Disconnect from the device using the "Disconnect" button

## Nordic UART Service (NUS) UUIDs

- Service UUID: `6e400001-b5a3-f393-e0a9-e50e24dcca9e`
- RX Characteristic UUID: `6e400002-b5a3-f393-e0a9-e50e24dcca9e` (Write)
- TX Characteristic UUID: `6e400003-b5a3-f393-e0a9-e50e24dcca9e` (Notify)

## License

MIT
