# Lead Quick Start

The **Lead** mode is built for sport and lead climbing attempts according to IFSC competition rules or gym endurance burns. It manages athlete preparation time, counts down your climb window, and sounds warnings without distracting you while on route.

---

## Quick Navigation

- [What is Lead Mode?](#what-is-lead-mode)
- [How to Activate & Start](#how-to-activate-start)
- [What You Can Configure](#what-you-can-configure)
- [How the Timer Works: Stages & Tones](#how-the-timer-works-stages-tones)
- [Belayer & Judge Actions](#belayer-judge-actions)

---

## What is Lead Mode?

In lead climbing competitions and structured redpoint sessions:

- The climber gets a short **Preparation Period** (typically 40 seconds) to tie in, inspect the first clips, and step up to the wall.
- Once the climb begins, the **Climb Window** (standard 6 minutes / 360 seconds) starts silently counting down.
- A warning tone alerts you when 1 minute remains so you can pace your final sequence.
- If you clip the anchor (TOP) or fall, the clock stops silently and saves your attempt time with millisecond accuracy.

---

## How to Activate & Start

### 1. Select Lead Mode

- **From Phone / Web UI**: Open the menu, select **Lead** under *Climb Mode*.
- **From Hardware Station**: Turn the rotary knob to `LEAD` and press to select.

### 2. Check the Climb & Prep Times

- By default, Lead mode uses:
    - **40 seconds**: Initial Preparation window.
    - **360 seconds (6:00)**: Climbing window.

### 3. Start the Attempt

- When the athlete is called, press **START** on the Web UI or **Button 0 (Action)** on the station.

---

## What You Can Configure

Open the **⚙️ Configuration** drawer in the Web App to customize your lead practice:

| Setting | Default | Description | Climber Tip |
| :--- | :--- | :--- | :--- |
| **Climb Duration** | `360s` (6 min) | Maximum time allowed on route | Set to 6 minutes for official IFSC lead routes, or 8–10 minutes for long gym pitches. |
| **Initial Warning / Prep** | `40s` | Time allowed to tie in and get ready | Standard IFSC prep window is 40 seconds. |
| **Countdown Beeps** | On | Sound tones at 1 min and timeout | Keep enabled so the climber hears the critical 1-minute warning. |
| **Volume Slider** | 100% | Audible buzzer volume | Adjust so the climber can hear the tone from the top of the wall. |

---

## How the Timer Works: Stages & Tones

Here is how the timer tracks a lead attempt:

| Stage | Display Status | Clock Display | Sound / Tone | What Climber & Belayer Do |
| :--- | :--- | :--- | :--- | :--- |
| **1. Preparation Window** | `PREP` | `00:40` ➔ `00:00` | Silent (beeps last 5s) | Athlete ties the figure-eight knot, belayer double-checks harness and device. |
| **2. Route Start** | `RACING` / `CLIMB` | `06:00` counting down | Gentle start tone | Climber leaves the ground. Clock counts down silently so you can concentrate. |
| **3. 1-Minute Warning** | `CLIMB` | At `01:00.0` | Clear high tone (1760 Hz) | **1 minute left!** Climber knows to commit to the final crux sequence. |
| **4. Time Over** | `FINISHED` | Reaches `00:00.0` | Long timeout buzzer | Official climbing time expired. |
| **5. Top or Fall** | `FINISHED` | Stops instantly | Silent | Time locks in. Belayer lowers climber safely. |

---

## Belayer & Judge Actions

When managing a lead attempt from the Web App:

- **FINISH (Top Clip)**: As soon as the climber clips the final quickdraw / top anchor, press **FINISH**. The official ascent time is recorded.
- **FALL**: If the climber falls off the route, press **FALL** (or **RESET**) to log the fall time.
- **RESET**: Clears the clock and resets the timer for the next climber.
