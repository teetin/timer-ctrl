# T2Climb Timer System — Wiki Documentation

Welcome to the **T2Climb Timer System** user manual and reference documentation.

This wiki covers all operational aspects of the T2Climb timing ecosystem, including web application interfaces and physical hardware control units.

---

## 📚 Table of Contents

### 1. 🎛️ [Main Controller Web Interface](Main-Controller-UI.md)

Comprehensive user guide for the primary web control panel:

- Connection bar & status indicator
- Live Timer Display & System State Machine
- Mode selection (Speed, Boulder, Lead, Clock, Circuit)
- Single & Dual Lane controls (Lane A & Lane B)
- Flow visualizer for match and auto-loop progression
- Referee, Fall, Abort, and Winner controls

### 2. ⚙️ [System Settings & Debug Terminal](Settings-and-Terminal.md)

Detailed reference for configuring system parameters and terminal commands:

- Transport connectivity (Web Bluetooth NUS vs. Wi-Fi HTTP/SSE)
- Climb, Rest, and Prep duration adjustments
- Circuit Training step editor & raw sequence format (`circ_seq`)
- Audio preferences (Volume, Waveform, Countdown Beeps)
- UI and Lane display settings (Symbols, Tenths, Pro Dark / IFSC Themes)
- Real-Time Clock (RTC) synchronization & POSIX Timezone configuration
- Interactive G-code Debug Terminal and log exporting

### 3. 🖥️ [Hardware Control Unit (OLED Interface)](Hardware-Control-Unit.md)

Complete user manual for the standalone physical Control Unit featuring the built-in OLED display:

- Hardware layout & interface overview
- OLED status bar, icons (Battery, Radio/BLE, CAN status)
- Physical buttons and menu navigation
- Operating modes (Standalone vs. Networked CAN Bus)
- Local setup, manual triggers, and system reset

---

## 🌐 Quick Links & Specifications

- **BLE Service UUID**: `6E400001-B5A3-F393-E0A9-E50E24DCCA9E`
- **Protocol Specifications**: See [`docs/BLE_PROTOCOL.md`](../../docs/BLE_PROTOCOL.md)
- **Event Catalog**: See [`docs/EVENTS.md`](../../docs/EVENTS.md)
