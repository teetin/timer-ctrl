# Bouldering Discipline User Manual

This chapter details the unified operating instructions, configuration, IFSC audio signals, and visuals for **Bouldering (`MODE_BOULDER` / G-code `M1`)**.

---

## 🧗 Discipline Overview

Bouldering utilizes structured rotation periods combining active climbing intervals with rotation/transition blocks. The timing system supports both **Qualifications Mode** (automated looping) and **Finals Mode** (referee-managed transitions).

---

## 🎛️ Physical & Web Unified Workflow

Operation can be handled seamlessly through the physical **Hardware Control Unit** or the **Web App Interface (`timer-ctrl`)**.

```
+-----------------------------------------------------------------------------------------+
| BOULDERING ROTATION WORKFLOW                                                            |
+-----------------------------------------------------------------------------------------+
| [TRANSITION 15s] ➔ [START BEEP 523Hz] ➔ [CLIMB 4m/5m] ➔ [1-MIN BEEP] ➔ [5s PIPS & END] |
| (Green Text)        (Rotation Begins)    (White Text)      (1760Hz Tone)    (Red / 880Hz) |
+-----------------------------------------------------------------------------------------+
```

### 1. Qualifications Mode (Auto-Looping)
- **Execution Flow**: `TRANSITION` ➔ `CLIMB` ➔ `TRANSITION` ➔ `CLIMB` ...
- **Automated Loop (`Q1`)**: Once started, the timer automatically loops through climb and rest intervals without requiring referee intervention.
- **Start / Pause / Resume**:
  - **Hardware Control Unit**: Press `BTN_0` to Start or Pause. Press `BTN_0` again to Resume.
  - **Web UI**: Click **▶ START (`E6`)** to start. Click **▶ PAUSE / RESUME** or **⛔ ABORT (`E8`)** as needed.

### 2. Finals Mode (Manual Rotation)
- **Execution Flow**: `CLIMB` ➔ `FINISHED` (Halts and awaits referee command).
- **Manual Transition**: When the referee signals the start of the rotation shift, pressing **START** triggers a short transition countdown (default 6s), followed by the 523Hz start beep for the next climber.

### 3. IFSC Standard Audio Profile
All audio signals follow strict IFSC competition tone standards:
- **Rotation Start Signal**: **523 Hz (600ms)** starting beep played at the exact moment Transition reaches 0.
- **1-Minute Warning**: **1760 Hz (400ms)** single clear beep when exactly 60 seconds remain in the climbing period.
- **Final 5-Second Countdown**: Short pips at 5.0s, 4.0s, 3.0s, 2.0s, and 1.0s remaining (**440 Hz, 100ms**).
- **Rotation End Tone**: Long end buzzer (**880 Hz, 1000ms**) played at exact time 0.0s.

### 4. Display Visual Colors
- **Transition Phase**: Timer text displays in **GREEN** (`0x00FF00`).
- **Climbing Phase**: Timer text displays in high-contrast **WHITE** (`0xFFFFFF`).
- **Final 5 Seconds**: Timer text switches to **RED** warning text.

---

## ⚙️ Settings & Parameters

Configure Bouldering settings via physical rotary encoder or Web UI Settings Panel:

| Parameter | G-Code | OLED Menu Path | Web UI Setting | Default / Range |
| :--- | :--- | :--- | :--- | :--- |
| **Climb Mode** | `C M1` | Mode Select ➔ Boulder | Climb Mode Dropdown ➔ Boulder | `1` (Boulder) |
| **Climb Duration** | `C C240` | Timing ➔ Climb Duration | Climb Duration (s) | `240` (4m) or `300` (5m) |
| **Transition Duration**| `C T15` | Timing ➔ Rest Duration | Transition Duration (s) | `15` (Qualifications) / `6` (Finals) |
| **Auto-Loop** | `C Q1` | Timing ➔ Auto-Loop | Auto-Loop Checkbox | `1` (Enabled for Quals) / `0` (Finals) |
| **Countdown Beeps** | `C B1` | Audio ➔ Countdown Beeps | Countdown Beeps Checkbox | `1` (Enabled) |
| **Audio Volume** | `C V<0-100>`| Audio ➔ Volume | Volume Slider | `100%` |

---

## 📐 Hardware & Web UI Visuals

### Physical Control Station Diagram
The control station allows quick pause, resume, reset, and duration adjustments via rotary encoder:

![Control Unit Functional Diagram](images/control-unit-diagram.jpg)

### Web Interface Bouldering Layout
The Web UI visualizes active rotation phase, stage pipeline, and flow progress:

```
+-----------------------------------------------------------------------+
| [🟢 Connected (BLE)]  MODE: Boulder                     [⚙️ Settings] |
+-----------------------------------------------------------------------+
|                                03:45.0                                |
|                      STATE: RACING (CLIMBING)                         |
+-----------------------------------------------------------------------+
|  [ ▶ START (E6) ]       [ 🔄 RESET (R) ]       [ ⛔ ABORT (E8) ]       |
+-----------------------------------------------------------------------+
|  FLOW VISUALIZER:                                                     |
|  [ TRANSITION 15s ]  ➔  [ CLIMB 240s ]  ➔  [ TRANSITION 15s ]        |
|  Current: Active Climbing (Time Remaining: 03:45.0)                   |
+-----------------------------------------------------------------------+
```
*(Placeholder image for Web UI: `images/web-ui-boulder.png`)*
