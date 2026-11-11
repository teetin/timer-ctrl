# Boulder Quick Start

The **Boulder** mode runs timed climbing and rest intervals. It is ideal for official IFSC competition rotation rounds (e.g., 4 minutes climb / 4 minutes rest or 5 minutes climb / 5 minutes rest) as well as day-to-day gym boulder circuits and flash training.

---

## Quick Navigation

- [What is Boulder Mode?](#what-is-boulder-mode)
- [How to Activate & Start](#how-to-activate-start)
- [What You Can Configure](#what-you-can-configure)
- [How the Timer Works: Stages & Tones](#how-the-timer-works-stages-tones)
- [Controlling the Session](#controlling-the-session)

---

## What is Boulder Mode?

Boulder mode automates training rotations:

- Climbers get a set amount of time to attempt a boulder problem (e.g. 4 minutes).
- When time expires, a rest/transition interval begins (e.g. 4 minutes or 15 seconds) so the next climber can step up or rotate to the next boulder.
- Audio beeps warn climbers when time is running out, so you know exactly when to make your final attempt without having to stare at the clock.

---

## How to Activate & Start

### 1. Select Boulder Mode

- **From Phone / Web UI**: Open the menu, choose **Boulder** under *Climb Mode*.
- **From Hardware Station**: Rotate the knob to `BOULDER` and press to confirm.

### 2. Set Your Times

- In the Web App configuration, set:
    - **Climb Duration**: Time on the boulder (e.g. `240` seconds for 4 minutes).
    - **Transition Duration**: Rest between problems (e.g. `240` seconds or `15` seconds).
    - **Initial Warning**: Countdown before the first round begins (e.g. `15` seconds).

### 3. Start the Session

- Click **START** in the Web App or press **Button 0 (Action)** on the station.

---

## What You Can Configure

All adjustments can be made easily from the **⚙️ Configuration** drawer in the Web App:

| Setting | Default | Description | Climber Tip |
| :--- | :--- | :--- | :--- |
| **Climb Duration** | `60s` | Active climbing time per rotation | Set to `240s` (4 min) or `300s` (5 min) for comp simulation. |
| **Transition Duration** | `15s` | Rest or rotation time | Match climb duration for IFSC rounds (e.g. 4 min on / 4 min off). |
| **Initial Prep Duration** | `15s` | Countdown before round 1 starts | Gives climbers time to chalk up and stand in front of the problem. |
| **Enable Auto-Loop** | Off | Automatically loops Climb ➔ Rest ➔ Climb | Turn **ON** if running continuous 4x4s or group rotations. |
| **Countdown Beeps** | On | Audio warning beeps during transitions | Keep **ON** so you can hear the 1-minute warning while climbing. |

---

## How the Timer Works: Stages & Tones

Here is how the timer guides your session:

| Stage | Display Badge | Time Remaining | Sound / Tone | What Climbers Do |
| :--- | :--- | :--- | :--- | :--- |
| **Preparation** | `PREP` | e.g. `00:15` ➔ `00:00` | Beeps on final seconds | Chalk up, review beta, get ready to climb. |
| **Climb Start** | `CLIMB` | Full climb time | Medium start tone (523 Hz) | Start climbing! |
| **1-Minute Left** | `CLIMB` | `01:00` remaining | High warning tone (1760 Hz) | **1 minute warning!** Time for a final burn. |
| **Final 5 Seconds**| `CLIMB` | `00:05` ➔ `00:01` | Low pips each second (440 Hz) | Last seconds to establish or finish top hold. |
| **Climb End** | `TRANS` | `00:00` | Ending buzzer (880 Hz) | Time is up! Step off the mats into rest area. |
| **Rest / Transition** | `REST` | e.g. `04:00` ➔ `00:00` | Tones warn before next round | Shake out, rest, brush holds, rotate to next boulder. |

---

## Controlling the Session

During the session, the Web App gives you quick buttons to handle common gym situations:

- **PAUSE / RESUME**: Need to brush a hold or fix a loose shoe? Press **PAUSE** to freeze the clock, then **RESUME** when ready.
- **FINISH**: Sent the boulder problem early? Press **FINISH** to end the current climb interval immediately and transition directly into rest.
- **RESET**: Stops the rotation and resets the timer back to the initial preparation state.
