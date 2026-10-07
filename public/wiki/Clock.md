# Clock & Stopwatch Mode User Manual

This chapter details the operating instructions, RTC synchronization, split timing, and visuals for **Clock & Stopwatch Mode (`MODE_CLOCK` / G-code `M3`)**.

---

## 🕒 Mode Overview

Clock & Stopwatch Mode serves as a general-purpose gym wall clock, count-up stopwatch, and split-time recorder. It uses the device's internal Real-Time Clock (RTC) synchronized over BLE/Wi-Fi or external NTP sources.

---

## 🎛️ Physical & Web Unified Workflow

Operation can be handled using the physical **Hardware Control Unit** or the **Web App Interface (`timer-ctrl`)**.

```
+-----------------------------------------------------------------------------------------+
| CLOCK & STOPWATCH WORKFLOW                                                              |
+-----------------------------------------------------------------------------------------+
| 1. System Time Sync (`TME`) ➔ 2. Start Stopwatch ➔ 3. Split Time Capture ➔ 4. Reset    |
|    (Browser / RTC Sync)       (Count-Up Stopwatch)    (Lane A / Lane B Split) (Clear)   |
+-----------------------------------------------------------------------------------------+
```

### 1. Synchronizing Device Time (`TME`)
- **Browser Time Sync Button**: In the Web UI Settings drawer, click **🕒 Sync System Time with Browser**.
  - Sends `TME YYYY-MM-DD HH:MM:SS` to the device.
  - Updates system time and syncs hardware RTC (`rtc_node_sync_from_system()`).
- **Timezone Configuration (`TZ`)**: Select timezone presets (e.g., `Europe/Helsinki`, `UTC`, `US/Eastern`) or enter custom POSIX timezone string.

### 2. Stopwatch Operation
- **Start / Stop**:
  - **Hardware Control Unit**: Press `BTN_0` to Start or Pause the count-up timer.
  - **Web UI**: Click **▶ START (`E6`)** to start counting up from `00:00.0`.
- **Split Time Capture**:
  - Press `BTN_2` (Lane A) or `BTN_3` (Lane B) on the hardware station, or click **🏆 Winner A / Winner B** on the web interface to log split times for individual lanes without stopping the master clock.
- **Reset Stopwatch**: Press **🔄 RESET (`R`)** or `BTN_1` (`EVENT_UI_RESET`) to reset time to zero.

---

## ⚙️ Settings & Parameters

Configure Clock parameters via hardware menu or Web UI Settings Panel:

| Parameter | G-Code | OLED Menu Path | Web UI Setting | Default / Range |
| :--- | :--- | :--- | :--- | :--- |
| **Climb Mode** | `C M3` | Mode Select ➔ Clock | Climb Mode Dropdown ➔ Clock | `3` (Clock) |
| **System Time** | `TME` | System ➔ Device RTC Time | 🕒 Sync System Time Button | `TME YYYY-MM-DD HH:MM:SS` |
| **Timezone** | `TZ` | System ➔ Timezone Preset | Timezone Preset Dropdown | POSIX TZ string |
| **Show Tenths** | `C X1` | Display ➔ Show Tenths | Show Tenths Checkbox | `1` (Enabled) / `0` (Disabled) |
| **Radio Mode** | `RDO` / `C D`| Radio ➔ Radio Mode | Radio Mode Dropdown | `WIFI` / `BLE` |

---

## 📐 Hardware & Web UI Visuals

### Physical Control Station Diagram
The control station OLED shows real-time clock time or active count-up stopwatch:

![Control Unit Functional Diagram](images/control-unit-diagram.jpg)

### Web Interface Clock Mode Layout
The Web UI provides master clock display and browser RTC sync controls:

```
+-----------------------------------------------------------------------+
| [🟢 Connected (WiFi)]  MODE: Clock                      [⚙️ Settings] |
+-----------------------------------------------------------------------+
|                                14:30:45                               |
|                         STATE: RACING (CLOCK)                         |
+-----------------------------------------------------------------------+
|  [ ▶ START (E6) ]       [ 🔄 RESET (R) ]       [ 🕒 SYNC TIME (TME) ]  |
+-----------------------------------------------------------------------+
|  SYSTEM TIME & TIMEZONE:                                              |
|  Device Time: 2026-10-07 14:30:45                                     |
|  Timezone: Europe/Helsinki (EET/EEST)                                 |
+-----------------------------------------------------------------------+
```
*(Placeholder image for Web UI: `images/web-ui-clock.png`)*
