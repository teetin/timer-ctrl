# Speed Climbing (IFSC Speed) Quick Start

The **Speed** mode is designed for official IFSC 15-meter speed climbing training and competitions. It provides automated countdown beeps, dual-lane timing down to the millisecond, false-start detection, and top sensor registration.

---

## Quick Navigation

- [What is Speed Mode?](#what-is-speed-mode)
- [How to Activate & Start](#how-to-activate-start)
- [What You Can Configure](#what-you-can-configure)
- [How the Timer Works: Step-by-Step](#how-the-timer-works-step-by-step)
- [Judge & Referee Controls](#judge-referee-controls)

---

## What is Speed Mode?

In Speed mode, two climbers race side-by-side on identical 15-meter routes (Lane A and Lane B). The timer:

- Plays the official World Cup audio countdown ("Pip... Pip... Piiip!").
- Starts running simultaneously for both lanes on the GO tone.
- Detects false starts automatically if an athlete leaves the pressure pad too early.
- Stops each lane individually when the climber hits the top sensor pad.

---

## How to Activate & Start

### 1. Select Speed Mode

- **From Phone / Web UI**: Open the menu, select **IFSC Speed** under *Climb Mode*.
- **From Hardware Station**: Turn the rotary knob until the OLED screen shows `SPEED`, then press the knob to select.

### 2. Ready the Climbers

- Have both climbers step onto their start foot pads at the base of the wall.
- The timer displays **READY** and the green indicators illuminate.

### 3. Start the Sequence

- Click **START** in the Web App, or press **Button 0 (Action)** on the hardware station.

---

## What You Can Configure

You can tweak the following settings from the **⚙️ Configuration** drawer in the Web App or the station menu:

| Setting | What it Does | Climber Recommendation |
| :--- | :--- | :--- |
| **Countdown Beeps** | Turns start beeps on or off | Keep **ON** for IFSC race training |
| **Audio Waveform** | Tone style: *Warm Sine* or *Sharp Square* | Use *Warm Sine* indoors, *Sharp Square* in noisy gyms |
| **Volume Slider** | Sound loudness (0–100%) | Set high so climbers hear the GO tone over gym chatter |
| **Active Lanes** | Enable Lane A (Left), Lane B (Right), or both | Turn off Lane B if training solo on one lane |

---

## How the Timer Works: Step-by-Step

Here is exactly what the timer does during a speed heat:

| Stage / Time | Display Status | Sound / Tone | What Happens on the Wall |
| :--- | :--- | :--- | :--- |
| **Pre-Start** | `READY` | *Silence* | Climbers are standing on the ground pressure pads. |
| **-2.0s** | `SET .` | Short Pip (880 Hz) | "At your marks" – Climbers assume start stance on the wall. |
| **-1.0s** | `SET . .` | Short Pip (880 Hz) | Hold still on the start pad. |
| **0.0s (GO)** | `RACING` | High Long Tone (1760 Hz) | **GO!** Timer starts counting up from `00.000`. Climbers launch up the wall. |
| **Climbing** | `SS.MMM` | *Silence* | Running clock shows seconds and milliseconds. |
| **Top Hit** | `WINNER` (Green) | Clear confirmation chime | Climber hits top pad. Their final time is locked in immediately. |

### False Start Handling

- If a climber's foot leaves the start pad within **100 ms** after the GO tone (or before it), the timer detects a **FALSE START**.
- A low warning buzz sounds, the lane turns **RED**, and the screen displays `FALSE`.

---

## Judge & Referee Controls

During a competition or coached mock comp, you can control the race directly from the Web App:

- **WINNER A / WINNER B**: Manually trigger a win for a lane if a top pad was touched without triggering.
- **FALL A / FALL B**: Mark a climber as fallen or off-route.
- **ABORT**: Instantly halt the race and reset the pads.
- **RESET**: Ready the clock for the next pair of climbers.
