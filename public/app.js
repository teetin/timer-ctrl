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
      this.updateModeUI(mode);
      this.updateTimerPreviewFromForm();
      document.getElementById('runModeConfig')?.classList.toggle('hidden', mode === 0);
    });

    // Config form inputs
    document.getElementById('cfg-climb')?.addEventListener('input', () => this.updateTimerPreviewFromForm());
    document.getElementById('cfg-trans')?.addEventListener('input', () => this.updateTimerPreviewFromForm());
    document.getElementById('cfg-runmode')?.addEventListener('change', () => this.updateTimerPreviewFromForm());
    document.getElementById('cfg-vol')?.addEventListener('input', (e) => {
      document.getElementById('volDisplay').textContent = e.target.value;
    });
    document.getElementById('cfg-symbols')?.addEventListener('change', (e) => {
      this.config.symbols = e.target.checked;
      this.updateSymbolUI();
    });
    document.getElementById('cfg-tenths')?.addEventListener('change', (e) => {
      this.config.tenths = e.target.checked;
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
    });
    document.getElementById('cfg-assigned-lane')?.addEventListener('change', (e) => {
      this.config.assignedLane = parseInt(e.target.value, 10);
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
    // EVT <id> [meta] or EVT:<id> [meta]
    const cleaned = data.trim().replace(/^EVT\s*:\s*/i, 'EVT ');
    const parts = cleaned.split(/\s+/);
    const id = parseInt(parts[1], 10);
    const meta = parts.length > 2 ? parts.slice(2).join(' ') : null;
    if (Number.isNaN(id)) {
      this.terminal.print('Invalid EVT payload: ' + data, 'error');
      return;
    }

    switch (id) {
      case 3: // RACE_START
        this.startDisplayTimer(0);
        break;
      case 6: // STARTER_BUTTON
        // Toggle pause/resume on main button
        if (this.displayState === 'running') {
          this.pauseDisplayTimer();
        } else if (this.displayState === 'paused') {
          this.resumeDisplayTimer();
        }
        break;
      case 7: // RACE_FINISH
        this.finishDisplayTimer();
        break;
      case 8: // RACE_ABORT
      case 9: // UI_RESET
        this.resetDisplayTimer();
        break;
      case 12: // DISP_SYNC_START - meta may contain state and elapsed
        // meta format: [State] | ([ElapsedMS] << 8) (we may receive a simple elapsed value)
        this.parseDispSync(`DISP_SYNC_START ${meta || ''}`);
        break;
      case 13: // DISP_SYNC_STOP
        this.parseDispSync(`DISP_SYNC_STOP ${meta || ''}`);
        break;
      case 15: // DISP_SYNC_MODE
        if (meta !== null) {
          const modeVal = parseInt(meta, 10);
          if (!Number.isNaN(modeVal)) {
            this.currentMode = modeVal;
            this.updateModeDisplay();
          }
        }
        break;
      case 16: // DISP_SYNC_PROG
        // meta is progress value; show briefly in statePreview
        if (meta !== null) {
          const p = meta.toString();
          const stateEl = document.getElementById('statePreview');
          if (stateEl) {
            stateEl.textContent = p;
            setTimeout(() => this.updateTimerPreview(), 1500);
          }
        }
        break;
      default:
        // show event id for debugging
        this.terminal.print(`Event ${id} ${meta || ''}`, 'info');
    }
  }

  parseDispSync(data) {
    // Accept several shapes: DISP_SYNC_START <state> <elapsedMs>
    const cleaned = data.trim().replace(/^DISP_SYNC\s*:\s*/i, 'DISP_SYNC ');
    const parts = cleaned.split(/\s+/);
    const cmd = parts[0].toUpperCase();
    if (cmd === 'DISP_SYNC_START') {
      // try to read elapsed from the next token if present
      const elapsed = parts.length > 1 ? Number(parts[1]) : 0;
      this.startDisplayTimer(elapsed);
    } else if (cmd === 'DISP_SYNC_STOP') {
      // may include result/elapsed, treat as finish
      const elapsed = parts.length > 2 ? Number(parts[2]) : (parts.length > 1 ? Number(parts[1]) : null);
      if (elapsed !== null && !Number.isNaN(elapsed)) {
        this.displayElapsedMs = elapsed;
      }
      this.finishDisplayTimer();
    }
  }

  startDisplayTimer(startElapsedMs = 0) {
    this.clearDisplayInterval();
    this.displayElapsedMs = Number(startElapsedMs) || 0;
    this.displayState = 'running';
    // Calculate total timer duration based on mode and config
    const isTransition = this.displayElapsedMs < this.config.trans * 1000;
    this.timerTotal = isTransition ? this.config.trans * 1000 : (this.config.trans + this.config.climb) * 1000;
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
    // STATUS ID=<id> MODE=<mode> RUN=<runmode>
    const parts = data.split(' ');
    parts.forEach((part) => {
      const [keyRaw, value] = part.split('=');
      const key = keyRaw.toUpperCase();
      if (key === 'MODE') {
        this.currentMode = parseInt(value);
        this.updateModeDisplay();
      } else if (key === 'RUN') {
        this.currentRunMode = parseInt(value);
        this.updateRunModeDisplay();
      }
    });
  }

  parseCfgUpdate(data) {    
    const [key, value] = data.split(' ');
    // convert key to lowercase to match config keys
    if (key === 'mode') {
      this.currentMode = parseInt(value);
      this.updateModeDisplay();
    } else if (key === 'runmode') {
      this.currentRunMode = parseInt(value);
      this.updateRunModeDisplay();
    }    
  }

  parseValue(data) {
    // VAL <value>
    const value = data.split(' ')[1];
    this.terminal.print('Value: ' + value, 'info');
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
      ];

      for (const cfg of commands) {
        const command = `CFG ${cfg.key} ${cfg.value}\n`;
        await this.ble.send(command);
        this.terminal.print('Sent: ' + command.trim(), 'sent');
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
  new ClimbTimerApp();
});
