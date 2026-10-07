# Circuit Training Mode User Manual

This chapter details the unified operating instructions, step configuration, auto-loop rules, and visuals for **Circuit Training Mode (`MODE_CIRCUIT` / G-code `M4`)**.

---

## 🏋️ Mode Overview

Circuit Training Mode enables custom multi-step High Intensity Interval Training (HIIT) programs and workout sequences. Each program consists of an optional **Initial Prep Phase (`N`)** followed by a structured sequence of **Climb** and **Rest** steps.

---

## 🎛️ Physical & Web Unified Workflow

Operation can be managed using the physical **Hardware Control Unit** or the interactive **Circuit Builder** in the **Web App Interface (`timer-ctrl`)**.

```
+-----------------------------------------------------------------------------------------+
| CIRCUIT TRAINING WORKFLOW                                                               |
+-----------------------------------------------------------------------------------------+
| [INITIAL PREP (N)] ➔ [STEP 1: CLIMB ➔ REST] ➔ [STEP 2: CLIMB ➔ REST] ➔ [AUTO-LOOP (Q1)]|
|  (Optional Warning)   (Interval Step #1)       (Interval Step #2)     (Back to Step #1)|
+-----------------------------------------------------------------------------------------+
```

### 1. Step Sequence Definition (`circ_seq` / `CS`)
- **Step Format**: Pairs of active work time (Climb) and recovery time (Rest) in seconds.
- **Hardware Protocol (`CS`)**:
  - `CS <idx> <climb> <rest>`: Set/update step index `idx` (0-based).
  - `CS <idx> 0 0`: Remove step `idx`.
  - `CS`: Query total step count.
- **Example Program**: `30/15, 45/15, 30/30`
  - Step 0: 30s Climb, 15s Rest
  - Step 1: 45s Climb, 15s Rest
  - Step 2: 30s Climb, 30s Rest

### 2. Execution & Auto-Looping (`Q0` vs `Q1`)
- **Initial Prep (`N`)**: When started from `IDLE`, plays a single pre-workout warning countdown (e.g. 15s) highlighted in yellow.
- **Auto-Loop Disabled (`Q0`)**: Completes Step 1 through Step N and halts in `STATE_FINISHED` after the final rest period.
- **Auto-Loop Enabled (`Q1`)**: Upon completing the final step rest period, automatically loops back to Step 0 Climb.

### 3. Audio & Visual Feedback
- **Audio Profile**: Follows standard IFSC audio tones (523Hz start beep, 1760Hz 1-min warning, 440Hz 5s countdown pips, 880Hz end tone).
- **Display Colors**:
  - **Prep Stage**: Yellow text.
  - **Climb Stage**: Green text.
  - **Rest Stage**: Blue text.

---

## ⚙️ Settings & Parameters

Configure Circuit parameters via hardware menu or Web UI Interactive Step Builder:

| Parameter | G-Code | OLED Menu Path | Web UI Setting | Default / Range |
| :--- | :--- | :--- | :--- | :--- |
| **Climb Mode** | `C M4` | Mode Select ➔ Circuit | Climb Mode Dropdown ➔ Circuit | `4` (Circuit) |
| **Step Sequence** | `CS` / `circ_seq`| Timing ➔ Circuit Steps | Interactive Step Table | `30/15,30/15` |
| **Prep Duration** | `C N15` | Timing ➔ Prep Duration | Prep Warning Duration (s) | `15` (15s prep) |
| **Auto-Loop** | `C Q1` | Timing ➔ Auto-Loop | Auto-Loop Checkbox | `1` (Looping) / `0` (Single) |
| **Countdown Beeps** | `C B1` | Audio ➔ Countdown Beeps | Countdown Beeps Checkbox | `1` (Enabled) |
| **Audio Volume** | `C V<0-100>`| Audio ➔ Volume | Volume Slider | `100%` |

---

## 📐 Hardware & Web UI Visuals

### Physical Control Station Diagram
The control station OLED shows active step index (`STEP 1/3`), segment (`CLIMB` / `REST`), and remaining time:

![Control Unit Functional Diagram](images/control-unit-diagram.jpg)

### Web Interface Circuit Builder & Flow Visualizer
The Web UI provides interactive step adding, editing, and deletion, along with a live flow timeline:

```
+-----------------------------------------------------------------------+
| [🟢 Connected (BLE)]  MODE: Circuit                     [⚙️ Settings] |
+-----------------------------------------------------------------------+
|                                00:24.8                                |
|                   STATE: RACING (STEP #1 CLIMB)                       |
+-----------------------------------------------------------------------+
|  CIRCUIT STEPS BUILDER:                                               |
|  #0 | Climb: 30s | Rest: 15s | [ 🗑️ Delete ]                         |
|  #1 | Climb: 45s | Rest: 15s | [ 🗑️ Delete ]                         |
|  #2 | Climb: 30s | Rest: 30s | [ 🗑️ Delete ]                         |
|  [ ➕ Add Step ]   [ 🔄 Reset Defaults ]                              |
|  Raw Sequence: 30/15,45/15,30/30                                      |
+-----------------------------------------------------------------------+
```
*(Placeholder image for Web UI: `images/web-ui-circuit.png`)*
