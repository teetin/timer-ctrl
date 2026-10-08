# Web UI & Remote Control Guide

The T2Climb Web Control UI (`timer-ctrl`) provides real-time control, live display updates, and easy configuration management from any smartphone, tablet, or web browser.

![Web Control Panel](images/web-ui-main.png)

---

## 📱 Getting Connected

1. **Bluetooth Connection (BLE)**:
   - Click **Connect via Bluetooth**.
   - Select your T2Climb device from the browser pairing pop-up window.
2. **Wi-Fi Connection (HTTP / Local Network)**:
   - Connect your device to the T2Climb Wi-Fi access point or local network.
   - Click **Connect via WiFi** to connect instantly.

---

## 🎛️ Main Control Panel Sections

- **Header Status Bar**: Displays connection state (Connected/Disconnected) and current communication mode (Bluetooth or Wi-Fi).
- **Primary Display**: Large high-contrast digits showing time remaining or elapsed time, along with active mode (`Speed`, `Boulder`, `Lead`, `Circuit`, `Clock`) and state badges.
- **Action Buttons**:
  - **START / PAUSE**: Begins or pauses the timer sequence.
  - **RESET**: Restores default starting time and resets race states.
  - **ABORT / FINISH**: Stops the active climb attempt or ends rotation interval early.
- **Referee & Judge Overrides**: Quick-action buttons for declaring Lane A / Lane B winners or recording falls in Speed mode.
- **Sequence Flow Visualizer**: Graphical pipeline showing upcoming preparation, climb, and transition phases.

---

## ⚙️ Configuration & System Settings

Click the **⚙️ Configuration** button at the bottom of the main panel to open the settings panel. All changes apply instantly to the hardware station.

![Configuration Drawer](images/web-ui-settings.png)

### 1. Climb Settings
- **Climb Mode**: Switch between Speed, Bouldering, Lead, Clock, and Circuit modes.
- **Enable Auto-Loop**: Toggles continuous loop execution for interval training versus single-cycle termination.
- **Climb / Transition / Prep Durations**: Adjustable sliders and input boxes to configure active climbing, rest, and preparation warning times in seconds.

### 2. Circuit Training Builder
- Add, edit, or remove custom workout step pairs (Climb duration / Rest duration).
- Reorder or reset workout programs to default presets.

### 3. Audio & Volume Settings
- **Countdown Beeps**: Toggle warning pips on or off.
- **Audio Waveform**: Choose between **Warm Sine** (smooth indoor gym tone) or **Sharp Square** (piercing tone for loud outdoor venues).
- **Volume Slider**: Adjust master volume level from 0% to 100%.

### 4. UI & Lane Settings
- **Display Options**: Toggle sub-second tenths display (`.0`), graphical state icons, or high-contrast theme schemes.
- **Active Lanes**: Enable or disable Lane A and Lane B for single-lane or dual-lane operations.

### 5. System Time & Timezone
- **Timezone Presets**: Choose regional timezones (UTC, Europe/Helsinki, US Eastern, etc.).
- **Sync System Time**: Click **Sync System Time with Browser** to update the control station's hardware RTC clock instantly.
