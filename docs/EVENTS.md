# T2Timer System Events

The T2Timer ecosystem is built on a unified, event-driven architecture. Events represent physical sensor triggers, state changes, and commands that synchronize all nodes (Brain, Display, Audio, etc.).

## Transport Layers

Events are mirrored across three primary transport layers:
1. **CAN Bus**: Binary protocol for inter-node communication.
2. **BLE Serial (NUS)**: G-code style text protocol for mobile apps.
3. **HTTP/SSE**: Server-Sent Events stream for web dashboards.

---

## Event Format (G-Code Style)

Standardized format for BLE and HTTP/SSE:
`E<code> <ts:hex> [args...]`

- `<code>`: Numeric Event ID (Decimal).
- `<ts:hex>`: 64-bit microsecond timestamp (Hex, no leading zeros).
- `[args...]`: Keyed parameters (G-code style) or a single metadata value.

### Common Keys
| Key | Type | Description |
| :--- | :--- | :--- |
| `M` | Hex | Generic 32-bit Metadata / Mode |
| `L` | Dec | Lane (0=All, 1=A, 2=B) |
| `P` | Dec | Visual Pattern ID |
| `C` | Hex | Color (RGB565) |
| `S` | Dec | Speed (0-255) |
| `R` | Dec | Role Mask |
| `F` | Dec | Audio Frequency (Hz) |
| `D` | Dec | Audio Duration (ms) |
| `A` | Hex | Athlete UID |
| `N` | Dec | Node ID |

---

## Event Catalog

| ID | Name | Description | Arguments / Meta |
| :--- | :--- | :--- | :--- |
| `0` | `ATHLETE_SCANNED` | New RFID/QR tag detected | `A<uid:hex>` |
| `1` | `SEQ_PREP` | Prepare for start sequence | - |
| `2` | `SEQ_PIP` | Single beep pulse | - |
| `3` | `RACE_START` | Official clock start | - |
| `6` | `STARTER_BUTTON` | Physical button press | `N<node_id>` |
| `7` | `RACE_FINISH` | Race completion (force) | - |
| `8` | `RACE_ABORT` | Abort/Reset current race | - |
| `9` | `UI_RESET` | Sync settings/Splash | - |
| `11` | `AUDIO_CMD` | Play specific tone | `F<freq> D<dur>` |
| `12` | `DISP_SYNC_START` | Start display timer | `M[state(8)\|elapsed(24)]` |
| `13` | `DISP_SYNC_STOP` | Freeze display result | `M[state(8)\|res(4)\|elapsed(20)]` |
| `20` | `PAD_TRIGGERED` | Sensor activated | `N<node_id>` |
| `21` | `PAD_RELEASED` | Sensor released | `N<node_id>` |
| `24` | `VISUAL_CMD` | Set LED/Display pattern | `L<lane> P<pat> C<hex> S<spd> R<role>` |
| `25` | `STATE_CHANGE` | Global/Lane state updated | `L<lane> S<state>` |

---

## Command Reference

### Configuration (`C`)
Update one or more settings in a single line.
- **Format:** `C <key><val> [<key><val> ...]`
- **Response:** `C <key><val> [<key><val> ...]`
- **Keys:**
  - `M`: Climb Mode (0:Speed, 1:Boulder, 2:Lead, 3:Clock)
  - `C`: Climb Time (Seconds)
  - `T`: Transition Time (Seconds)
  - `V`: Volume (0-100)
  - `Q`: Run Mode (0:Quals, 1:Finals)
  - `X`: Show Tenths (0/1)
  - `Y`: Use Symbols (0/1)
  - `B`: Beeper Style (0:Prague, 1:Innsbruck, 2:Japan)
  - `W`: Waveform (0:Sine, 1:Square)
  - `K`: Maint Mode (0/1)
  - `A`: Assigned Lane (0:Both, 1:A, 2:B)
- **Example:** `C M1 C360 T15` -> `C M1 C360 T15`

### Getters (`G`)
Retrieve one or more configuration values. Providing no keys returns the full config.
- **Format:** `G [<key> ...]`
- **Response:** `G <key><val> [<key><val> ...]`
- **Example:** `G M V` -> `G M1 V100`

### System Commands
- `S`: Get Status. Response: `S I<id> M<mode> Q<runmode>`
- `R`: Reset State Machine. Response: `R OK`
- `!`: Reboot Hardware. Response: `! OK`

## CAN Bus Protocol (TWAI)

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
