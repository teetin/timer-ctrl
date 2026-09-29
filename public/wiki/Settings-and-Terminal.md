# System Settings & Debug Terminal Web Interface

The **Settings & Debug Terminal** views give event directors, route setters, and technicians direct access to hardware parameters, audio/visual behavior, timezone/RTC synchronization, and direct G-code serial communication.

---

## ⚙️ System Settings Panel

Access the Settings drawer by clicking the **⚙️ Settings** button in the top header. Changes made in the settings panel trigger instant parameter updates sent to the device via symmetrical `C <key><val>` commands.

```
+-----------------------------------------------------------------------+
| ⚙️ SYSTEM SETTINGS                                                    |
+-----------------------------------------------------------------------+
| ▼ Climb Mode & Durations                                              |
|   Mode: [ Boulder ▼ ]            [x] Enable Auto-Loop                 |
|   Climb Duration (s):  [ 240 ]                                        |
|   Transition Duration (s): [ 15 ]                                     |
|   Prep Warning Duration (s): [ 15 ]                                   |
+-----------------------------------------------------------------------+
| ▼ Circuit Training Steps                                              |
|   #1 | Climb: 30s | Rest: 15s | [🗑️ Delete]                        |
|   #2 | Climb: 30s | Rest: 15s | [🗑️ Delete]                        |
|   [➕ Add Step]   [🔄 Reset Defaults]                                 |
|   Raw Sequence: 30/15,30/15                                           |
+-----------------------------------------------------------------------+
| ▼ Audio & Display                                                     |
|   [x] Countdown Beeps      Waveform: [ Warm Sine (Smooth) ▼ ]         |
|   Volume: [==========||] 100%                                         |
+-----------------------------------------------------------------------+
| ▼ UI & Lanes                                                          |
|   [ ] Use Symbols   [x] Show Tenths   [ ] Maintenance Mode            |
|   Theme: [ Pro Dark (High Contrast) ▼ ]                               |
|   Active Lanes: [x] Lane A   [x] Lane B                               |
|   Assigned Lane: [ Global (Both) ▼ ]                                  |
+-----------------------------------------------------------------------+
| ▼ System & Timezone                                                   |
|   Radio Mode: [ Wi-Fi Mode ▼ ]                                        |
|   Timezone Preset: [ Europe/Helsinki (EET/EEST) ▼ ]                   |
|   [🕒 Sync System Time with Browser]                                  |
+-----------------------------------------------------------------------+
```

---

## 1. ⏱️ Climb Mode & Durations

- **Climb Mode (`M`)**:
  - `0: Speed`: IFSC Official 15m Speed climbing format with standardized start sequence.
  - `1: Boulder`: IFSC Bouldering rotation format with climb and rest interval timers.
  - `2: Lead`: IFSC Lead climbing single clock countdown.
  - `3: Clock`: Standard stop-watch / count-up display clock.
  - `4: Circuit`: Custom high-intensity interval / circuit training mode.
- **Auto-Loop (`Q`)**: Toggles continuous loop execution (`Q1`) versus single-cycle termination (`Q0`).
- **Climb Duration (`C`)**: Sets main active climb time in seconds (1 - 3600s).
- **Transition Duration (`T`)**: Sets rest/rotation interval in seconds (0 - 3600s).
- **Initial Prep Duration (`N`)**: Sets pre-climb warning countdown in seconds (0 - 3600s).

---

## 2. 📋 Circuit Training Builder

When `Circuit Mode (M4)` is selected, the Circuit Steps editor expands:

- **Interactive Step Table**: Add, edit, or delete individual climb and rest step pairs.
- **➕ Add Step**: Appends a new Climb/Rest pair to the training program.
- **🔄 Reset Defaults**: Restores default sequence (`30/15,30/15`).
- **Raw Sequence Display (`circ_seq`)**: Shows formatted string sent to hardware (e.g. `30/15,45/15,30/30`).

---

## 3. 🔊 Audio & Display Settings

- **Countdown Beeps (`B`)**: Enables/disables audible warning pips at 5s, 4s, 3s, 2s, 1s, and Start.
- **Audio Waveform (`W`)**: Selects audio synthesizer waveform:
  - `0: Warm Sine`: Smooth tone for indoor gym comfort.
  - `1: Sharp Square`: Piercing square-wave tone for noisy outdoor competitions.
- **Audio Volume (`V`)**: Adjustable 0% to 100% volume slider.

---

## 4. 🎨 UI & Lane Allocation

- **Toggles**:
  - **Show Tenths (`X`)**: Shows sub-second fractional digits (`.0`).
  - **Use Symbols (`Y`)**: Displays graphical state icons instead of text labels.
  - **Maintenance Mode (`K`)**: Disables public controls for sensor testing or service.
- **UI Theme**: Switch between **Pro Dark (High Contrast)** and **IFSC Official Colors**.
- **Active Lanes (`H` / `J`)**: Enable or disable Lane A (`H`) and Lane B (`J`).
- **Assigned Lane (`A`)**: Configures whether the controller unit manages `0: Global (Both)`, `1: Lane A`, or `2: Lane B`.

---

## 5. 🌐 System, Radio & Timezone Settings

- **Radio Mode Selection**: Switch device radio backend between `WIFI` and `BLE`.
- **POSIX Timezone Presets (`TZ`)**: Select timezone presets (UTC, Europe/Helsinki, US Eastern, etc.) or enter a custom POSIX string.
- **🕒 Sync System Time with Browser**: Updates hardware real-time clock (RTC) via `/time?set=YYYY-MM-DD HH:MM:SS` endpoint or serial command.

---

## 💻 Debug Terminal Panel

Click the **💻 Terminal** button in the top header to open the interactive serial terminal.

```
+-----------------------------------------------------------------------+
| 💻 DEBUG TERMINAL                                          [× Close]  |
+-----------------------------------------------------------------------+
| [14:02:01.120] TX > G                                                 |
| [14:02:01.145] RX < G M1 C240 T15 N15 V100 Q0 X1 Y0 B1 W0 H1 J1 K0 A0 |
| [14:02:05.310] TX > E6 0                                              |
| [14:02:05.325] RX < E25 0 L0 S1                                       |
+-----------------------------------------------------------------------+
| Input: [ C M1 C360                                   ]  [ Send ]     |
| [ Clear Terminal ]                                      [ Save Log ]  |
+-----------------------------------------------------------------------+
```

### Features:

- **Live Output Area**: Displays timestamped outbound (`TX >`) and inbound (`RX <`) commands with color syntax.
- **Direct Command Input**: Send custom G-code commands directly to the hardware.
- **Clear Terminal**: Clears all current log entries from the display.
- **Save Log**: Downloads formatted log history as a `.txt` file for diagnostics.

### Common G-Code Serial Commands Quick Reference:

| Command               | Description                        | Example                 |
| :-------------------- | :--------------------------------- | :---------------------- |
| `G`                   | Query all configuration values     | `G` ➔ `G M1 C240 V100`  |
| `C <key><val>`        | Set configuration parameter(s)     | `C M1 C300 V80`         |
| `S`                   | Status query (UUID, Mode, Runmode) | `S` ➔ `S I1234 M1 Q0`   |
| `E<code> <ts> [args]` | Trigger event                      | `E6 0` (Starter button) |
| `R`                   | Reset race state machine           | `R` ➔ `R OK`            |
| `TZ [posix_str]`      | Get or set POSIX timezone          | `TZ EET-2EEST`          |
| `RADIO [mode]`        | Switch radio mode (`WIFI`/`BLE`)   | `RADIO BLE`             |
| `!`                   | Reboot hardware unit               | `!` ➔ `! OK`            |
