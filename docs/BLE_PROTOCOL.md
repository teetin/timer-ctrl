# T2Timer BLE Serial Protocol (NUS)

The T2Timer units support a Serial-over-BLE interface based on the **Nordic UART Service (NUS)**. This interface uses a "snappier" G-code style protocol optimized for low-latency communication with mobile apps and web clients.

## GATT Interface

| Service / Characteristic | UUID | Properties |
| :--- | :--- | :--- |
| **Nordic UART Service** | `6E400001-B5A3-F393-E0A9-E50E24DCCA9E` | - |
| **RX (Write)** | `6E400002-B5A3-F393-E0A9-E50E24DCCA9E` | Write, Write No Response |
| **TX (Notify)** | `6E400003-B5A3-F393-E0A9-E50E24DCCA9E` | Notify |

---

## Serial Protocol

Commands are plain text strings sent to the **RX** characteristic, terminated with a newline (`\n`).

### 1. Events (`E`)
Trigger or receive system events. For a full list of event IDs and arguments, see [EVENTS.md](EVENTS.md).

- **Format:** `E<code> <ts:hex> [args...]`
- **Example (Send):** `E6 0` (Trigger Starter Button, device will use current timestamp)
- **Example (Receive):** `E3 1234abcd M0` (Race Start notification)

### 2. Configuration (`C`)
Update system settings. Multiple keys can be updated in one command.

- **Format:** `C <key><val> [<key><val> ...]`
- **Response:** `C <key><val> [<key><val> ...]` (Symmetric confirmation of set values)

| Key | Description | Unit |
| :--- | :--- | :--- |
| `M` | Climb Mode (0:Speed, 1:Boulder, 2:Lead, 3:Clock) | ID |
| `C` | Climb Duration | Seconds |
| `T` | Transition/Rest Duration | Seconds |
| `V` | Beeper Volume | 0-100 |
| `Q` | Run Mode (0:Quals, 1:Finals) | ID |
| `X` | Show Tenths (0:Off, 1:On) | Bool |
| `Y` | Use Symbols (0:Off, 1:On) | Bool |
| `B` | Beeper Style (0:Prague, 1:Innsbruck, 2:Japan) | ID |
| `W` | Waveform (0:Sine, 1:Square) | Bool |
| `K` | Maintenance Mode (0:Off, 1:On) | Bool |
| `A` | Assigned Lane (0:Both, 1:A, 2:B) | ID |
| `D` | Radio Mode (0:WiFi, 1:BLE) [Getter Only] | ID |

- **Example:** `C M1 C240 T15` -> `C M1 C240 T15`

### 3. Getters (`G`)
Retrieve one or more configuration values. Providing no keys returns the full configuration.

- **Format:** `G [<key> ...]`
- **Response:** `G <key><val> [<key><val> ...]`
- **Example (Specific):** `G M V` -> `G M1 V100`
- **Example (Full):** `G` -> `G M1 C240 T15 V100 Q0`

### 4. System Commands
- **`S`**: Status Query. Response: `S I<uuid> M<mode> Q<runmode>`
- **`R`**: Reset (Abort current race). Response: `R OK`
- **`!`**: Reboot Hardware. Response: `! OK`

---

## Technical Details

- **Timestamps**: All timestamps (`ts`) are 64-bit microseconds from `esp_timer_get_time()`, encoded as Hex without leading zeros.
- **Metadata**: Generic metadata (`M`) and Athlete UIDs (`A`) are encoded as Hex.
- **Numerical Args**: Most other parameters (IDs, Durations, Frequencies) are Decimal.
- **Asymmetric Prefix**: None. The protocol is symmetric; outbound events use the same `E` prefix.
