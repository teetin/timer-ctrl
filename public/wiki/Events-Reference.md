# Events & Protocol Specifications Reference

This document details event codes, BLE GATT specifications, and HTTP API endpoints.

---

## 📡 System Event Codes (`E<code>`)

Events are transmitted in the format `E<code> <ts:hex> [args...]`.

| Code | Event Name | Description | Arguments |
| :--- | :--- | :--- | :--- |
| `1` | `EVENT_NONE` | No event / idle tick | None |
| `2` | `EVENT_TIMER_START` | Master timer started | None |
| `3` | `EVENT_TIMER_STOP` | Master timer stopped | None |
| `4` | `EVENT_TIMER_PAUSE` | Master timer paused | None |
| `5` | `EVENT_TIMER_RESUME` | Master timer resumed | None |
| `6` | `EVENT_STARTER_BUTTON` | Starter button pressed | None |
| `7` | `EVENT_FINISH_BUTTON` | Finish button pressed | None |
| `8` | `EVENT_ABORT_BUTTON` | Abort race button pressed | None |
| `12` | `EVENT_DISP_SYNC_START` | Display sync start broadcast | `M<metadata:hex>` |
| `13` | `EVENT_DISP_SYNC_STOP` | Display sync stop broadcast | `M<metadata:hex>` |
| `25` | `EVENT_STATE_CHANGE` | State machine transition | `L<lane>` `S<state>` |
| `29` | `EVENT_REFEREE_JUDGE_A` | Referee manual winner call Lane A | None |
| `30` | `EVENT_REFEREE_JUDGE_B` | Referee manual winner call Lane B | None |

### System States (`S<state>`)
- `0`: IDLE
- `1`: PRECONDITION
- `2`: STARTER_WAIT
- `3`: BEEPING
- `4`: TRANSITION
- `5`: READY
- `6`: RACING
- `7`: FINISHED
- `8`: FALSE_START
- `9`: PAUSED
- `10`: FALL
- `11`: SPLASH

---

## ᛒ Bluetooth Low Energy (BLE) GATT Specifications

- **Service UUID**: `6e400001-b5a3-f393-e0a9-e50e24dcca9e` (Nordic UART Service)
- **RX Characteristic UUID**: `6e400002-b5a3-f393-e0a9-e50e24dcca9e` (Write without response)
- **TX Characteristic UUID**: `6e400003-b5a3-f393-e0a9-e50e24dcca9e` (Notify)

---

## 🌐 HTTP / SSE Network API Endpoints

- **`POST /cmd`**: Submit G-code string in request body. Returns plain text response (e.g., `OK`).
- **`GET /events`**: Server-Sent Events (SSE) stream broadcasting real-time system events (`E...`).
- **`GET /time?set=YYYY-MM-DD HH:MM:SS`**: Directly updates hardware RTC clock.
