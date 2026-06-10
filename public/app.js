import { BLETransport, HTTPTransport } from './transports.js';
import { Terminal } from './terminal.js';

// ============================================================================
// Climb Timer Control App (G-Code Protocol)
// ============================================================================

export class ClimbTimerApp {
  constructor() {
    this.transport = null;
    this.terminal = null;
    this.currentMode = 0;
    this.currentRunMode = 0;

    this.config = {
      M: 0,   // Mode
      C: 60,  // Climb Time
      T: 15,  // Transition Time
      V: 100, // Volume
      Q: 0,   // Run Mode
      X: 0,   // Tenths
      Y: 0,   // Symbols
      B: 0,   // Beeper Style
      W: 0,   // Waveform
      K: 0,   // Maint Mode
      A: 0,   // Assigned Lane
      D: 1,   // Radio Mode
      theme: 0,
      console: false,
    };

    this.systemState = 0;
    this.displayState = 'idle';
    this.displayElapsedMs = 0;
    this.displayInterval = null;
    this.lineBuffer = '';
    this.timerTotal = 0;

    this.initializeUI();
  }

  getDefaultTransportType() {
    const hostname = window.location.hostname;
    const params = new URLSearchParams(window.location.search);

    if (params.get('transport') === 'http') return 'http';
    if (params.get('transport') === 'ble') return 'ble';

    // IP address detection (v4)
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (ipRegex.test(hostname) || hostname.endsWith('.local')) {
      return 'http';
    }

    // If we're not on a standard "web" domain, might be on-device
    const isStandardWeb = hostname === 'localhost' ||
                          hostname === '127.0.0.1' ||
                          hostname === '' ||
                          hostname.endsWith('.pages.dev') ||
                          hostname.endsWith('.github.io');

    return isStandardWeb ? 'ble' : 'http';
  }

  async checkServerHeader() {
    try {
      const resp = await fetch(window.location.href, { method: 'HEAD' });
      const server = resp.headers.get('Server');
      return !!(server && server.toLowerCase().includes('esp32'));
    } catch (e) {
      return false;
    }
  }

  initializeUI() {
    const terminalEl = document.getElementById('terminal');
    if (terminalEl) {
      this.terminal = new Terminal(terminalEl);
    }

    document.getElementById('connectBleBtn')?.addEventListener('click', () => this.connect('ble'));
    document.getElementById('connectHttpBtn')?.addEventListener('click', () => this.connect('http'));
    document.getElementById('disconnectBtn')?.addEventListener('click', () => this.disconnect());

    document.getElementById('btn-start')?.addEventListener('click', () => this.sendEvent(6));
    document.getElementById('btn-reset')?.addEventListener('click', () => this.sendEvent(9));
    document.getElementById('btn-abort')?.addEventListener('click', () => this.sendEvent(8));
    document.getElementById('btn-finish')?.addEventListener('click', () => this.sendEvent(7));

    document.getElementById('btn-winner-a')?.addEventListener('click', () => this.sendEvent(7, 'L1'));
    document.getElementById('btn-winner-b')?.addEventListener('click', () => this.sendEvent(7, 'L2'));
    document.getElementById('btn-fall-a')?.addEventListener('click', () => this.sendEvent(25, 'L1 S10'));
    document.getElementById('btn-fall-b')?.addEventListener('click', () => this.sendEvent(25, 'L2 S10'));

    document.getElementById('toggleConfig')?.addEventListener('click', () => this.toggleConfig());
    document.getElementById('closeConfig')?.addEventListener('click', () => this.closeConfig());
    document.getElementById('applyConfig')?.addEventListener('click', () => this.applyConfig());
    document.getElementById('resetConfig')?.addEventListener('click', () => this.resetConfig());

    document.getElementById('cfg-mode')?.addEventListener('change', (e) => {
      const mode = parseInt(e.target.value);
      this.sendConfig('M', mode);
      this.updateModeUI(mode);
    });

    document.getElementById('cfg-console')?.addEventListener('change', (e) => {
      this.config.console = e.target.checked;
      document.getElementById('terminalPanel')?.classList.toggle('hidden', !this.config.console);
    });

    document.getElementById('toggleTerminal')?.addEventListener('click', () => this.toggleTerminal());
    document.getElementById('closeTerminal')?.addEventListener('click', () => this.closeTerminal());
    document.getElementById('terminalClear')?.addEventListener('click', () => this.terminal?.clear());
    document.getElementById('terminalSave')?.addEventListener('click', () => this.terminal?.saveLogs());
    document.getElementById('terminalSend')?.addEventListener('click', () => this.sendTerminalCommand());
    document.getElementById('terminalInput')?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendTerminalCommand();
    });

    this.syncFormWithConfig();
    this.updateModeDisplay();
    this.updateRunModeDisplay();
    this.updateSymbolUI();
    this.updateTimerPreview();
    this.applyTheme();

    this.handleAutoConnect();
  }

  async handleAutoConnect() {
    const defaultType = this.getDefaultTransportType();
    if (defaultType === 'http') {
      const isESP = await this.checkServerHeader();
      if (isESP || window.location.hostname.endsWith('.local')) {
        this.connect('http');
      }
    }
  }

  async connect(type) {
    if (this.transport && this.transport.isConnected()) {
      await this.disconnect();
    }

    if (type === 'ble') {
      this.transport = new BLETransport();
    } else if (type === 'http') {
      this.transport = new HTTPTransport();
    }

    if (!this.transport) return;

    try {
      await this.transport.connect();
      this.terminal?.print('Connected to: ' + this.transport.getDeviceName(), 'success');

      this.transport.onReceive((data) => this.handleData(data));
      this.transport.onDisconnected(() => this.handleDisconnection());

      const indicator = document.getElementById('statusIndicator');
      if (indicator) indicator.className = 'status-dot connected';
      document.getElementById('statusText').textContent = 'Connected';
      document.getElementById('connectButtons').style.display = 'none';
      document.getElementById('deviceInfo').classList.remove('hidden');
      document.getElementById('deviceName').textContent = this.transport.getDeviceName();

      this.setControlsEnabled(true);
      document.getElementById('terminalInput').disabled = false;
      document.getElementById('terminalSend').disabled = false;

      this.sendTerminalCommand('G');
      this.sendTerminalCommand('S');
    } catch (error) {
      this.terminal?.print('Connection failed: ' + error.message, 'error');
    }
  }

  async disconnect() {
    await this.transport.disconnect();
  }

  handleDisconnection() {
    this.terminal?.print('Disconnected', 'info');
    const indicator = document.getElementById('statusIndicator');
    if (indicator) indicator.className = 'status-dot disconnected';
    document.getElementById('statusText').textContent = 'Disconnected';
    document.getElementById('connectButtons').style.display = 'flex';
    document.getElementById('deviceInfo').classList.add('hidden');
    this.setControlsEnabled(false);
  }

  handleData(data) {
    const chunk = this.lineBuffer + data;
    const lines = chunk.split(/\r?\n/);
    this.lineBuffer = lines.pop() || '';
    lines.forEach(line => this.handleLine(line.trim()));
  }

  handleLine(line) {
    if (!line) return;
    this.terminal?.print('Recv: ' + line, 'received');

    const cmd = line[0].toUpperCase();
    const body = line.substring(1).trim();

    switch (cmd) {
      case 'E': this.parseEvent(body); break;
      case 'C': this.parseConfig(body, 'C'); break;
      case 'G': this.parseConfig(body, 'G'); break;
      case 'S': this.parseStatus(body); break;
      case 'R':
      case '!':
        if (body === 'OK') this.terminal?.print('✓ ' + cmd + ' Success', 'success');
        break;
      default:
        this.terminal?.print('Unknown prefix: ' + cmd, 'info');
    }
  }

  parseEvent(data) {
    const parts = data.split(/\s+/);
    if (parts.length < 2) return;

    const code = parseInt(parts[0], 10);
    const ts = parts[1];
    const args = this.parseArgs(parts.slice(2), 'E');

    switch (code) {
      case 3: // RACE_START
        this.handleStateChange(0, 6); // RACING
        this.startDisplayTimer(0, 6);
        break;
      case 7: // RACE_FINISH
        this.handleStateChange(0, 7); // FINISHED
        break;
      case 8: // RACE_ABORT
        this.handleStateChange(0, 0); // IDLE
        break;
      case 9: // UI_RESET
        this.resetDisplayTimer();
        this.sendTerminalCommand('G');
        break;
      case 12: // DISP_SYNC_START M[state(8)|elapsed(24)]
        if (args.M !== undefined) {
          const val = parseInt(args.M, 16);
          const state = (val >> 24) & 0xFF;
          const elapsed = val & 0xFFFFFF;
          this.handleStateChange(0, state);
          this.startDisplayTimer(elapsed, state);
        }
        break;
      case 13: // DISP_SYNC_STOP M[state(8)|res(4)|elapsed(20)]
        if (args.M !== undefined) {
          const val = parseInt(args.M, 16);
          const state = (val >> 24) & 0xFF;
          const res = (val >> 20) & 0xF;
          const elapsed = val & 0xFFFFF;
          this.displayElapsedMs = elapsed;
          this.handleStateChange(0, state);
          this.finishDisplayTimer();
        }
        break;
      case 25: // STATE_CHANGE L<lane> S<state>
        this.handleStateChange(args.L || 0, args.S || 0);
        break;
    }
  }

  parseConfig(data, context) {
    const args = this.parseArgs(data.split(/\s+/), context);
    Object.keys(args).forEach(key => {
        if (this.config.hasOwnProperty(key)) {
            // For config, only M and A should potentially be hex if they ever appear there.
            // But based on doc, M (Mode) in config is ID (Decimal).
            // Let's stick to what parseArgs returns now.
            this.config[key] = args[key];
        }
    });

    if (args.M !== undefined) {
        this.currentMode = this.config.M;
        this.updateModeDisplay();
    }
    if (args.Q !== undefined) {
        this.currentRunMode = this.config.Q;
        this.updateRunModeDisplay();
    }

    this.syncFormWithConfig();
    this.updateTimerPreview();
    this.updateSymbolUI();
    this.updateTimerTextFromMs();
  }

  parseStatus(data) {
    const args = this.parseArgs(data.split(/\s+/), 'S');
    if (args.M !== undefined) {
        this.config.M = args.M;
        this.currentMode = this.config.M;
    }
    if (args.Q !== undefined) {
        this.config.Q = args.Q;
        this.currentRunMode = this.config.Q;
    }
    this.updateModeDisplay();
    this.updateRunModeDisplay();
    this.syncFormWithConfig();
  }

  parseArgs(parts, context) {
    const args = {};
    parts.forEach(p => {
        if (!p) return;
        const key = p[0].toUpperCase();
        const valStr = p.substring(1);

        if (context === 'E') {
            // Events: M (Metadata), A (Athlete), C (Color) are Hex.
            if (['M', 'A', 'C'].includes(key)) {
                args[key] = valStr; // Hex string
            } else {
                args[key] = parseInt(valStr, 10);
            }
        } else {
            // Config (C/G/S): All are Decimal, including M (Mode), C (Climb Time), etc.
            // EXCEPT if Athlete or Metadata were ever in config, but they aren't in the table.
            args[key] = parseInt(valStr, 10);
        }
    });
    return args;
  }

  static STATE_NAMES = [
    'IDLE', 'PRECONDITION', 'STARTER_WAIT', 'BEEPING', 'TRANSITION',
    'READY', 'RACING', 'FINISHED', 'FALSE_START', 'PAUSED', 'FALL', 'SPLASH'
  ];

  handleStateChange(lane, stateIdx) {
    this.systemState = stateIdx;
    const stateName = ClimbTimerApp.STATE_NAMES[stateIdx] || `ST(${stateIdx})`;
    this.terminal?.print(`State [L${lane}]: ${stateName}`, 'info');

    if ([3, 4, 6].includes(stateIdx)) {
      if (this.displayState !== 'running') {
        this.startDisplayTimer(0, stateIdx);
      } else {
        this.updateTimerTotal(stateIdx);
      }
    } else if ([7, 8, 10].includes(stateIdx)) {
      this.finishDisplayTimer();
    } else if ([0, 11].includes(stateIdx)) {
      this.resetDisplayTimer();
    } else if (stateIdx === 9) {
      this.pauseDisplayTimer();
    }
    this.updateTimerPreview();
  }

  updateTimerTotal(stateIdx) {
    if (stateIdx === 4) this.timerTotal = this.config.T * 1000;
    else if (stateIdx === 6) this.timerTotal = this.config.C * 1000;
    else if (stateIdx === 3) this.timerTotal = 5000;
  }

  startDisplayTimer(elapsed = 0, stateIdx = null) {
    this.clearDisplayInterval();
    this.displayElapsedMs = elapsed;
    this.displayState = 'running';
    if (stateIdx !== null) this.systemState = stateIdx;
    this.updateTimerTotal(this.systemState);

    this.updateTimerTextFromMs();
    this.displayInterval = setInterval(() => {
      this.displayElapsedMs += 100;
      this.updateTimerTextFromMs();
    }, 100);
  }

  pauseDisplayTimer() {
    this.clearDisplayInterval();
    this.displayState = 'paused';
  }

  finishDisplayTimer() {
    this.clearDisplayInterval();
    this.displayState = 'finished';
    this.updateTimerTextFromMs();
  }

  resetDisplayTimer() {
    this.clearDisplayInterval();
    this.displayState = 'idle';
    this.displayElapsedMs = 0;
    this.updateTimerTextFromMs();
  }

  clearDisplayInterval() {
    if (this.displayInterval) clearInterval(this.displayInterval);
    this.displayInterval = null;
  }

  updateTimerTextFromMs() {
    const el = document.getElementById('timerValue');
    if (!el) return;

    let ms = this.displayElapsedMs;
    if (this.currentMode === 1 || this.currentMode === 2) {
      ms = Math.max(0, this.timerTotal - this.displayElapsedMs);
    }

    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    const tenths = Math.floor((ms % 1000) / 100);

    if (this.config.X) {
      el.textContent = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}.${tenths}`;
    } else {
      el.textContent = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    }
  }

  syncFormWithConfig() {
    const mapping = {
        'cfg-climb': 'C',
        'cfg-trans': 'T',
        'cfg-mode': 'M',
        'cfg-runmode': 'Q',
        'cfg-vol': 'V',
        'cfg-symbols': 'Y',
        'cfg-tenths': 'X',
        'cfg-maintenance': 'K',
        'cfg-assigned-lane': 'A',
        'cfg-beep-style': 'B',
        'cfg-waveform': 'W'
    };

    Object.keys(mapping).forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        const val = this.config[mapping[id]];
        if (el.type === 'checkbox') el.checked = !!val;
        else el.value = val;
    });

    const volDisp = document.getElementById('volDisplay');
    if (volDisp) volDisp.textContent = this.config.V;
    this.updateModeUI(this.config.M);
  }

  async applyConfig() {
    const updates = [];
    const mapping = {
        'C': 'cfg-climb', 'T': 'cfg-trans', 'M': 'cfg-mode', 'Q': 'cfg-runmode',
        'V': 'cfg-vol', 'Y': 'cfg-symbols', 'X': 'cfg-tenths', 'K': 'cfg-maintenance',
        'A': 'cfg-assigned-lane', 'B': 'cfg-beep-style', 'W': 'cfg-waveform'
    };

    Object.keys(mapping).forEach(key => {
        const el = document.getElementById(mapping[key]);
        if (!el) return;
        const val = el.type === 'checkbox' ? (el.checked ? 1 : 0) : parseInt(el.value, 10);
        if (val !== this.config[key]) {
            updates.push(`${key}${val}`);
        }
    });

    if (updates.length > 0) {
        await this.sendTerminalCommand(`C ${updates.join(' ')}`);
    }

    const themeEl = document.getElementById('cfg-theme');
    if (themeEl) {
        this.config.theme = parseInt(themeEl.value, 10);
        this.applyTheme();
    }
    this.closeConfig();
  }

  resetConfig() {
    this.syncFormWithConfig();
  }

  async sendEvent(code, args = '') {
    const cmd = `E${code} 0 ${args}`.trim();
    await this.sendTerminalCommand(cmd);
  }

  async sendConfig(key, val) {
    await this.sendTerminalCommand(`C ${key}${val}`);
  }

  async sendTerminalCommand(cmd = null) {
    const input = cmd || document.getElementById('terminalInput').value.trim();
    if (!input) return;

    try {
      await this.transport.send(input);
      this.terminal?.print('Sent: ' + input, 'sent');
      if (!cmd) {
        const inputEl = document.getElementById('terminalInput');
        if (inputEl) inputEl.value = '';
      }
    } catch (error) {
      this.terminal?.print('Error: ' + error.message, 'error');
    }
  }

  updateModeUI(mode) {
    const runModeCfg = document.getElementById('runModeConfig');
    if (runModeCfg) runModeCfg.classList.toggle('hidden', mode === 0);
    this.updateModeDisplay();
  }

  updateModeDisplay() {
    const modes = ['IFSC SPEED', 'BOULDER', 'LEAD', 'CLOCK'];
    const modeDisp = document.getElementById('modeDisplay');
    if (modeDisp) modeDisp.textContent = modes[this.currentMode] || '--';

    document.body.className = `mode-${['speed', 'boulder', 'lead', 'clock'][this.currentMode]}`;

    document.querySelectorAll('.mode-speed-only').forEach(el => el.classList.toggle('hidden', this.currentMode !== 0));
    document.querySelectorAll('.mode-boulder-only').forEach(el => el.classList.toggle('hidden', this.currentMode !== 1));

    this.updateSymbolUI();
  }

  updateRunModeDisplay() {
    const runModes = ['AUTO-LOOP', 'REFEREE'];
    const runModeDisp = document.getElementById('runModeDisplay');
    if (runModeDisp) runModeDisp.textContent = runModes[this.currentRunMode] || '--';
  }

  updateSymbolUI() {
    const prefix = this.config.Y ? '▶ ' : '';
    const startLabel = this.currentMode === 1 ? 'PLAY / PAUSE' : 'START';
    const startBtn = document.getElementById('btn-start');
    if (startBtn) startBtn.textContent = `${prefix}${startLabel}`;
    const resetBtn = document.getElementById('btn-reset');
    if (resetBtn) resetBtn.textContent = `${this.config.Y ? '⟲ ' : ''}RESET`;
  }

  updateTimerPreview() {
    const transPrev = document.getElementById('transPreview');
    if (transPrev) transPrev.textContent = `${this.config.T}s`;
    const climbPrev = document.getElementById('climbPreview');
    if (climbPrev) climbPrev.textContent = `${this.config.C}s`;
    const statePrev = document.getElementById('statePreview');
    if (statePrev) statePrev.textContent = this.getDisplayStateLabel();

    const toneStyles = ['PRAGUE', 'INNSB', 'JAPAN'];
    const tonePrev = document.getElementById('tonePreview');
    if (tonePrev) tonePrev.textContent = toneStyles[this.config.B] || '--';
    const wavePrev = document.getElementById('wavePreview');
    if (wavePrev) wavePrev.textContent = this.config.W ? 'SQUARE' : 'SINE';

    const uiParts = [];
    if (this.config.Y) uiParts.push('SYM');
    if (this.config.X) uiParts.push('10ths');
    const uiPrev = document.getElementById('uiPreview');
    if (uiPrev) uiPrev.textContent = uiParts.join('+') || 'STD';
  }

  getDisplayStateLabel() {
    if (this.displayState === 'idle') return 'IDLE';
    return ClimbTimerApp.STATE_NAMES[this.systemState] || '---';
  }

  applyTheme() {
    const root = document.documentElement;
    if (this.config.theme === 0) {
      root.style.setProperty('--bg', '#0f172a');
      root.style.setProperty('--card', '#1e293b');
      root.style.setProperty('--text', '#f8fafc');
      root.style.setProperty('--accent', '#38bdf8');
    } else {
      root.style.setProperty('--bg', '#1a1a1a');
      root.style.setProperty('--card', '#2d2d2d');
      root.style.setProperty('--text', '#ffffff');
      root.style.setProperty('--accent', '#ff6b35');
    }
  }

  toggleConfig() { document.getElementById('configPanel')?.classList.toggle('hidden'); }
  closeConfig() { document.getElementById('configPanel')?.classList.add('hidden'); }
  toggleTerminal() { document.getElementById('terminalPanel')?.classList.toggle('hidden'); }
  closeTerminal() { document.getElementById('terminalPanel')?.classList.add('hidden'); }

  setControlsEnabled(enabled) {
    const ids = ['btn-start', 'btn-reset', 'btn-abort', 'btn-finish', 'btn-winner-a', 'btn-winner-b', 'btn-fall-a', 'btn-fall-b'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.disabled = !enabled;
    });
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    window.app = new ClimbTimerApp();
  });
}
