import { BLEDevice } from './ble.js';
import { Terminal } from './terminal.js';

// ============================================================================
// Climb Timer Control App
// ============================================================================

class ClimbTimerApp {
  constructor() {
    this.ble = new BLEDevice();
    this.terminal = null;
    this.currentMode = 0; // 0: Speed, 1: Boulder, 2: Lead, 3: Clock
    this.currentRunMode = 0; // 0: Quals, 1: Finals
    this.config = {
      climb: 60,
      trans: 15,
      mode: 0,
      runmode: 0,
      vol: 100,
      beepStyle: 0,
      waveform: 0,
      symbols: false,
      tenths: false,
      console: false,
      laneA: true,
      laneB: true,
      theme: 0,
      maintenance: false,
      assignedLane: 0,
    };
    // Display timer state (driven by incoming EVT/DISP messages)
    this.systemState = 0; // climb_event_id_t from EVENTS.md
    this.displayState = 'idle'; // 'idle' | 'running' | 'paused' | 'finished'
    this.displayElapsedMs = 0; // milliseconds
    this.displayInterval = null;
    this.bleLineBuffer = '';
    this.timerTotal = 0; // total duration in ms for countdown calculation
    this.initializeUI();
  }

  initializeUI() {
    // Terminal
    const terminalEl = document.getElementById('terminal');
    if (terminalEl) {
      this.terminal = new Terminal(terminalEl);
    } else {
      console.error('terminal element not found');
      return;
    }

    // Connection buttons - safe attachment
    document.getElementById('connectBtn')?.addEventListener('click', () => this.connect());
    document.getElementById('disconnectBtn')?.addEventListener('click', () => this.disconnect());

    // Main control buttons - safe attachment
    document.getElementById('btn-start')?.addEventListener('click', () => this.sendEvent(6));
    document.getElementById('btn-reset')?.addEventListener('click', () => this.sendEvent(9));
    document.getElementById('btn-abort')?.addEventListener('click', () => this.sendEvent(8));
    document.getElementById('btn-finish')?.addEventListener('click', () => this.sendEvent(7));

    // Judging override buttons
    document.getElementById('btn-winner-a')?.addEventListener('click', () => this.sendJudgement(1));
    document.getElementById('btn-winner-b')?.addEventListener('click', () => this.sendJudgement(2));
    document.getElementById('btn-fall-a')?.addEventListener('click', () => this.sendEvent(8, 1));
    document.getElementById('btn-fall-b')?.addEventListener('click', () => this.sendEvent(8, 2));

    // Configuration buttons
    document.getElementById('toggleConfig')?.addEventListener('click', () => this.toggleConfig());
    document.getElementById('closeConfig')?.addEventListener('click', () => this.closeConfig());
    document.getElementById('applyConfig')?.addEventListener('click', () => this.applyConfig());
    document.getElementById('resetConfig')?.addEventListener('click', () => this.resetConfigForm());

    // Mode selection
    document.getElementById('cfg-mode')?.addEventListener('change', (e) => {
      const mode = parseInt(e.target.value);
      this.sendConfig('mode', mode);
      this.updateModeUI(mode);
      this.updateTimerPreviewFromForm();
      document.getElementById('runModeConfig')?.classList.toggle('hidden', mode === 0);
    });

    // Config form inputs
    document.getElementById('cfg-climb')?.addEventListener('change', (e) => {
      this.sendConfig('climb', e.target.value);
      this.updateTimerPreviewFromForm();
    });
    document.getElementById('cfg-trans')?.addEventListener('change', (e) => {
      this.sendConfig('trans', e.target.value);
      this.updateTimerPreviewFromForm();
    });
    document.getElementById('cfg-runmode')?.addEventListener('change', (e) => {
      this.sendConfig('runmode', e.target.value);
      this.updateTimerPreviewFromForm();
    });
    document.getElementById('cfg-vol')?.addEventListener('input', (e) => {
      document.getElementById('volDisplay').textContent = e.target.value;
    });
    document.getElementById('cfg-vol')?.addEventListener('change', (e) => {
      this.sendConfig('vol', e.target.value);
    });
    document.getElementById('cfg-symbols')?.addEventListener('change', (e) => {
      this.config.symbols = e.target.checked;
      this.sendConfig('symbols', e.target.checked ? 1 : 0);
      this.updateSymbolUI();
    });
    document.getElementById('cfg-tenths')?.addEventListener('change', (e) => {
      this.config.tenths = e.target.checked;
      this.sendConfig('tenths', e.target.checked ? 1 : 0);
      this.updateTimerTextFromMs();
    });
    document.getElementById('cfg-console')?.addEventListener('change', (e) => {
      this.config.console = e.target.checked;
      document.getElementById('terminalPanel')?.classList.toggle('hidden', !this.config.console);
    });
    document.getElementById('cfg-theme')?.addEventListener('change', (e) => {
      this.config.theme = parseInt(e.target.value, 10);
      this.applyTheme();
    });
    document.getElementById('cfg-maintenance')?.addEventListener('change', (e) => {
      this.config.maintenance = e.target.checked;
      this.sendConfig('maint', e.target.checked ? 1 : 0);
    });
    document.getElementById('cfg-assigned-lane')?.addEventListener('change', (e) => {
      const lane = parseInt(e.target.value, 10);
      this.config.assignedLane = lane;
      this.sendConfig('lane', lane);
    });
    document.getElementById('cfg-beep-style')?.addEventListener('change', (e) => {
      this.sendConfig('beep', e.target.value);
    });
    document.getElementById('cfg-waveform')?.addEventListener('change', (e) => {
      this.sendConfig('wave', e.target.value);
    });

    // Terminal
    document.getElementById('toggleTerminal')?.addEventListener('click', () => this.toggleTerminal());
    document.getElementById('closeTerminal')?.addEventListener('click', () => this.closeTerminal());
    document.getElementById('terminalClear')?.addEventListener('click', () => this.terminal?.clear());
    document.getElementById('terminalSave')?.addEventListener('click', () => this.terminal?.saveLogs());
    document.getElementById('terminalSend')?.addEventListener('click', () => this.sendTerminalCommand());
    document.getElementById('terminalInput')?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendTerminalCommand();
    });

    if (this.terminal) {
      this.terminal.print('Climb Timer Control initialized', 'info');
    }
    this.syncFormWithConfig();
    this.updateModeDisplay();
    this.updateRunModeDisplay();
    this.updateSymbolUI();
    this.updateTimerPreview();
    this.applyTheme();
  }

  syncFormWithConfig() {
    document.getElementById('cfg-climb').value = this.config.climb;
    document.getElementById('cfg-trans').value = this.config.trans;
    document.getElementById('cfg-mode').value = this.config.mode;
    document.getElementById('cfg-runmode').value = this.config.runmode;
    document.getElementById('cfg-vol').value = this.config.vol;
    document.getElementById('volDisplay').textContent = this.config.vol;
    document.getElementById('cfg-symbols').checked = this.config.symbols;
    document.getElementById('cfg-tenths').checked = this.config.tenths;
    document.getElementById('cfg-console').checked = this.config.console;
    document.getElementById('cfg-lane-a').checked = this.config.laneA;
    document.getElementById('cfg-lane-b').checked = this.config.laneB;
    const themeEl = document.getElementById('cfg-theme');
    if (themeEl) themeEl.value = this.config.theme;
    const mainEl = document.getElementById('cfg-maintenance');
    if (mainEl) mainEl.checked = this.config.maintenance;
    const laneEl = document.getElementById('cfg-assigned-lane');
    if (laneEl) laneEl.value = this.config.assignedLane;
    this.updateModeUI(this.config.mode);
  }

  async connect() {
    try {
      await this.ble.connect();
      this.terminal.print('Connected to: ' + this.ble.getDeviceName(), 'success');

      // Set up receive handler BEFORE sending any commands
      this.ble.onReceive((data) => this.handleBLEResponse(data));
      this.ble.onDisconnected(() => this.handleDisconnection());

      // Update UI
      document.getElementById('statusIndicator').classList.remove('disconnected');
      document.getElementById('statusIndicator').classList.add('connected');
      document.getElementById('statusText').textContent = 'Connected';
      document.getElementById('connectBtn').style.display = 'none';
      document.getElementById('deviceInfo').classList.remove('hidden');
      document.getElementById('deviceName').textContent = this.ble.getDeviceName();

      // Enable control buttons
      this.setControlsEnabled(true);
      document.getElementById('terminalInput').disabled = false;
      document.getElementById('terminalSend').disabled = false;

      // Request status AFTER handlers are set up
      this.sendTerminalCommand('STATUS');
    } catch (error) {
      this.terminal.print('Connection failed: ' + error.message, 'error');
    }
  }

  async disconnect() {
    try {
      await this.ble.disconnect();
      this.handleDisconnection();
    } catch (error) {
      this.terminal.print('Disconnect failed: ' + error.message, 'error');
    }
  }

  handleDisconnection() {
    this.terminal.print('Disconnected from device', 'info');
    document.getElementById('statusIndicator').classList.remove('connected');
    document.getElementById('statusIndicator').classList.add('disconnected');
    document.getElementById('statusText').textContent = 'Disconnected';
    document.getElementById('connectBtn').style.display = 'block';
    document.getElementById('deviceInfo').classList.add('hidden');

    // Disable control buttons
    this.setControlsEnabled(false);
    document.getElementById('terminalInput').disabled = true;
    document.getElementById('terminalSend').disabled = true;
  }

  handleBLEResponse(data) {
    const raw = data.toString();
    const chunk = this.bleLineBuffer + raw;
    const lines = chunk.split(/\r?\n/);
    this.bleLineBuffer = lines.pop() || '';
    lines.map((line) => line.trim()).filter(Boolean).forEach((line) => this.handleBLELine(line));
  }

  handleBLELine(line) {
    this.terminal.print('Received: ' + line, 'received');
    const message = line.trim();
    const upper = message.toUpperCase();

    if (!message) return;

    if (upper.startsWith('OK')) {
      if (upper.startsWith('OK CFG')) {
        this.terminal.print('✓ Configuration updated', 'success');
        this.parseCfgUpdate(message.substring(7));
      } else {
        this.terminal.print('✓ Command accepted', 'success');
      }
    } else if (upper.startsWith('ERR')) {
      this.terminal.print('✗ Error: ' + message, 'error');
    } else if (upper.startsWith('STATUS')) {
      this.parseStatus(message);
    } else if (upper.startsWith('VAL')) {
      this.parseValue(message);
    } else if (upper.startsWith('EVT')) {
      this.parseEvent(message);
    } else if (upper.startsWith('DISP_SYNC')) {
      this.parseDispSync(message);
    } else {
      this.terminal.print('Unhandled message: ' + message, 'info');
    }
  }

  parseEvent(data) {
    // Handle both formats:
    // 1. EVT <id> [meta]
    // 2. EVT:<id> ts=<ts> meta=<meta>
    let id,
      metaVal = 0;

    if (data.includes('ts=') || data.includes('meta=')) {
      const idMatch = data.match(/EVT:(\d+)/i);
      id = idMatch ? parseInt(idMatch[1], 10) : NaN;
      const metaMatch = data.match(/meta=(\d+)/i);
      metaVal = metaMatch ? parseInt(metaMatch[1], 10) : 0;
    } else {
      const cleaned = data.trim().replace(/^EVT\s*:\s*/i, 'EVT ');
      const parts = cleaned.split(/\s+/);
      id = parseInt(parts[1], 10);
      metaVal = parts.length > 2 ? parseInt(parts[2], 10) : 0;
    }

    if (Number.isNaN(id)) {
      this.terminal.print('Invalid EVT payload: ' + data, 'error');
      return;
    }

    switch (id) {
      case 3: // RACE_START
        this.handleStateChange(0, 6); // RACING
        this.startDisplayTimer(0, 6);
        break;
      case 6: // STARTER_BUTTON
        this.terminal.print('Starter Button Pressed', 'info');
        break;
      case 7: // RACE_FINISH
        this.handleStateChange(0, 7); // FINISHED
        break;
      case 8: // RACE_ABORT
        this.handleStateChange(0, 0); // IDLE
        break;
      case 9: // UI_RESET
        this.resetDisplayTimer();
        break;
      case 12: // DISP_SYNC_START
        {
          const state = metaVal & 0xff;
          const elapsedMs = (metaVal >> 8) & 0xffffff;
          this.handleStateChange(0, state);
          this.startDisplayTimer(elapsedMs, state);
        }
        break;
      case 13: // DISP_SYNC_STOP
        {
          const state = metaVal & 0xff;
          const result = (metaVal >> 8) & 0xf;
          const elapsedMs = (metaVal >> 12) & 0xfffff;
          this.displayElapsedMs = elapsedMs;
          this.handleStateChange(0, state);
          this.terminal.print(
            `Sync Stop: Result=${result} Time=${(elapsedMs / 1000).toFixed(3)}s`,
            'success'
          );
        }
        break;
      case 15: // DISP_SYNC_MODE
        this.currentMode = metaVal;
        this.updateModeDisplay();
        break;
      case 16: // DISP_SYNC_PROG
        const stateEl = document.getElementById('statePreview');
        if (stateEl) {
          stateEl.textContent = `PROG: ${metaVal}%`;
          setTimeout(() => this.updateTimerPreview(), 1500);
        }
        break;
      case 20: // PAD_TRIGGERED
        this.terminal.print(`Pad Triggered: ${metaVal}`, 'info');
        break;
      case 21: // PAD_RELEASED
        this.terminal.print(`Pad Released: ${metaVal}`, 'info');
        break;
      case 25: // STATE_CHANGE
        {
          const lane = metaVal & 0xff;
          const stateIdx = (metaVal >> 8) & 0xff;
          this.handleStateChange(lane, stateIdx);
        }
        break;
      default:
        this.terminal.print(`Event ${id} meta=${metaVal}`, 'info');
    }
  }

  static STATE_NAMES = [
    'IDLE',
    'PRECONDITION',
    'STARTER_WAIT',
    'BEEPING',
    'TRANSITION',
    'READY',
    'RACING',
    'FINISHED',
    'FALSE_START',
    'PAUSED',
    'FALL',
    'SPLASH',
  ];

  handleStateChange(lane, stateIdx) {
    this.systemState = stateIdx;
    const stateName = ClimbTimerApp.STATE_NAMES[stateIdx] || `UNKNOWN(${stateIdx})`;
    this.terminal.print(`State Change [Lane ${lane}]: ${stateName}`, 'info');

    // Manage local timer based on state
    if (stateIdx === 6 || stateIdx === 4 || stateIdx === 3) {
      // RACING, TRANSITION, BEEPING
      if (this.displayState !== 'running') {
        this.startDisplayTimer(0, stateIdx);
      } else {
        // Update total if state changed while running
        if (stateIdx === 4) this.timerTotal = this.config.trans * 1000;
        else if (stateIdx === 6) this.timerTotal = this.config.climb * 1000;
      }
    } else if (stateIdx === 7 || stateIdx === 8 || stateIdx === 10) {
      // FINISHED, FALSE_START, FALL
      this.finishDisplayTimer();
    } else if (stateIdx === 0 || stateIdx === 11) {
      // IDLE, SPLASH
      this.resetDisplayTimer();
    } else if (stateIdx === 9) {
      // PAUSED
      this.pauseDisplayTimer();
    }

    this.updateTimerPreview();
  }

  parseDispSync(data) {
    const cleaned = data.trim().replace(/^DISP_SYNC\s*:\s*/i, 'DISP_SYNC ');
    const parts = cleaned.split(/\s+/);
    const cmd = parts[0].toUpperCase();
    if (cmd === 'DISP_SYNC_START') {
      const elapsed = parts.length > 1 ? Number(parts[1]) : 0;
      this.startDisplayTimer(elapsed);
    } else if (cmd === 'DISP_SYNC_STOP') {
      const elapsed = parts.length > 2 ? Number(parts[2]) : parts.length > 1 ? Number(parts[1]) : null;
      if (elapsed !== null && !Number.isNaN(elapsed)) {
        this.displayElapsedMs = elapsed;
      }
      this.finishDisplayTimer();
    }
  }

  startDisplayTimer(startElapsedMs = 0, stateIdx = null) {
    this.clearDisplayInterval();
    this.displayElapsedMs = Number(startElapsedMs) || 0;
    this.displayState = 'running';

    if (stateIdx !== null) this.systemState = stateIdx;

    // Calculate total timer duration based on mode and state
    if (this.systemState === 4) {
      // TRANSITION
      this.timerTotal = this.config.trans * 1000;
    } else if (this.systemState === 6) {
      // RACING
      this.timerTotal = this.config.climb * 1000;
    } else if (this.systemState === 3) {
      // BEEPING
      this.timerTotal = 5000; // Standard speed countdown approx
    } else {
      const isTransition = this.displayElapsedMs < this.config.trans * 1000;
      this.timerTotal = isTransition ? this.config.trans * 1000 : (this.config.trans + this.config.climb) * 1000;
    }

    this.updateTimerTextFromMs();
    this.updateTimerPreview();
    this.displayInterval = setInterval(() => {
      this.displayElapsedMs += 100;
      this.updateTimerTextFromMs();
    }, 100);
  }

  pauseDisplayTimer() {
    this.clearDisplayInterval();
    this.displayState = 'paused';
    this.updateTimerPreview();
  }

  resumeDisplayTimer() {
    if (this.displayState === 'paused') {
      this.displayState = 'running';
      this.displayInterval = setInterval(() => {
        this.displayElapsedMs += 100;
        this.updateTimerTextFromMs();
      }, 100);
    }
  }

  finishDisplayTimer() {
    this.clearDisplayInterval();
    this.displayState = 'finished';
    this.updateTimerTextFromMs();
    this.updateTimerPreview();
  }

  resetDisplayTimer() {
    this.clearDisplayInterval();
    this.displayState = 'idle';
    this.displayElapsedMs = 0;
    this.timerTotal = 0;
    this.updateTimerTextFromMs();
    this.updateTimerPreview();
  }

  clearDisplayInterval() {
    if (this.displayInterval) {
      clearInterval(this.displayInterval);
      this.displayInterval = null;
    }
  }

  updateTimerTextFromMs() {
    const el = document.getElementById('timerValue');
    if (!el) return;

    // For boulder/lead modes, show countdown; for speed, show elapsed
    let displayMs = this.displayElapsedMs;
    if (this.currentMode === 1 || this.currentMode === 2) {
      // Boulder or Lead: countdown remaining time
      displayMs = Math.max(0, this.timerTotal - this.displayElapsedMs);
    }

    const ms = Math.max(0, Math.floor(displayMs));
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const tenths = Math.floor((ms % 1000) / 100);

    if (this.config.tenths) {
      el.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${tenths}`;
    } else {
      el.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    // If in a race (not idle), persist the state and update mode display for run mode
    if (this.displayState !== 'idle' && this.displayState !== 'paused') {
      this.updateTimerPreview();
    }
  }

  parseStatus(data) {
    // STATUS ID=<id> MODE=<mode> RUN=<runmode> ...
    const parts = data.split(' ');
    parts.forEach((part) => {
      const [keyRaw, value] = part.split('=');
      if (!keyRaw || value === undefined) return;
      const key = keyRaw.toUpperCase();
      const val = parseInt(value, 10);

      switch (key) {
        case 'MODE':
          this.config.mode = val;
          this.currentMode = val;
          this.updateModeDisplay();
          break;
        case 'RUN':
          this.config.runmode = val;
          this.currentRunMode = val;
          this.updateRunModeDisplay();
          break;
        case 'CLIMB':
          this.config.climb = val;
          break;
        case 'TRANS':
          this.config.trans = val;
          break;
        case 'VOL':
          this.config.vol = val;
          break;
        case 'TENTHS':
          this.config.tenths = val === 1;
          this.updateTimerTextFromMs();
          break;
        case 'SYMBOLS':
          this.config.symbols = val === 1;
          this.updateSymbolUI();
          break;
        case 'BEEP':
          this.config.beepStyle = val;
          break;
        case 'WAVE':
          this.config.waveform = val;
          break;
        case 'MAINT':
          this.config.maintenance = val === 1;
          break;
        case 'LANE':
          this.config.assignedLane = val;
          break;
      }
    });
    this.syncFormWithConfig();
  }

  parseCfgUpdate(data) {
    const parts = data.split(' ');
    if (parts.length < 2) return;
    const key = parts[0].toLowerCase();
    const value = parts[1];
    const val = parseInt(value, 10);

    switch (key) {
      case 'mode':
        this.config.mode = val;
        this.currentMode = val;
        this.updateModeDisplay();
        break;
      case 'runmode':
        this.config.runmode = val;
        this.currentRunMode = val;
        this.updateRunModeDisplay();
        break;
      case 'climb':
        this.config.climb = val;
        break;
      case 'trans':
        this.config.trans = val;
        break;
      case 'vol':
        this.config.vol = val;
        break;
      case 'tenths':
        this.config.tenths = val === 1;
        this.updateTimerTextFromMs();
        break;
      case 'symbols':
        this.config.symbols = val === 1;
        this.updateSymbolUI();
        break;
      case 'beep':
        this.config.beepStyle = val;
        break;
      case 'wave':
        this.config.waveform = val;
        break;
      case 'maint':
        this.config.maintenance = val === 1;
        break;
      case 'lane':
        this.config.assignedLane = val;
        break;
    }
    this.syncFormWithConfig();
  }

  parseValue(data) {
    // VAL <value>
    const value = data.split(' ')[1];
    this.terminal.print('Value: ' + value, 'info');
  }

  async sendConfig(key, value) {
    if (!this.ble.isConnected()) {
      return;
    }
    const command = `CFG ${key} ${value}\n`;
    try {
      await this.ble.send(command);
      this.terminal.print('Sent: ' + command.trim(), 'sent');
    } catch (error) {
      this.terminal.print('Send CFG failed: ' + error.message, 'error');
    }
  }

  async sendEvent(eventId, meta = 0) {
    if (!this.ble.isConnected()) {
      this.terminal.print('Not connected', 'error');
      return;
    }

    let command = `EVT ${eventId}`;
    if (meta > 0) {
      command += ` ${meta}`;
    }

    try {
      await this.ble.send(command + '\n');
      this.terminal.print('Sent: ' + command, 'sent');
    } catch (error) {
      this.terminal.print('Send failed: ' + error.message, 'error');
    }
  }

  async sendJudgement(winner) {
    if (!this.ble.isConnected()) {
      this.terminal.print('Not connected', 'error');
      return;
    }

    // EVT 1 = Judge event (winner 1 or 2)
    const command = `EVT 1`;
    try {
      await this.ble.send(command + '\n');
      this.terminal.print(`Sent: ${command} (Winner ${winner})`, 'sent');
    } catch (error) {
      this.terminal.print('Send failed: ' + error.message, 'error');
    }
  }

  async applyConfig() {
    const newConfig = {
      climb: Number(document.getElementById('cfg-climb').value),
      trans: Number(document.getElementById('cfg-trans').value),
      mode: parseInt(document.getElementById('cfg-mode').value, 10),
      runmode: parseInt(document.getElementById('cfg-runmode').value, 10),
      vol: Number(document.getElementById('cfg-vol').value),
      beepStyle: Number(document.getElementById('cfg-beep-style')?.value || this.config.beepStyle),
      waveform: Number(document.getElementById('cfg-waveform')?.value || this.config.waveform),
      symbols: document.getElementById('cfg-symbols').checked,
      tenths: document.getElementById('cfg-tenths').checked,
      console: document.getElementById('cfg-console').checked,
      laneA: document.getElementById('cfg-lane-a').checked,
      laneB: document.getElementById('cfg-lane-b').checked,
      theme: parseInt(document.getElementById('cfg-theme').value, 10),
      maintenance: document.getElementById('cfg-maintenance')?.checked || false,
      assignedLane: parseInt(document.getElementById('cfg-assigned-lane').value, 10),
    };

    this.config = { ...this.config, ...newConfig };
    this.syncFormWithConfig();
    this.updateModeDisplay();
    this.updateRunModeDisplay();
    this.updateTimerFormat();
    this.updateSymbolUI();

    if (!this.ble.isConnected()) {
      this.terminal.print('Configuration updated locally; connect to send to display', 'info');
      this.closeConfig();
      return;
    }

    try {
      const commands = [
        { key: 'climb', value: this.config.climb },
        { key: 'trans', value: this.config.trans },
        { key: 'mode', value: this.config.mode },
        { key: 'runmode', value: this.config.runmode },
        { key: 'vol', value: this.config.vol },
        { key: 'tenths', value: this.config.tenths ? 1 : 0 },
        { key: 'symbols', value: this.config.symbols ? 1 : 0 },
        { key: 'beep', value: this.config.beepStyle },
        { key: 'wave', value: this.config.waveform },
        { key: 'maint', value: this.config.maintenance ? 1 : 0 },
        { key: 'lane', value: this.config.assignedLane },
      ];

      for (const cfg of commands) {
        await this.sendConfig(cfg.key, cfg.value);
      }

      this.terminal.print('Configuration applied', 'success');
      this.updateTimerPreview();
      this.closeConfig();
    } catch (error) {
      this.terminal.print('Apply config failed: ' + error.message, 'error');
    }
  }

  resetConfigForm() {
    this.syncFormWithConfig();
    this.terminal.print('Configuration reset', 'info');
  }

  updateTimerFormat() {
    const timerElement = document.getElementById('timerValue');
    if (!timerElement) return;

    const text = timerElement.textContent || '00:00.0';
    const base = text.split('.')[0];
    timerElement.textContent = this.config.tenths ? `${base}.0` : base;
  }

  updateTimerPreview() {
    const trans = document.getElementById('transPreview');
    const climb = document.getElementById('climbPreview');
    const state = document.getElementById('statePreview');

    if (!trans || !climb || !state) return;

    trans.textContent = `${this.config.trans}s`;
    climb.textContent = `${this.config.climb}s`;
    state.textContent = this.getDisplayStateLabel();
    state.setAttribute('title', this.getDisplayStateLabel());
  }

  getDisplayStateLabel() {
    if (this.systemState !== undefined && ClimbTimerApp.STATE_NAMES[this.systemState]) {
      return ClimbTimerApp.STATE_NAMES[this.systemState];
    }

    if (this.displayState === 'finished') {
      return 'FINISHED';
    }

    if (this.displayState === 'paused') {
      return 'PAUSED';
    }

    if (this.displayState === 'idle') {
      return this.config.mode === 1 && this.config.runmode === 0 ? 'AUTO' : 'IDLE';
    }

    if (this.displayState === 'running') {
      const elapsedSeconds = this.displayElapsedMs / 1000;
      if (elapsedSeconds < this.config.trans) {
        return 'TRANSITION';
      }
      return 'CLIMB';
    }

    return 'UNKNOWN';
  }

  updateTimerPreviewFromForm() {
    this.config.trans = Number(document.getElementById('cfg-trans').value);
    this.config.climb = Number(document.getElementById('cfg-climb').value);
    this.config.mode = parseInt(document.getElementById('cfg-mode').value, 10);
    this.config.runmode = parseInt(document.getElementById('cfg-runmode').value, 10);
    this.updateTimerPreview();
  }

  updateSymbolUI() {
    const symbolPrefix = this.config.symbols ? '▶ ' : '';
    const startLabel = this.currentMode === 1 ? 'PLAY / PAUSE' : 'START';

    document.getElementById('btn-start').textContent = `${symbolPrefix}${startLabel}`;
    document.getElementById('btn-reset').textContent = `${this.config.symbols ? '⟲ ' : ''}RESET`;
    document.getElementById('btn-abort').textContent = `${this.config.symbols ? '✖ ' : ''}ABORT`;
    document.getElementById('btn-finish').textContent = `${this.config.symbols ? '✔ ' : ''}FINISH`;
  }

  async sendTerminalCommand(cmd = null) {
    const input = cmd || document.getElementById('terminalInput').value.trim();
    if (!input) return;

    if (!cmd && !this.ble.isConnected()) {
      this.terminal.print('Not connected', 'error');
      return;
    }

    try {
      await this.ble.send(input + '\n');
      this.terminal.print('Sent: ' + input, 'sent');
      if (!cmd) document.getElementById('terminalInput').value = '';
    } catch (error) {
      this.terminal.print('Send failed: ' + error.message, 'error');
    }
  }

  toggleConfig() {
    const panel = document.getElementById('configPanel');
    panel.classList.toggle('hidden');
  }

  closeConfig() {
    document.getElementById('configPanel').classList.add('hidden');
  }

  toggleTerminal() {
    const panel = document.getElementById('terminalPanel');
    panel.classList.toggle('hidden');
  }

  closeTerminal() {
    document.getElementById('terminalPanel').classList.add('hidden');
  }

  updateModeDisplay() {
    const modes = ['IFSC SPEED', 'BOULDER', 'LEAD', 'CLOCK'];
    document.getElementById('modeDisplay').textContent = modes[this.currentMode] || '--';

    const bodyClasses = ['mode-speed', 'mode-boulder', 'mode-lead', 'mode-clock'];
    document.body.className = bodyClasses[this.currentMode] || '';

    const speedOnly = document.querySelectorAll('.mode-speed-only');
    const boulderOnly = document.querySelectorAll('.mode-boulder-only');

    speedOnly.forEach((el) => {
      el.classList.toggle('hidden', this.currentMode !== 0);
    });
    boulderOnly.forEach((el) => {
      el.classList.toggle('hidden', this.currentMode !== 1);
    });

    const startButton = document.getElementById('btn-start');
    if (startButton) {
      startButton.textContent = this.config.symbols ? '▶ ' + (this.currentMode === 1 ? 'PLAY / PAUSE' : 'START') : (this.currentMode === 1 ? 'PLAY / PAUSE' : 'START');
    }
  }

  updateRunModeDisplay() {
    const runModes = ['AUTO-LOOP', 'REFEREE'];
    document.getElementById('runModeDisplay').textContent = runModes[this.currentRunMode] || '--';
  }

  applyTheme() {
    const root = document.documentElement;
    if (this.config.theme === 0) {
      // Pro Dark (High Contrast) - default
      root.style.setProperty('--bg', '#0f172a');
      root.style.setProperty('--card', '#1e293b');
      root.style.setProperty('--text', '#f8fafc');
      root.style.setProperty('--accent', '#38bdf8');
    } else if (this.config.theme === 1) {
      // IFSC Official Colors
      root.style.setProperty('--bg', '#1a1a1a');
      root.style.setProperty('--card', '#2d2d2d');
      root.style.setProperty('--text', '#ffffff');
      root.style.setProperty('--accent', '#ff6b35');
    }
    this.sendConfig('theme', this.config.theme);
  }

  updateModeUI(mode) {
    document.getElementById('runModeConfig').classList.toggle('hidden', mode === 0);
  }

  setControlsEnabled(enabled) {
    document.getElementById('btn-start').disabled = !enabled;
    document.getElementById('btn-reset').disabled = !enabled;
    document.getElementById('btn-abort').disabled = !enabled;
    document.getElementById('btn-finish').disabled = !enabled;
    document.getElementById('btn-winner-a').disabled = !enabled;
    document.getElementById('btn-winner-b').disabled = !enabled;
    document.getElementById('btn-fall-a').disabled = !enabled;
    document.getElementById('btn-fall-b').disabled = !enabled;
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new ClimbTimerApp();
});
