# IFSC Speed Climbing User Manual

This chapter details the unified operating instructions, configuration, state machine behavior, and visuals for **IFSC Speed Climbing (`MODE_SPEED` / G-code `M0`)**.

---

## ⚡ Discipline Overview

Speed climbing features a standardized dual-lane (Lane A and Lane B) 15-meter vertical ascent. The timing system enforces official IFSC rules with microsecond timer accuracy (`esp_timer_get_time()`), local 60fps display rendering, dual start-pad precondition sensing, an automated 3-beep countdown sequence, and automated false-start detection.

---

## 🎛️ Physical & Web Unified Workflow

The system can be operated using either the physical **Hardware Control Station** or the **Web App Interface (`timer-ctrl`)**. Both methods synchronize instantly over BLE, Wi-Fi, or CAN bus.

```
+-----------------------------------------------------------------------------------+
| SPEED CLIMBING WORKFLOW                                                          |
+-----------------------------------------------------------------------------------+
| 1. Step On Pad ➔ 2. Starter "Ready" ➔ 3. Automated 3-Beep ➔ 4. Race / Finish      |
|    (Orange Light)   (Flashing Green)     (880Hz -> 1760Hz)   (Pad Hit / Manual) |
+-----------------------------------------------------------------------------------+
```

### 1. Precondition (Stepping on Pad)
- **Climber Action**: Climbers step onto the starting pressure pads on Lane A and/or Lane B.
- **Hardware Indicator**: Pad status light changes from **RED** (off pad) to **ORANGE** (`0xFD20`). OLED display updates to `PRECONDITION`.
- **Web UI Indicator**: Lane status badge shows `PRECONDITION` with orange highlight.

### 2. Initiating Start Sequence
- **Hardware Control Unit**: Starter presses `BTN_0` (Starter Button) or turns the Rotary Encoder to **Start**.
- **Web UI**: Press the **▶ START (`E6`)** button in the main controls panel.
- **System Action**: Audio unit issues sequence pips:
  - **-2.0s**: Low Pip (880 Hz, 200ms) — Display shows `SET .`
  - **-1.0s**: Low Pip (880 Hz, 200ms) — Display shows `SET . .`
  - **0.0s**: High "GO" Tone (1760 Hz, 100ms) — Display transitions to **RACING** (`SS.CC`).

### 3. Racing & False Start Rules
- **False Start Window**: Any foot lift / pad release within 100ms *after* the GO signal is flagged as a False Start.
  - **Finals Mode**: Instantly halts race, triggers intermittent recall alarm (1568 Hz buzzer), and displays flashing `FALSE` on the affected lane.
  - **Qualification Mode**: Visually flags false start on the offending lane while allowing the other lane to continue climbing.
- **Top Sensor Touch**: Climber hits the finish pad at the top of the route.
  - **Winner (First Touch)**: Timer locks in `SS.MMM` in continuous **GREEN** text with `WIN` badge.
  - **Loser (Second Touch)**: Timer locks in `SS.MMM` in continuous **RED** text with `LOSS` badge.

### 4. Manual Referee Overrides & Reset
- **Manual Judge Override**:
  - **Hardware Control Unit**: Press `BTN_2` (`EVENT_REFEREE_JUDGE_A`) for Lane A or `BTN_3` (`EVENT_REFEREE_JUDGE_B`) for Lane B.
  - **Web UI**: Press **🏆 Winner A (`E29`)** or **🏆 Winner B (`E30`)** in the Lane panel to force winner declaration. Press **⚠️ Fall A** or **⚠️ Fall B** to record a fall (`E25`).
- **Reset to Ready**:
  - **Hardware Control Unit**: Short press `BTN_0` or `BTN_1` (`EVENT_UI_RESET`).
  - **Web UI**: Click **🔄 RESET (`R`)**.

---

## ⚙️ Settings & Parameters

Configure Speed Mode parameters via physical rotary encoder or Web UI Settings Panel:

| Parameter | G-Code | OLED Menu Path | Web UI Setting | Default / Range |
| :--- | :--- | :--- | :--- | :--- |
| **Climb Mode** | `C M0` | Mode Select ➔ Speed | Climb Mode Dropdown ➔ Speed | `0` (Speed) |
| **Countdown Beeps**| `C B1` | Audio ➔ Countdown Beeps | Countdown Beeps Checkbox | `1` (Enabled) |
| **Audio Volume** | `C V<0-100>`| Audio ➔ Volume | Volume Slider | `100%` |
| **Waveform** | `C W<0-1>` | Audio ➔ Waveform | Waveform Dropdown | `0: Warm Sine` / `1: Square` |
| **Assigned Lane** | `C A<0-2>` | System ➔ Assigned Lane | Assigned Lane Dropdown | `0: Global`, `1: Lane A`, `2: Lane B` |

---

## 📐 Hardware & Web UI Visuals

### Physical Control Station Diagram
The control station features debounced mechanical buttons (`BTN_0` to `BTN_3`) and rotary encoder:

![Control Unit Functional Diagram](images/control-unit-diagram.jpg)

### Web Interface Speed Mode Layout
The Web UI provides live telemetry, timer clocks, and referee control buttons:

```
+-----------------------------------------------------------------------+
| [🟢 Connected (BLE)]  MODE: Speed                       [⚙️ Settings] |
+-----------------------------------------------------------------------+
|                                00.000                                 |
|                            STATE: IDLE / READY                        |
+-----------------------------------------------------------------------+
|  [ ▶ START (E6) ]       [ 🔄 RESET (R) ]       [ ⛔ ABORT (E8) ]       |
+-----------------------------------------------------------------------+
|  LANE A (Left)                             LANE B (Right)             |
|  Status: READY                             Status: READY              |
|  Time: --.---                              Time: --.---               |
|  [ 🏆 Winner A (E29) ] [ ⚠️ Fall A ]       [ 🏆 Winner B (E30) ] [ ⚠️ Fall B ] |
+-----------------------------------------------------------------------+
```
*(Placeholder image for Web UI: `images/web-ui-speed.png`)*
