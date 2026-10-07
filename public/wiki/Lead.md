# Lead Climbing User Manual

This chapter details the unified operating instructions, configuration, state machine behavior, and visuals for **Lead Climbing (`MODE_LEAD` / G-code `M2`)**.

---

## 🧗 Discipline Overview

Lead climbing enforces official IFSC competition rules governing individual athlete attempts. The system supports an initial **40-second Preparation Countdown** followed by a **6-minute (360s) Climbing Window**. Lead mode features silent starts and silent manual stops to maintain focus in the arena.

---

## 🎛️ Physical & Web Unified Workflow

Operation can be handled seamlessly through the physical **Hardware Control Unit** or the **Web App Interface (`timer-ctrl`)**.

```
+---------------------------------------------------------------------------------------+
| LEAD CLIMBING WORKFLOW                                                                |
+---------------------------------------------------------------------------------------+
| 1. Field Entry (40s Prep) ➔ 2. Start Climb (Feet Off Ground) ➔ 3. 1-Min Warning ➔ 4. Stop |
|    (Silent Countdown)        (Silent 6-min Window Start)        (1760Hz Tone)    (Top/Fall) |
+---------------------------------------------------------------------------------------+
```

### 1. Athlete Preparation Phase (40s Prep)
- **Action**: When the referee signals the athlete to enter the Field of Play, the referee initiates the preparation timer.
  - **Hardware Unit**: Short press `BTN_0` (Starter Button) or select **Start Prep** in menu.
  - **Web UI**: Click **▶ START (`E6`)**.
- **Behavior**: A 40-second preparation timer begins counting down **SILENTLY**.
- **DNS (Did Not Start)**: If the 40-second prep timer expires without the climber starting, the system flags **DNS** silently.

### 2. Active Climb Phase (6-Minute Window)
- **Start Trigger**: The official 6-minute (360s) climb clock starts the exact moment the climber's feet leave the ground.
  - Starting the climb instantly terminates any remaining preparation time.
  - The start is **SILENT** (no start tone plays).
- **Time Readout**: High-contrast display readout counts down from `06:00.0`.

### 3. Audio Warnings & Timeout
- **1-Minute Warning**: When exactly 1 minute (60s) remains in the climbing window, the system emits a single clear warning beep (**1760 Hz, 400ms**).
- **6-Minute Timeout**: If the clock reaches `00:00.0`, the system plays a long timeout buzzer (**880 Hz, 1000ms**) and transitions to `STATE_FINISHED`.

### 4. Stopping the Clock (Top / Fall / Reset)
- **Manual Stop (Top or Fall)**: When the climber clips the final quickdraw (Top) or falls:
  - **Hardware Control Unit**: Press `BTN_2` (Lane A Top/Judge) or `BTN_3` (Lane B Top/Judge). Press `BTN_0` for manual fall stop.
  - **Web UI**: Click **🏁 FINISH (`E7`)** or **🏆 Winner A** / **⚠️ Fall A**.
  - **Behavior**: The finish lockdown is **SILENT**. The official time freezes instantly with millisecond precision (`SS.MMM`).
- **Reset System**: Press **🔄 RESET (`R`)** or `BTN_1` (`EVENT_UI_RESET`) to reset for the next competitor. Auto-looping is strictly disabled in Lead mode.

---

## ⚙️ Settings & Parameters

Configure Lead Mode settings via rotary encoder menu or Web UI Settings Panel:

| Parameter | G-Code | OLED Menu Path | Web UI Setting | Default / Range |
| :--- | :--- | :--- | :--- | :--- |
| **Climb Mode** | `C M2` | Mode Select ➔ Lead | Climb Mode Dropdown ➔ Lead | `2` (Lead) |
| **Climb Duration** | `C C360` | Timing ➔ Climb Duration | Climb Duration (s) | `360` (6 minutes) |
| **Prep Duration** | `C N40` | Timing ➔ Prep Duration | Prep Warning Duration (s) | `40` (40 seconds) |
| **Auto-Loop** | `C Q0` | Timing ➔ Auto-Loop | Auto-Loop Checkbox | `0` (Disabled - fixed for Lead) |
| **Countdown Beeps**| `C B1` | Audio ➔ Countdown Beeps | Countdown Beeps Checkbox | `1` (1-min warning enabled) |
| **Audio Volume** | `C V<0-100>`| Audio ➔ Volume | Volume Slider | `100%` |

---

## 📐 Hardware & Web UI Visuals

### Physical Control Station Diagram
The control station provides direct button triggers for prep start, pause, finish, and reset:

![Control Unit Functional Diagram](images/control-unit-diagram.jpg)

### Web Interface Lead Mode Layout
The Web UI provides a clean single-clock view with prep and climb stage indicators:

```
+-----------------------------------------------------------------------+
| [🟢 Connected (WiFi)]  MODE: Lead                       [⚙️ Settings] |
+-----------------------------------------------------------------------+
|                                05:42.3                                |
|                        STATE: RACING (CLIMBING)                       |
+-----------------------------------------------------------------------+
|  [ ▶ START (E6) ]       [ 🔄 RESET (R) ]       [ ⛔ ABORT (E8) ]       |
+-----------------------------------------------------------------------+
|  STAGE PIPELINE:  [ PREP 40s ]  ➔  [ CLIMB 360s ]                     |
|  Status: Active Climbing (Time Remaining: 05:42.3)                    |
|  [ 🏁 TOP / FINISH (E7) ]                [ ⚠️ RECORD FALL ]           |
+-----------------------------------------------------------------------+
```
*(Placeholder image for Web UI: `images/web-ui-lead.png`)*
