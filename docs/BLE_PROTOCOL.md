# T2Timer BLE Serial Protocol (NUS)

The T2Timer units support a Serial-over-BLE interface based on the **Nordic UART Service (NUS)**. This is the **single source of truth** for the serial interface used by mobile apps and the Web Bluetooth SPA.

## GATT Interface

| Service / Characteristic | UUID | Properties |
| :--- | :--- | :--- |
| **Nordic UART Service** | `6E400001-B5A3-F393-E0A9-E50E24DCCA9E` | - |
| **RX (Write)** | `6E400002-B5A3-F393-E0A9-E50E24DCCA9E` | Write, Write No Response |
| **TX (Notify)** | `6E400003-B5A3-F393-E0A9-E50E24DCCA9E` | Notify |

---

## Serial Protocol

Commands are plain text strings sent to the **RX** characteristic, terminated with a newline (`\n`). Responses are sent via the **TX** notification characteristic.

### 1. Events (`EVT`)
Trigger a system event. The unit processes these as if they were physical button presses or network events.

- **Format:** `EVT <id> [meta]`
- **Example:** `EVT 6` (Trigger Starter Button)
- **Response:** `OK EVT`

#### Complete Event Table

| ID | Name | Description | Metadata (meta) |
| :--- | :--- | :--- | :--- |
| `0` | `ATHLETE_SCANNED` | New climber ID detected | 32-bit Athlete UID |
| `1` | `SEQ_PREP` | Prepare for start sequence | 0 |
| `2` | `SEQ_PIP` | Single beep pulse | 0 |
| `3` | `RACE_START` | Official clock start | 0 |
| `4` | `GATE_ENTER` | Gate sensor entered | 0 |
| `5` | `GATE_EXIT` | Gate sensor cleared | 0 |
| `6` | `STARTER_BUTTON` | Main action button | 0 |
| `7` | `RACE_FINISH` | Force race completion | 0 |
| `8` | `RACE_ABORT` | Abort/Reset current race | 0 |
| `9` | `UI_RESET` | Synchronize settings/Splash | 0 |
| `11` | `AUDIO_CMD` | Play a specific tone | `[Freq 16-bit] << 16 \| [Dur 16-bit]` |
| `12` | `DISP_SYNC_START` | Start display timer | `[State 8-bit] \| ([ElapsedMS 24-bit] << 8)` |
| `13` | `DISP_SYNC_STOP` | Stop/Freeze display | `[State 8] \| ([Result 4] << 8) \| ([Elapsed 20] << 12)` |
| `25` | `STATE_CHANGE` | State machine transition | `[Lane 8] \| ([State 8] << 8)` |
| `15` | `DISP_SYNC_MODE` | Change display discipline | `climb_mode_t` (0-3) |
| `16` | `DISP_SYNC_PROG` | Update transition progress | Progress value |
| `20` | `PAD_TRIGGERED` | Sensor activated | Node ID (e.g., 1010 for Lane A Start) |
| `21` | `PAD_RELEASED` | Sensor released | Node ID |
| `22` | `DISCOVERY_POLL` | Start node discovery | 0 |
| `23` | `IDENTIFY_NODE` | Flash a specific node | Node ID |
| `24` | `VISUAL_CMD` | Set LED/Display pattern | `[Lane 8] \| [Pat 8] << 8 \| [Color565 16] << 16` |

---

## Async Notifications (TX)

In addition to request/response, the device emits asynchronous state/events over the **TX** (notify) characteristic so connected BLE consoles or apps can stay in sync without polling.

- **When sent:** Selected `CLIMB_EVENTS` are forwarded as notifications when they occur on the device. Notifications are only sent when a BLE client is connected and subscribed.
- **Format:** Plain text, newline-terminated: `EVT:<id> ts=<timestamp_us> meta=<meta>`\n
  - `<id>`: numeric event id (matches the event table above)
  - `<timestamp_us>`: `esp_timer_get_time()` value in microseconds when the event was published
  - `<meta>`: event-specific metadata encoded as a 32-bit unsigned value

### `ts` usage
- `ts` is a local high-resolution timestamp that can be used to order events, detect delivery delay, and reconcile event timing between BLE clients and device-side logic.
- It is not a wall-clock UTC timestamp; it is relative to the device timer.

### `meta` usage by event
| Event ID | Name | `meta` semantics | Notes |
| :--- | :--- | :--- | :--- |
| `3` | `RACE_START` | `0` | Start pulse event; no payload. |
| `6` | `STARTER_BUTTON` | source unit ID | Usually the local button/node short ID. Useful to know which starter pressed the button. |
| `7` | `RACE_FINISH` | `0` | Race finish event; no additional payload. |
| `8` | `RACE_ABORT` | `0` | Abort/reset event; no extra payload. |
| `9` | `UI_RESET` | `0` | Configuration/UI refresh event. |
| `12` | `DISP_SYNC_START` | `[state (8)] \\| ([elapsed_ms (24)] << 8)` | `state` is the timer state; `elapsed_ms` is the time already elapsed in that state. For `STATE_BEEPING`, the upper 24 bits may carry the active beep counter. |
| `13` | `DISP_SYNC_STOP` | `[state (8)] \\| ([result (4)] << 8) \\| ([elapsed_ms (20)] << 12)` | `state` is the terminal display state; `result` is the climb result; `elapsed_ms` is the final elapsed time. |
| `25` | `STATE_CHANGE` | `[lane (8)] \| ([state_idx (8)] << 8)` | Emitted when the internal timer/state-machine transitions. `state_idx` is the index from the state table in `EVENTS.md` (Event 25). Clients should use this to update UI state machines. |
| `19` | `SHOW_IP` | `0` | Request the display to show the current IP address. |
| `20` | `PAD_TRIGGERED` | source node ID | Example: `1010` = Lane A start pad; `1021` = Lane B end pad. |
| `21` | `PAD_RELEASED` | source node ID | Pad release event. |

### Recommended BLE client behavior
- Parse the notification by splitting on spaces and then parsing `id`, `ts`, and `meta`.
- Use `id` to dispatch the event in your UI/app.
- Use `ts` to detect delivery lag or restore ordered event handling if notifications arrive out-of-order.
- Use `meta` only for events that declare payload data above; ignore it for zero-payload events.

### Note on throttling
- To avoid BLE flooding, the device coalesces and throttles notifications on busy event flows. If you need a continuous state stream, use the HTTP SSE endpoint at `/events/stream` instead.

Examples:

 - `EVT:3 ts=162345678901234 meta=0` — Race start event
 - `EVT:20 ts=162345678901567 meta=1010` — Pad A start sensor triggered
 - `EVT:13 ts=162345678901890 meta=123456` — Display stop event with encoded final result/time

 - `EVT:3 ts=162345678901234 meta=0` — Race start event
 - `EVT:20 ts=162345678901567 meta=1010` — Pad A start sensor triggered (meta = source node id)
 - `EVT:25 ts=162345678901890 meta=513` — Example `STATE_CHANGE` for lane 1, state 2 (`meta` = lane | (state<<8) => 0x0201 = 513)


### 2. Configuration (`CFG`)
Update persistent unit settings.

- **Format:** `CFG <key> <val>`
- **Example:** `CFG mode 0`
- **Response:** `OK CFG <key> <val>` or `ERR CFG UNKNOWN_KEY`

| Key | Range | Description |
| :--- | :--- | :--- |
| `climb` | `seconds` | Main racing duration |
| `trans` | `seconds` | Transition/Rest duration |
| `mode` | `0-3` | `0:Speed, 1:Boulder, 2:Lead, 3:Clock` |
| `runmode` | `0-1` | `0:Qualifications, 1:Finals` |
| `vol` | `0-100` | Beeper volume percentage |

---

### 3. Getters (`GET`)
Retrieve current configuration.

- **Format:** `GET <key>`
- **Response:** `VAL <value>` or `ERR GET UNKNOWN`

| Key | Response Description |
| :--- | :--- |
| `climb` | Seconds |
| `trans` | Seconds |
| `mode` | `climb_mode_t` integer |
| `runmode` | `run_mode_t` integer |
| `vol` | Volume percentage |

---

### 4. System Commands
- **`STATUS`**: Returns `STATUS ID=<id> MODE=<mode> RUN=<runmode>`
- **`RESET`**: Soft reset of the state machine (Aborts race).
- **`REBOOT`**: Hardware restart of the ESP32.
