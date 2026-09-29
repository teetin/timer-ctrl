# Protocol Synchronization & Implementation Guide

This document provides a complete, unambiguous specification and implementation guide to synchronize the protocol implementation between the C++ firmware (`esp-climb-timer`) and the Web UI (`public/`). Pass these instructions to Jules in another session to update and sync the codebase.

---

## 1. Overview of Protocol Changes & Directives

### 1.1 Time Command (`TME`)
Replaces legacy time setting and queries. Standardizes time sync across BLE, WebSocket, and HTTP.
* **Set Format:** `TME YYYY-MM-DD HH:MM:SS`
  * Example: `TME 2025-05-20 14:30:00`
  * Action: Updates System Time via `settimeofday` and syncs hardware RTC (`rtc_node_sync_from_system()`).
  * Response: `OK TME 2025-05-20 14:30:00\n`
* **Query Format:** `TME`
  * Response: `TME YYYY-MM-DD HH:MM:SS\n`

### 1.2 Radio Mode Command (`RDO`)
Replaces `RADIO` / key `D`. Standardizes radio mode queries and switches.
* **Set Format:** `RDO <0|1>` (or `RDO <WIFI|BLE>`)
  * `0` / `WIFI`: Radio mode set to WiFi (0).
  * `1` / `BLE`: Radio mode set to BLE (1).
  * Action: Persists radio mode to NVS and reboots device after 300ms delay.
  * Response: `OK RDO <0|1> — rebooting\n`
* **Query Format:** `RDO`
  * Response: `RDO <0|1>\n` (e.g. `RDO 0` for WiFi, `RDO 1` for BLE)

### 1.3 Circuit Sequence Command (`CS`)
Replaces string-based `circ_seq` with indexed zero-based step manipulation.
* **0-Based Indexing:** Step indices start at `0`.
* **Query Total Step Count:**
  * Request: `CS`
  * Response: `CS <total_count>\n` (e.g. `CS 2` if 2 steps exist).
* **Query Specific Step:**
  * Request: `CS <idx>`
  * Response: `CS <idx> <climb_sec> <rest_sec>\n` (e.g., `CS 0 30 15`).
  * If `<idx>` is out of bounds: returns `ERR CS index out of bounds\n`.
* **Set / Add Step:**
  * Request: `CS <idx> <climb_sec> <rest_sec>`
  * Behavior:
    * If `idx` is within existing range $[0, \text{count}-1]$: overwrites step `idx`.
    * If `idx == count`: appends step to end of sequence.
  * Response: `CS <idx> <climb_sec> <rest_sec>\n` and broadcasts updated sequence to node cluster.
* **Remove Step:**
  * Request: `CS <idx> 0 0`
  * Behavior:
    * Removes step at `idx` from list.
    * Shifts trailing items down by $-1$ (items from $idx+1 \dots N-1$ move to $idx \dots N-2$).
    * Sends responses for all shifted indices, followed by notifying that the old last slot is cleared: `CS <old_last_idx> 0 0\n`.
  * Special Case: Clear/Remove last step with `CS -1 0 0`
    * Request: `CS -1 0 0`
    * Removes step at index $N-1$ and returns `CS <N-1> 0 0\n`.

### 1.4 Config Key Mappings
* **Theme Key (`U`):** UI Theme setting is mapped to G-code key `'U'` (`CFG_TYPE_UI_THEME` = 7).
  * Set: `C U<val>` (e.g. `C U0` or `C U1`).
  * Response from `G`: includes `U<val>`.

### 1.5 HTTP `/cmd` Response Sync
Update HTTP `/cmd?val=...` handler in `esp-climb-timer/main/http_node.cpp` to capture the protocol response callback text from `protocol_parse_command` and send it in the HTTP response body (instead of static `"OK"`). This ensures HTTP GET command requests return the exact same response as WebSocket and BLE.

---

## 2. Firmware Implementation Changes (`esp-climb-timer`)

### File: `esp-climb-timer/main/protocol.cpp`
1. Update command handler for `TME`:
   ```cpp
   } else if (strncmp(line, "TME", 3) == 0) {
     char *p_time = strchr(line, ' ');
     if (p_time) p_time++;
     if (!p_time || *p_time == '\0') {
       time_t now = time(NULL);
       struct tm tm_info;
       localtime_r(&now, &tm_info);
       char resp[64];
       snprintf(resp, sizeof(resp), "TME %04d-%02d-%02d %02d:%02d:%02d\n",
                tm_info.tm_year + 1900, tm_info.tm_mon + 1, tm_info.tm_mday,
                tm_info.tm_hour, tm_info.tm_min, tm_info.tm_sec);
       if (response_cb) response_cb(resp, arg);
     } else {
       struct tm tm = {};
       if (strptime(p_time, "%Y-%m-%d %H:%M:%S", &tm) != NULL) {
         time_t t = mktime(&tm);
         struct timeval now = {.tv_sec = t, .tv_usec = 0};
         settimeofday(&now, NULL);
         rtc_node_sync_from_system();
         char resp[64];
         snprintf(resp, sizeof(resp), "OK TME %s\n", p_time);
         if (response_cb) response_cb(resp, arg);
       } else {
         if (response_cb) response_cb("ERR TME invalid format\n", arg);
       }
     }
   ```

2. Update command handler for `RDO`:
   ```cpp
   } else if (strncmp(line, "RDO", 3) == 0) {
     char *p_mode = strchr(line, ' ');
     if (p_mode) p_mode++;
     if (!p_mode || *p_mode == '\0') {
       char resp[32];
       snprintf(resp, sizeof(resp), "RDO %d\n", (int)config_get_radio_mode());
       if (response_cb) response_cb(resp, arg);
     } else {
       int mode = -1;
       if (strncmp(p_mode, "WIFI", 4) == 0 || strcmp(p_mode, "0") == 0) mode = 0;
       else if (strncmp(p_mode, "BLE", 3) == 0 || strcmp(p_mode, "1") == 0) mode = 1;

       if (mode >= 0) {
         char resp[64];
         snprintf(resp, sizeof(resp), "OK RDO %d — rebooting\n", mode);
         if (response_cb) response_cb(resp, arg);
         config_set_radio_mode(mode);
         vTaskDelay(pdMS_TO_TICKS(300));
         esp_restart();
       } else {
         if (response_cb) response_cb("ERR RDO invalid mode\n", arg);
       }
     }
   ```

3. Update command handler for `CS`:
   ```cpp
   } else if (strncmp(line, "CS", 2) == 0) {
     char *p_args = line + 2;
     while (*p_args == ' ') p_args++;

     if (*p_args == '\0' || *p_args == '\n' || *p_args == '\r') {
       // Request total step count: CS
       int count = config_get_circuit_steps(NULL, 0);
       char resp[32];
       snprintf(resp, sizeof(resp), "CS %d\n", count);
       if (response_cb) response_cb(resp, arg);
     } else {
       int idx = 0, climb = 0, rest = 0;
       int matched = sscanf(p_args, "%d %d %d", &idx, &climb, &rest);
       circuit_step_t steps[MAX_CIRCUIT_STEPS];
       int count = config_get_circuit_steps(steps, MAX_CIRCUIT_STEPS);

       if (matched == 1) {
         // Query step by index: CS <idx>
         if (idx >= 0 && idx < count) {
           char resp[64];
           snprintf(resp, sizeof(resp), "CS %d %lu %lu\n", idx,
                    (unsigned long)(steps[idx].climb_ms / 1000),
                    (unsigned long)(steps[idx].rest_ms / 1000));
           if (response_cb) response_cb(resp, arg);
         } else {
           if (response_cb) response_cb("ERR CS index out of bounds\n", arg);
         }
       } else if (matched == 3) {
         if (climb == 0 && rest == 0) {
           // Remove step: CS <idx> 0 0 or CS -1 0 0
           int target_idx = (idx == -1) ? (count - 1) : idx;
           if (target_idx >= 0 && target_idx < count) {
             for (int i = target_idx; i < count - 1; i++) {
               steps[i] = steps[i + 1];
             }
             count--;
             config_set_circuit_steps(steps, count);

             // Respond for shifted elements and notify cleared slot
             for (int i = target_idx; i < count; i++) {
               char resp[64];
               snprintf(resp, sizeof(resp), "CS %d %lu %lu\n", i,
                        (unsigned long)(steps[i].climb_ms / 1000),
                        (unsigned long)(steps[i].rest_ms / 1000));
               if (response_cb) response_cb(resp, arg);
             }
             char resp_clr[32];
             snprintf(resp_clr, sizeof(resp_clr), "CS %d 0 0\n", count);
             if (response_cb) response_cb(resp_clr, arg);
           } else {
             if (response_cb) response_cb("ERR CS index out of bounds\n", arg);
           }
         } else {
           // Set or Append step: CS <idx> <climb> <rest>
           if (idx >= 0 && idx <= count && idx < MAX_CIRCUIT_STEPS) {
             steps[idx].climb_ms = (uint32_t)climb * 1000;
             steps[idx].rest_ms = (uint32_t)rest * 1000;
             if (idx == count) count++;
             config_set_circuit_steps(steps, count);

             char resp[64];
             snprintf(resp, sizeof(resp), "CS %d %d %d\n", idx, climb, rest);
             if (response_cb) response_cb(resp, arg);
           } else {
             if (response_cb) response_cb("ERR CS index out of bounds\n", arg);
           }
         }
       }
     }
   }
   ```

### File: `esp-climb-timer/main/http_node.cpp`
Capture protocol responses in HTTP `/cmd` handler:
```cpp
struct http_cmd_ctx {
  char response_buf[512];
  size_t len;
};

static void http_cmd_response_cb(const char *msg, void *arg) {
  struct http_cmd_ctx *ctx = (struct http_cmd_ctx *)arg;
  if (ctx && msg) {
    strncat(ctx->response_buf, msg, sizeof(ctx->response_buf) - ctx->len - 1);
    ctx->len = strlen(ctx->response_buf);
  }
}

static esp_err_t http_event_post_handler(httpd_req_t *req) {
  char buf[256];
  if (httpd_req_get_url_query_str(req, buf, sizeof(buf)) == ESP_OK) {
    char param[128];
    if (httpd_query_key_value(buf, "val", param, sizeof(param)) == ESP_OK) {
      struct http_cmd_ctx ctx = {};
      protocol_parse_command(param, http_cmd_response_cb, &ctx);
      if (ctx.len > 0) {
        httpd_resp_sendstr(req, ctx.response_buf);
        return ESP_OK;
      }
    }
    // Fallback logic for evt/meta...
  }
  httpd_resp_sendstr(req, "OK");
  return ESP_OK;
}
```

---

## 3. Web UI Implementation Changes (`public/`)

### File: `public/app.js`

1. **Update Line Parser (`handleLine`):**
   * Parse `TME`:
     ```javascript
     if (line.startsWith('TME ') || line.startsWith('OK TME ')) {
       const timeVal = line.replace(/^(OK\s+)?TME\s*/, '').trim();
       this.terminal?.print(`Device Time: ${timeVal}`, 'info');
       return;
     }
     ```
   * Parse `RDO`:
     ```javascript
     if (line.startsWith('RDO ') || line.startsWith('OK RDO ')) {
       const radioVal = line.replace(/^(OK\s+)?RDO\s*/, '').replace(/—.*/, '').trim();
       const radioSelect = document.getElementById('cfg-radio-mode');
       if (radioSelect) {
         radioSelect.value = (radioVal === '1' || radioVal === 'BLE') ? 'BLE' : 'WIFI';
       }
       return;
     }
     ```
   * Parse `CS`:
     ```javascript
     if (line.startsWith('CS ') || line.startsWith('OK CS ')) {
       const body = line.replace(/^(OK\s+)?CS\s*/, '').trim();
       const parts = body.split(/\s+/);
       if (parts.length === 1) {
         const count = parseInt(parts[0], 10);
         this.circuitStepsCount = count;
         this.circuitSteps = [];
         for (let i = 0; i < count; i++) {
           this.sendTerminalCommand(`CS ${i}`);
         }
       } else if (parts.length >= 3) {
         const idx = parseInt(parts[0], 10);
         const climb = parseInt(parts[1], 10);
         const rest = parseInt(parts[2], 10);

         if (climb === 0 && rest === 0) {
           this.circuitSteps.splice(idx, 1);
         } else {
           this.circuitSteps[idx] = { climb, rest };
         }
         this.config.circ_seq = this.buildCircSeqStr(this.circuitSteps);
         this.renderCircuitStepsTable();
         this.renderFlowVisualizer();
       }
       return;
     }
     ```

2. **Update Connection Initial Queries (`connect` method):**
   ```javascript
   this.sendTerminalCommand('G');
   this.sendTerminalCommand('S');
   this.sendTerminalCommand('CS');
   this.sendTerminalCommand('TME');
   this.sendTerminalCommand('RDO');
   ```

3. **Update Theme & Config Mappings:**
   * Map `cfg-theme` change to send `C U<val>`:
     ```javascript
     document.getElementById('cfg-theme')?.addEventListener('change', (e) => {
       const val = parseInt(e.target.value, 10);
       this.config.theme = val;
       this.config.U = val;
       this.sendConfig('U', val);
       this.applyTheme();
     });
     ```

4. **Update Time Sync Button:**
   ```javascript
   async syncDeviceTime() {
     const now = new Date();
     const pad = (n) => String(n).padStart(2, '0');
     const timeStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
     await this.sendTerminalCommand(`TME ${timeStr}`);
   }
   ```

5. **Update Circuit Steps UI Modifiers (`addCircuitStep`, `removeCircuitStep`, `updateCircuitStepsFromUI`):**
   * Use `CS <idx> <climb> <rest>` and `CS <idx> 0 0` commands to update individual steps immediately.

---

## 4. Verification & Testing Instructions

1. **Build and Test Web UI:**
   Run tests using Bun:
   ```bash
   bun test
   ```
2. **Verify Protocol Output over Terminal / Console:**
   * Query `TME`, `RDO`, `CS`.
   * Verify response formatting matches specifications.
3. **Pre-Commit Checks:**
   Follow `pre_commit_instructions` before submitting changes.
