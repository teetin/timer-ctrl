# T2Timer Event & Protocol Documentation

This document serves as the comprehensive reference for all event-driven communication within the T2Timer system, covering CAN (Internal Node Bus), BLE (Mobile/Web Apps), and HTTP (Web Dashboard).

## 1. System Events (`climb_event_id_t`)

These IDs are used across all transport layers to identify the logical action.

| ID | Name | Payload (Metadata) | Description |
| :--- | :--- | :--- | :--- |
| `0` | `ATHLETE_SCANNED` | `uint32_t` UID | A new athlete tag/ID was detected. |
| `1` | `SEQ_PREP` | 0 | Prepare for start sequence (internal). |
| `2` | `SEQ_PIP` | 0 | Single beep pulse during countdown. |
| `3` | `RACE_START` | 0 | Official clock start trigger. |
| `4` | `GATE_ENTER` | 0 | Sensor beam broken. |
| `5` | `GATE_EXIT` | 0 | Sensor beam cleared. |
| `6` | `STARTER_BUTTON` | Node ID | Physical starter button pressed. |
| `7` | `RACE_FINISH` | 0 | Force race completion (Referee action). |
| `8` | `RACE_ABORT` | 0 | Abort current race and return to IDLE. |
| `9` | `UI_RESET` | 0 | System-wide refresh (reloads config). |
| `11` | `AUDIO_CMD` | `[Freq 16] << 16 \| [Dur 16]` | Play a tone on connected audio nodes. |
| `12` | `DISP_SYNC_START` | `[State 8] \| [ElapsedMS 24] << 8` | Start/Resume a timer on display nodes. |
| `13` | `DISP_SYNC_STOP` | `[State 8] \| [Result 4] << 8 \| [Elapsed 20] << 12` | Freeze/Stop a timer with final result. |
| `14` | `DISP_SYNC_RESET` | 0 | Reset display to default state. |
| `15` | `DISP_SYNC_MODE` | `climb_mode_t` | Change display layout (Speed/Boulder/Lead). |
| `16` | `DISP_SYNC_PROG` | `uint32_t` Progress | Update transition progress bar. |
| `20` | `PAD_TRIGGERED` | Node ID | Start/End pad sensor activated. |
| `21` | `PAD_RELEASED` | Node ID | Start/End pad sensor released. |
| `22` | `DISCOVERY_POLL` | 0 | Start node discovery sequence. |
| `23` | `IDENTIFY_NODE` | Node ID | Command a node to flash its LEDs for identification. |
| `24` | `VISUAL_CMD` | `[Lane 8] \| [Pat 8] << 8 \| [Color565 16] << 16` | Set specific LED pattern and color. |
| `25` | `STATE_CHANGE` | `[Lane 8] \| [State 8] << 8` | Async notification of state machine transitions. |

---

## 2. CAN Bus Protocol (TWAI)

Used for communication between the Brain and Satellite nodes (Pads, Displays, Audio).

### Primary Message IDs

| CAN ID | Name | Data Layout (8 bytes max) |
| :--- | :--- | :--- |
| `0x010` | `START_PULSE` | *(Empty)* - High priority hardware start sync. |
| `0x020` | `PAD_EVENT` | `[NodeID 16] [State 8] [Timestamp_US 32]` |
| `0x100` | `DISPLAY_SYNC` | `[Lane 8] [Cmd 8] [Payload 32]` (Cmd: 1=Start, 2=Stop, 3=Reset, 4=Mode, 5=Prog) |
| `0x110` | `AUDIO_CMD` | `[Lane 8] [Freq 16] [Duration 16]` |
| `0x200` | `VISUAL_CMD` | `[Lane 8] [RoleMask 8] [Pattern 8] [Color565 16] [Speed 8]` |
| `0x300` | `CONFIG_SYNC` | `[Cmd 8] [Type 8] [Seg 8] [Data 40]` |
| `0x320` | `PING_POLL` | *(Empty)* - Brain scans for nodes. |
| `0x321` | `PING_RESP` | `[NodeID 16] [CapMask 8] [Uptime 8]` |

---

## 3. BLE Protocol (Nordic UART Service)

The BLE interface provides a serial console for UI clients.

### Command Format (RX)
UI -> Brain: `CMD <arg1> [arg2]` followed by `\n`.

- `EVT <id> [meta]` : Trigger a system event.
- `CFG <key> <val>` : Update a configuration parameter.
- `GET <key>` : Retrieve a configuration value.
- `STATUS` : Get system summary.
- `RESET` : Abort race.
- `REBOOT` : Hardware restart.

### Notification Format (TX)
Brain -> UI: `EVT:<id> ts=<us> meta=<meta>\n`

Example: `EVT:3 ts=12345678 meta=0` (Race Start)

### `meta` interpretation and Node ID encoding
- **Node ID / `meta`**: Many physical input events (for example `PAD_TRIGGERED` / `PAD_RELEASED` and `STARTER_BUTTON`) carry a compact 16/32-bit numeric `meta` value that identifies the originating unit and sensor. The unit firmware uses a small, human-friendly decimal scheme in the UI examples (e.g. `1010`, `1011`, `1020`, `1021`) where the value is a unit-specific identifier for a lane and pad. UI clients SHOULD treat `meta` as an opaque numeric source identifier unless they know the local deployment mapping.
- **Dashboard examples**: The dashboard uses these example mappings: `1010` = Lane A start pad, `1011` = Lane A finish pad, `1020` = Lane B start pad, `1021` = Lane B finish pad. These are illustrative only — the authoritative mapping for your deployment is discovered via the CAN discovery/ping mechanisms.

---

## 4. HTTP API

The Web Dashboard uses REST for control and SSE for live updates.

### Control (REST)
- `GET /event?evt=N&meta=M` : Trigger system event.
- `GET /config?key=val` : Set configuration.
- `GET /status` : JSON system status.

### Live Updates (SSE)
- `GET /events/stream`
- **Format:** `data: {"id":N, "ts":T, "meta":M}`

---

## 5. Logic State Definitions

When `STATE_CHANGE` (Event 25) is emitted, the metadata contains the state index:

| Index | Name | Description |
| :--- | :--- | :--- |
| `0` | `IDLE` | System waiting for climbers or referee. |
| `1` | `PRECONDITION` | Speed: Climber on pad. |
| `2` | `STARTER_WAIT` | Speed: Referee acknowledged, waiting for beeps. |
| `3` | `BEEPING` | Countdown beeps active. |
| `4` | `TRANSITION` | Boulder/Lead: Rest period. |
| `5` | `READY` | Speed: Post-beep ready state. |
| `6` | `RACING` | Clock is running. |
| `7` | `FINISHED` | Race complete. |
| `8` | `FALSE_START` | Jumped start detected. |
| `9` | `PAUSED` | Timer suspended by referee. |
| `10` | `FALL` | Climber fell / manual abort. |
| `11` | `SPLASH` | Showing device info on display. |
