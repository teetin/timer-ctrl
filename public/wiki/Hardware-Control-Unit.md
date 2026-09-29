# Hardware Control Unit (OLED Display Interface)

The **T2Timer Control Unit** is the main physical hardware controller powering the T2Climb timing ecosystem. Built around an ESP32 microcontroller with a high-contrast monochrome OLED display, physical push-buttons / rotary encoder, and TWAI CAN bus connectivity, it operates either as a standalone timing controller or as the master brain unit.

---

## 📐 Physical Hardware Overview

```
+-------------------------------------------------------------+
|  [BAT 85%] [BLE: ON] [CAN: 3 NODES]       T2TIMER CTRL v2  |
| +---------------------------------------------------------+ |
| |  MODE: BOULDER              LANE: GLOBAL (A+B)          | |
| |                                                         | |
| |                      02:45.0                            | |
| |                                                         | |
| |  STATE: RACING              LOOP: AUTO (Q1)             | |
| +---------------------------------------------------------+ |
|                                                             |
|   (▲ UP)       (▼ DOWN)       (● SELECT)       (◀ BACK)     |
|                                                             |
|   [  ▶ START / STOP  ]         [  🔄 RESET / ABORT  ]       |
+-------------------------------------------------------------+
```

---

## 1. 🖥️ OLED Display Screen Layout

The OLED screen is divided into three functional zones:

### Top Status Bar

- 🔋 **Battery Indicator**: Displays battery charge percentage and charging status.
- 📶 **Radio Status**: Shows active communication mode (`BLE` or `WIFI` icon) and wireless client connection status.
- 🚌 **CAN Bus Status**: Displays active CAN network state and count of detected satellite nodes (e.g. Pad sensors, LED display boards, Audio amplifiers).

### Center Primary Screen Area

- **Mode Header**: Displays active discipline (`SPEED`, `BOULDER`, `LEAD`, `CLOCK`, or `CIRCUIT`).
- **Main Digital Timer**: Large, clear font displaying `MM:SS.d` (or `MM:SS`).
- **Sub-status**: Displays active interval segment (`PREP`, `CLIMB`, or `REST`) during auto-loop operations.

### Bottom Status Line

- **System State**: Shows current system state machine status (`IDLE`, `STARTER_WAIT`, `BEEPING`, `RACING`, `FINISHED`, `FALL`, etc.).
- **Assigned Lane**: Displays lane assignment (`LANE A`, `LANE B`, or `GLOBAL`).

---

## 2. 🔘 Physical Controls & Navigation

The front panel features tactile control inputs:

- **Navigation Buttons / Rotary Encoder**:
  - **▲ UP / ▼ DOWN**: Scroll through menu options or increment/decrement numeric settings (Durations, Volume).
  - **● SELECT / CONFIRM**: Enter selected menu item or apply configuration.
  - **◀ BACK / CANCEL**: Return to parent menu or clear menu overlay.
- **Dedicated Quick Action Buttons**:
  - **▶ START / STOP**:
    - Short Press: Triggers race start sequence (`E6`).
    - Long Press (2s): Pause/Resume active clock.
  - **🔄 RESET / ABORT**:
    - Short Press in Finish/Idle: Resets system state back to READY (`R`).
    - Long Press while Racing: Immediately aborts active race (`E8`).

---

## 3. 🌲 OLED Menu Tree Structure

Navigating the local OLED menu gives access to essential hardware configuration without requiring a smartphone or web browser:

```
[MAIN MENU]
├── 1. Mode Selection
│   ├── Speed Mode
│   ├── Boulder Mode
│   ├── Lead Mode
│   ├── Clock Mode
│   └── Circuit Mode
├── 2. Timing Parameters
│   ├── Climb Duration (1-3600s)
│   ├── Rest Duration (0-3600s)
│   ├── Prep Duration (0-3600s)
│   └── Auto-Loop (On/Off)
├── 3. Audio & Display
│   ├── Volume (0-100%)
│   ├── Waveform (Sine / Square)
│   ├── Countdown Beeps (On/Off)
│   └── Show Tenths (On/Off)
├── 4. Radio & Communications
│   ├── Radio Mode (Wi-Fi / BLE)
│   ├── View IP / Hostname
│   └── CAN Bus Node Scan
└── 5. System Tools
    ├── Device RTC Time Info
    ├── Battery Diagnostics
    ├── Screen Brightness
    └── Reboot Hardware (!)
```

---

## 4. 🔗 Operating Modes

### A. Standalone Mode

- The Control Unit runs independently using its internal real-time clock, built-in piezo/speaker audio output, and physical button inputs.
- Ideal for localized boulder wall training, speed practice, or basic interval clocking.

### B. Master Control Unit (CAN Bus Network)

- Connected to satellite nodes over TWAI CAN Bus (via RJ45 / M12 interconnects).
- Automatically broadcasts high-precision start pulses (`START_PULSE 0x010`), display sync events (`DISPLAY_SYNC 0x100`), audio commands (`AUDIO_CMD 0x110`), and visual LED patterns (`VISUAL_CMD 0x200`).

### C. Web / Mobile Bridge Mode

- Connects via Bluetooth NUS or Wi-Fi SSE to the **Main Controller Web App**.
- Synchronizes all local OLED menu adjustments seamlessly with the Web UI.
