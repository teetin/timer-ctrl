# Main Controller Web Interface

The **Main Controller UI** is the primary Web Progressive Web App (PWA) interface for operating the T2Climb timing system. It provides real-time timekeeping, dual-lane management, mode selection, and state visualization.

---

## 📱 Interface Layout Overview

```
+-----------------------------------------------------------------------+
| [Status Dot] Connected (BLE/WiFi)            [⚙️ Settings] [💻 Terminal] |
+-----------------------------------------------------------------------+
|  MODE: Boulder                 LOOP: Auto-Loop On                     |
|                              00:45.0                                  |
+-----------------------------------------------------------------------+
|  [▶ START]     [🔄 RESET]     [⛔ ABORT]     [🏁 FINISH]              |
+-----------------------------------------------------------------------+
|  LANE A (Left)                             LANE B (Right)             |
|  Status: RACING (00:12.3)                  Status: RACING (00:11.8)   |
|  [🏆 Winner A]  [⚠️ Fall A]                [🏆 Winner B]  [⚠️ Fall B]   |
+-----------------------------------------------------------------------+
|  FLOW VISUALIZER: [PREP 15s] -> [CLIMB 60s] -> [REST 15s]             |
+-----------------------------------------------------------------------+
```

---

## 1. 🔌 Connection Panel & Status Bar

Located at the very top of the interface:

- **Status Dot Indicator**:
  - 🟢 **Green**: Connected and receiving real-time telemetry events.
  - 🟡 **Yellow**: Connecting or re-synchronizing with device.
  - 🔴 **Red**: Disconnected.
- **Connection Buttons**:
  - **Connect via Bluetooth**: Launches Web Bluetooth browser picker to connect via Nordic UART Service (NUS).
  - **Connect via WiFi**: Prompts for device IP address or mDNS hostname (`http://t2timer.local`) to connect over HTTP Server-Sent Events (SSE).
- **Disconnect**: Safely terminates the active transport session.
- **Header Actions**:
  - **⚙️ Settings**: Toggles the System Settings configuration panel drawer.
  - **💻 Terminal**: Toggles the Debug Terminal panel drawer.

---

## 2. ⏱️ Timer & System Status Display

The center telemetry panel displays real-time timing metrics:

- **Mode Indicator**: Shows current discipline (`Speed`, `Boulder`, `Lead`, `Clock`, or `Circuit`).
- **Loop Indicator**: Shows whether Auto-Loop (`Q1`) or Single Cycle (`Q0`) is active.
- **Main Digital Clock**: High-visibility digital readout formatted as `MM:SS.d` (or `MM:SS` if tenths display is disabled).
- **System State Badge**: Color-coded indicator of global state (e.g., `IDLE`, `PRECONDITION`, `STARTER_WAIT`, `BEEPING`, `TRANSITION`, `READY`, `RACING`, `FINISHED`, `PAUSED`, `FALSE_START`, `FALL`).

---

## 3. 🎛️ Primary Control Action Buttons

- **▶ START (`E6`)**: Initiates the start sequence for the active mode. In Speed mode, this triggers the standardized countdown beeps (`SEQ_PREP` / `SEQ_PIP` / `RACE_START`).
- **🔄 RESET (`R`)**: Resets all active lane timers back to initial IDLE/READY state.
- **⛔ ABORT (`E8`)**: Immediately cancels an ongoing race or countdown, stopping all timers and returning to IDLE.
- **🏁 FINISH (`E7`)**: Forces the current race session to complete and locks in final times for both lanes.

---

## 4. 🏁 Lane-Specific Controls (Lane A & Lane B)

The Dual-Lane control grid provides independent controls for two side-by-side climbing routes:

### Lane Panel Features:

- **Lane State & Time**: Displays individual swimmer/climbing state and split/finish time for Lane A (Left) and Lane B (Right).
- **🏆 Winner A / Winner B (`E29` / `E30`)**: Manual referee override buttons. Pressing **Winner A** or **Winner B** issues a referee judge decision for the respective lane, freezing its finish time immediately.
- **⚠️ Fall A / Fall B (`E25` L1 S10 / L2 S10)**: Registers a climber fall event on the designated lane, transitioning that lane state to `FALL`.

---

## 5. 📊 Flow Visualizer

The Flow Visualizer provides a dynamic timeline view of the current climb session:

### Stage Pipeline:

1. **Prep Stage (`N`)**: Initial warning/preparation countdown (e.g., 15s) highlighted in yellow.
2. **Climb Stage (`C`)**: Active climbing period highlighted in green.
3. **Rest / Transition Stage (`T`)**: Rest or rotation pause highlighted in blue.

### Auto-Loop (Q0 vs Q1) Behavior:

- **Auto-Loop Disabled (`Q0`)**: Execution halts after completing a single Climb/Rest cycle, awaiting a manual Start command.
- **Auto-Loop Enabled (`Q1`)**: Automatically loops continuously through Prep ➔ Climb ➔ Rest ➔ Prep ➔ Climb.
- **Circuit Mode (`M4`)**: Visualizes multi-step workout routines parsed from the active `circ_seq` sequence string.
