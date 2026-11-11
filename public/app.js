import { BLETransport, HTTPTransport, WebSocketTransport } from './transports.js';
import { Terminal } from './terminal.js';

// ============================================================================
// Climb Timer Control App (G-Code Protocol)
// ============================================================================

export const TRANSLATIONS = {
  en: {
    app_title: "T2Climb Timer Control",
    disconnected: "Disconnected",
    connected: "Connected",
    connect_ble: "Connect via Bluetooth",
    connect_wifi: "Connect via WiFi",
    disconnect: "Disconnect",
    label_mode: "Mode",
    label_loop: "Loop",
    chip_trans: "TRANS",
    chip_climb: "CLIMB",
    chip_state: "STATE",
    chip_beeps: "BEEPS",
    chip_wave: "WAVE",
    chip_ui: "UI",
    btn_start: "START",
    btn_play: "PLAY",
    btn_pause: "PAUSE",
    btn_resume: "RESUME",
    btn_play_pause: "PLAY / PAUSE",
    btn_reset: "RESET",
    btn_abort: "ABORT",
    btn_finish: "FINISH",
    judging_override: "Judging Override",
    winner_a: "WINNER A",
    winner_b: "WINNER B",
    fall_a: "FALL A",
    fall_b: "FALL B",
    btn_configuration: "⚙️ Configuration",
    btn_debug_terminal: "🔧 Debug Terminal",
    cfg_title: "Configuration",
    cfg_climb_settings: "Climb Settings",
    label_climb_mode: "Climb Mode",
    mode_speed: "IFSC Speed",
    mode_boulder: "Boulder",
    mode_lead: "Lead",
    mode_clock: "Clock",
    mode_circuit: "Circuit",
    label_autoloop: "Enable Auto-Loop",
    label_climb_duration: "Climb Duration (seconds)",
    label_trans_duration: "Transition Duration (seconds)",
    label_prep_duration: "Initial Warning / Prep Duration (seconds)",
    cfg_circuit_steps: "📋 Circuit Training Steps",
    th_step: "#",
    th_climb_time: "Climb Time (s)",
    th_rest_time: "Rest Time (s)",
    th_action: "Action",
    btn_add_step: "➕ Add Step",
    btn_reset_defaults: "🔄 Reset Defaults",
    label_raw_seq: "Raw Sequence:",
    cfg_audio_display: "Audio & Display",
    label_countdown_beeps: "Countdown Beeps",
    label_audio_waveform: "Audio Waveform",
    wave_sine: "Warm Sine (Smooth)",
    wave_square: "Sharp Square (Aggressive)",
    label_audio_volume: "Audio Volume",
    cfg_ui_lanes: "UI & Lanes",
    label_use_symbols: "Use Symbols",
    label_idle_visuals: "Enable Idle Visuals",
    cfg_idle_appearance: "Idle Appearance",
    label_idle_text_color: "Timer text color",
    label_idle_bar_color: "Phase bar color",
    label_idle_led_color: "LED color",
    label_idle_led_effect: "LED effect",
    effect_off: "Off",
    effect_solid: "Solid",
    effect_flash: "Flash",
    effect_pulse: "Pulse",
    effect_rainbow: "Rainbow",
    effect_wave: "Wave",
    label_show_tenths: "Show Tenths",
    label_console_output: "Console Output",
    label_maint_mode: "Maintenance Mode",
    label_ui_theme: "UI Theme",
    theme_dark: "Pro Dark (High Contrast)",
    theme_ifsc: "IFSC Official Colors",
    label_active_lanes: "Active Lanes",
    lane_a: "Lane A",
    lane_b: "Lane B",
    label_unit_assigned_lane: "Unit Assigned Lane",
    lane_global: "Global (Both)",
    lane_left: "Lane A (Left)",
    lane_right: "Lane B (Right)",
    cfg_system_timezone: "System & Timezone",
    label_radio_mode: "Radio Mode (Communication)",
    radio_wifi: "Wi-Fi Mode",
    radio_ble: "Bluetooth Mode (BLE)",
    label_tz_presets: "Timezone Presets",
    tz_custom: "Custom POSIX String...",
    label_posix_tz: "POSIX Timezone String",
    btn_set_tz: "Set Timezone",
    label_device_rtc: "Device Real-Time Clock (RTC)",
    btn_sync_time: "🕒 Sync System Time with Browser",
    step_prefix: "Step",
    btn_remove: "🗑️ Remove",
    manual_title: "User Manual",
    loop_on: "LOOP ON",
    loop_off: "OFF"
  },
  fi: {
    app_title: "T2Climb Ajastin",
    disconnected: "Ei yhteyttä",
    connected: "Yhdistetty",
    connect_ble: "Yhdistä Bluetoothilla",
    connect_wifi: "Yhdistä Wi-Fiin",
    disconnect: "Katkaise yhteys",
    label_mode: "Laji",
    label_loop: "Kierto",
    chip_trans: "LEPO",
    chip_climb: "KIIPEILY",
    chip_state: "TILA",
    chip_beeps: "ÄÄNET",
    chip_wave: "AALTO",
    chip_ui: "NÄYTTÖ",
    btn_start: "START",
    btn_play: "TOISTA",
    btn_pause: "TAUKO",
    btn_resume: "JATKA",
    btn_play_pause: "TOISTA / TAUKO",
    btn_reset: "NOLLAA",
    btn_abort: "KESKEYTÄ",
    btn_finish: "VALMIS",
    judging_override: "Tuomarin toiminnot",
    winner_a: "VOITTAJA A",
    winner_b: "VOITTAJA B",
    fall_a: "PUTOAMINEN A",
    fall_b: "PUTOAMINEN B",
    btn_configuration: "⚙️ Asetukset",
    btn_debug_terminal: "🔧 Pääte",
    cfg_title: "Asetukset",
    cfg_climb_settings: "Kiipeilyasetukset",
    label_climb_mode: "Kiipeilylaji",
    mode_speed: "Nopeuskiipeily",
    mode_boulder: "Boulder",
    mode_lead: "Lead",
    mode_clock: "Kello",
    mode_circuit: "Intervallit",
    label_autoloop: "Jatkuva kierto (Auto-Loop)",
    label_climb_duration: "Kiipeilyaika (sekuntia)",
    label_trans_duration: "Lepo- / siirtymäaika (sekuntia)",
    label_prep_duration: "Valmistautumisaika (sekuntia)",
    cfg_circuit_steps: "📋 Intervallivaiheet",
    th_step: "#",
    th_climb_time: "Kiipeilyaika (s)",
    th_rest_time: "Lepoaika (s)",
    th_action: "Toiminto",
    btn_add_step: "➕ Lisää vaihe",
    btn_reset_defaults: "🔄 Palauta oletukset",
    label_raw_seq: "Sarjakoodi:",
    cfg_audio_display: "Äänet ja näyttö",
    label_countdown_beeps: "Varoituspiippaukset",
    label_audio_waveform: "Äänen aaltomuoto",
    wave_sine: "Pehmeä sini (Warm Sine)",
    wave_square: "Terävä kantti (Sharp Square)",
    label_audio_volume: "Äänenvoimakkuus",
    cfg_ui_lanes: "Käyttöliittymä ja radat",
    label_use_symbols: "Käytä symboleita",
    label_idle_visuals: "Ota lepotilan visuaalit käyttöön",
    cfg_idle_appearance: "Lepotilan ulkoasu",
    label_idle_text_color: "Ajastimen tekstin väri",
    label_idle_bar_color: "Vaihepalkin väri",
    label_idle_led_color: "LEDien väri",
    label_idle_led_effect: "LED-efekti",
    effect_off: "Pois",
    effect_solid: "Tasainen",
    effect_flash: "Vilkkuva",
    effect_pulse: "Sykkivä",
    effect_rainbow: "Sateenkaari",
    effect_wave: "Aalto",
    label_show_tenths: "Näytä kymmenykset",
    label_console_output: "Konsoliulostulo",
    label_maint_mode: "Huoltotila",
    label_ui_theme: "Väriteema",
    theme_dark: "Tumma (Pro Dark)",
    theme_ifsc: "IFSC-viralliset värit",
    label_active_lanes: "Aktiiviset radat",
    lane_a: "Rata A",
    lane_b: "Rata B",
    label_unit_assigned_lane: "Ohjaimen rata",
    lane_global: "Molemmat (Global)",
    lane_left: "Rata A (Vasen)",
    lane_right: "Rata B (Oikea)",
    cfg_system_timezone: "Järjestelmä ja aikavyöhyke",
    label_radio_mode: "Yhteystila",
    radio_wifi: "Wi-Fi-tila",
    radio_ble: "Bluetooth-tila (BLE)",
    label_tz_presets: "Aikavyöhykkeet",
    tz_custom: "Oma POSIX-merkkijono...",
    label_posix_tz: "POSIX-aikavyöhyke",
    btn_set_tz: "Aseta aikavyöhyke",
    label_device_rtc: "Laitteen reaaliaikakello (RTC)",
    btn_sync_time: "🕒 Synkronoi aika selaimesta",
    step_prefix: "Vaihe",
    btn_remove: "🗑️ Poista",
    manual_title: "Käyttöohje",
    loop_on: "KIERTO PÄÄLLÄ",
    loop_off: "POIS"
  }
};

export const DISCIPLINE_BUTTON_MAP = {
  // 0: IFSC Speed
  0: {
    start: { labelKey: 'btn_start', icon: '▶ ', event: 6 },
    reset: { labelKey: 'btn_reset', icon: '⟲ ', event: 9 },
    abort: { labelKey: 'btn_abort', icon: '⏹ ', event: 8, visible: true },
    finish: { visible: false },
    judging: { visible: true },
  },
  // 1: Boulder
  1: {
    start: { labelKey: 'btn_play_pause', icon: '▶ ', event: 6, stateAware: true },
    reset: { labelKey: 'btn_reset', icon: '⟲ ', event: 9 },
    abort: { visible: false },
    finish: { labelKey: 'btn_finish', icon: '🏁 ', event: 7, visible: true },
    judging: { visible: false },
  },
  // 2: Lead
  2: {
    start: { labelKey: 'btn_start', icon: '▶ ', event: 6 },
    reset: { labelKey: 'btn_reset', icon: '⟲ ', event: 9 },
    abort: { visible: false },
    finish: { labelKey: 'btn_finish', icon: '🏁 ', event: 7, visible: true },
    judging: { visible: false },
  },
  // 3: Clock
  3: {
    start: { labelKey: 'btn_start', icon: '▶ ', event: 6, stateAware: true },
    reset: { labelKey: 'btn_reset', icon: '⟲ ', event: 9 },
    abort: { visible: false },
    finish: { visible: false },
    judging: { visible: false },
  },
  // 4: Circuit / Intervals
  4: {
    start: { labelKey: 'btn_play_pause', icon: '▶ ', event: 6, stateAware: true },
    reset: { labelKey: 'btn_reset', icon: '⟲ ', event: 9 },
    abort: { visible: false },
    finish: { visible: false },
    judging: { visible: false },
  },
};

export class ClimbTimerApp {
  constructor() {
    this.transport = null;
    this.terminal = null;
    this.currentMode = 0;
    this.currentRunMode = 0;
    this.locale = this.detectLocale();

    this.config = {
      M: 0,   // Mode
      C: 60,  // Climb Time
      T: 15,  // Transition Time
      N: 15,  // Initial Warning / Prep Time
      V: 100, // Volume
      Q: 0,   // Run Mode
      X: 0,   // Tenths
      Y: 0,   // Symbols
      Z: 0,   // Idle visuals
      B: 1,   // Countdown Beeps (0: Off, 1: On)
      W: 0,   // Waveform
      K: 0,   // Maint Mode
      A: 0,   // Assigned Lane
      H: 1,   // Lane A Enable
      J: 1,   // Lane B Enable
      D: 1,   // Radio Mode
      tz: "EET-2EEST,M3.5.0/3,M10.5.0/4",
      circ_seq: "30/15,30/15",
      theme: 0,
      console: false,
    };
    this.idlePalette = null;

    this.systemState = 0;
    this.displayState = 'idle';
    this.pausedInTransition = false;
    this.displayElapsedMs = 0;
    this.displayInterval = null;
    this.lastTick = 0;
    this.lineBuffer = '';
    this.timerTotal = 0;

    this.initializeUI();
  }

  detectLocale() {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('t2climb_lang');
      if (saved && (saved === 'fi' || saved === 'en')) return saved;
    }
    if (typeof navigator !== 'undefined' && navigator.language) {
      if (navigator.language.toLowerCase().startsWith('fi')) return 'fi';
    }
    return 'en';
  }

  setLocale(lang) {
    if (lang !== 'en' && lang !== 'fi') return;
    this.locale = lang;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('t2climb_lang', lang);
    }
    this.applyLocale();
  }

  t(key) {
    const dict = TRANSLATIONS[this.locale] || TRANSLATIONS.en;
    return dict[key] || TRANSLATIONS.en[key] || key;
  }

  applyLocale() {
    // 1. Update text nodes with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = this.t(key);
      if (val) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = val;
        } else {
          el.textContent = val;
        }
      }
    });

    // 2. Update language switcher buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === this.locale);
    });

    // 3. Update User Manual link target
    const manualLink = document.getElementById('userManualLink');
    if (manualLink) {
      manualLink.href = this.locale === 'fi' ? './docs/fi/' : './docs/';
      manualLink.title = this.t('manual_title');
      manualLink.setAttribute('aria-label', this.t('manual_title'));
    }

    // 4. Update status and mode text
    const statusTextEl = document.getElementById('statusText');
    if (statusTextEl) {
      const isConn = this.transport && this.transport.isConnected();
      statusTextEl.textContent = isConn ? this.t('connected') : this.t('disconnected');
    }

    this.updateModeDisplay();
    this.updateRunModeDisplay();
    this.updateSymbolUI();
    this.renderCircuitStepsTable();
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

    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const lang = e.target.getAttribute('data-lang');
        this.setLocale(lang);
      });
    });

    document.getElementById('connectBleBtn')?.addEventListener('click', () => this.connect('ble'));
    document.getElementById('connectHttpBtn')?.addEventListener('click', () => this.connect('http'));
    document.getElementById('disconnectBtn')?.addEventListener('click', () => this.disconnect());

    document.getElementById('btn-start')?.addEventListener('click', () => this.sendEvent(6));
    document.getElementById('btn-reset')?.addEventListener('click', () => this.sendEvent(9));
    document.getElementById('btn-abort')?.addEventListener('click', () => this.sendEvent(8));
    document.getElementById('btn-finish')?.addEventListener('click', () => this.sendEvent(7));

    document.getElementById('btn-winner-a')?.addEventListener('click', () => this.sendEvent(29));
    document.getElementById('btn-winner-b')?.addEventListener('click', () => this.sendEvent(30));
    document.getElementById('btn-fall-a')?.addEventListener('click', () => this.sendEvent(25, 'L1 S10'));
    document.getElementById('btn-fall-b')?.addEventListener('click', () => this.sendEvent(25, 'L2 S10'));

    document.getElementById('toggleConfig')?.addEventListener('click', () => this.toggleConfig());
    document.getElementById('closeConfig')?.addEventListener('click', () => this.closeConfig());
    document.getElementById('cfg-theme')?.addEventListener('change', (e) => {
      const val = parseInt(e.target.value, 10);
      this.config.theme = val;
      this.config.U = val;
      this.sendConfig('U', val);
      this.applyTheme();
      this.loadIdlePalette();
    });

    document.getElementById('idleVisualControls')?.addEventListener('change', (e) => {
      const input = e.target.closest('[data-idle-field]');
      if (!input || !this.idlePalette) return;
      const field = input.dataset.idleField;
      this.idlePalette[field] = field === 'effect'
        ? parseInt(input.value, 10)
        : this.hexToRgb565(input.value);
      this.saveIdlePalette();
    });

    const immediateConfigs = {
      'cfg-climb': 'C',
      'cfg-trans': 'T',
      'cfg-init-trans': 'N',
      'cfg-vol': 'V',
      'cfg-symbols': 'Y',
      'cfg-idle-visuals': 'Z',
      'cfg-tenths': 'X',
      'cfg-maintenance': 'K',
      'cfg-assigned-lane': 'A',
      'cfg-countdown': 'B',
      'cfg-lane-a': 'H',
      'cfg-lane-b': 'J',
      'cfg-waveform': 'W'
    };

    Object.keys(immediateConfigs).forEach(id => {
      document.getElementById(id)?.addEventListener('change', (e) => {
        const key = immediateConfigs[id];
        const val = e.target.type === 'checkbox' ? (e.target.checked ? 1 : 0) : parseInt(e.target.value, 10);
        this.config[key] = val;
        this.sendConfig(key, val);
        if (id === 'cfg-vol') {
           const volDisp = document.getElementById('volDisplay');
           if (volDisp) volDisp.textContent = val;
        }
        this.updateTimerPreview();
        this.renderFlowVisualizer();
      });
    });

    document.getElementById('cfg-autoloop')?.addEventListener('change', (e) => {
      const val = e.target.checked ? 1 : 0;
      this.config.Q = val;
      this.currentRunMode = val;
      this.sendConfig('Q', val);
      this.updateRunModeDisplay();
      this.renderFlowVisualizer();
    });

    document.getElementById('btnAddStep')?.addEventListener('click', () => this.addCircuitStep());
    document.getElementById('btnResetSteps')?.addEventListener('click', () => this.resetCircuitSteps());

    document.getElementById('cfg-mode')?.addEventListener('change', (e) => {
      const mode = parseInt(e.target.value);
      this.config.M = mode;
      this.sendConfig('M', mode);
      this.updateModeUI(mode);
    });

    document.getElementById('cfg-radio-mode')?.addEventListener('change', (e) => {
      const modeStr = e.target.value;
      const rdoVal = modeStr === 'BLE' ? '1' : '0';
      this.sendTerminalCommand(`RDO ${rdoVal}`);
    });

    document.getElementById('cfg-tz-preset')?.addEventListener('change', (e) => {
      const val = e.target.value;
      const customInput = document.getElementById('cfg-tz-custom');
      if (val !== 'custom') {
        if (customInput) customInput.value = val;
        this.config.tz = val;
        this.sendTerminalCommand(`TZ ${val}`);
      }
    });

    document.getElementById('btn-sync-time')?.addEventListener('click', () => {
      this.syncDeviceTime();
    });

    document.getElementById('btn-set-tz')?.addEventListener('click', () => {
      const val = document.getElementById('cfg-tz-custom')?.value.trim();
      if (val) {
        this.config.tz = val;
        this.sendTerminalCommand(`TZ ${val}`);
      }
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
    this.applyLocale();

    this.handleAutoConnect();
  }

  async handleAutoConnect() {
    const defaultType = this.getDefaultTransportType();
    if (defaultType === 'http') {
      this.connect('http');
    }
  }

  async connect(type) {
    if (this.transport && this.transport.isConnected()) {
      await this.disconnect();
    }

    if (type === 'ble') {
      this.transport = new BLETransport();
    } else if (type === 'http') {
      // Try WebSocket first, fallback to HTTP+SSE if it fails
      this.transport = new WebSocketTransport();
    }

    if (!this.transport) return;

    try {
      try {
        await this.transport.connect();
      } catch (e) {
        if (type === 'http' && this.transport instanceof WebSocketTransport) {
          this.terminal?.print('WebSocket failed, falling back to HTTP+SSE...', 'info');
          this.transport = new HTTPTransport();
          await this.transport.connect();
        } else {
          throw e;
        }
      }

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
      this.sendTerminalCommand('CS');
      this.sendTerminalCommand('TME');
      this.sendTerminalCommand('RDO');
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
    this.transport = null;
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

    if (line.startsWith('COLOR ')) {
      const values = line.split(/\s+/).slice(1).map(Number);
      if (values.length === 6 && values.every(Number.isFinite)) {
        const [theme, code, text, bar, led, effect] = values;
        if (theme === Number(this.config.theme) && code === 7) {
          this.idlePalette = { text, bar, led, effect };
          this.renderIdlePalette();
        }
      }
      return;
    }

    if (line.startsWith('circ_seq') || line.startsWith('OK circ_seq')) {
      const seq = line.replace(/^(OK\s+)?circ_seq\s*/, '').trim();
      if (seq) {
        this.config.circ_seq = seq;
        this.circuitSteps = this.parseCircSeqStr(seq);
        this.circuitStepsCount = this.circuitSteps.length;
        this.renderCircuitStepsTable();
        this.renderFlowVisualizer();
      }
      return;
    }

    if (line.startsWith('CS ') || line.startsWith('OK CS ')) {
      const body = line.replace(/^(OK\s+)?CS\s*/, '').trim();
      const parts = body.split(/\s+/);
      if (parts.length === 1) {
        const count = parseInt(parts[0], 10);
        if (!isNaN(count)) {
          this.circuitStepsCount = count;
          this.circuitSteps = new Array(count);
          if (count === 0) {
            this.config.circ_seq = '';
            this.renderCircuitStepsTable();
            this.renderFlowVisualizer();
          } else {
            for (let i = 0; i < count; i++) {
              this.sendTerminalCommand(`CS ${i}`);
            }
          }
        }
      } else if (parts.length >= 3) {
        const idx = parseInt(parts[0], 10);
        const climb = parseInt(parts[1], 10);
        const rest = parseInt(parts[2], 10);

        if (!isNaN(idx) && !isNaN(climb) && !isNaN(rest)) {
          if (!this.circuitSteps) this.circuitSteps = [];
          if (climb === 0 && rest === 0) {
            this.circuitStepsCount = idx;
            this.circuitSteps.length = idx;
          } else {
            if (idx >= this.circuitStepsCount) {
              this.circuitStepsCount = idx + 1;
              this.circuitSteps.length = this.circuitStepsCount;
            }
            this.circuitSteps[idx] = { climb, rest };
          }
            if (this.circuitSteps.length === this.circuitStepsCount &&
              this.circuitSteps.every((step, index) => index in this.circuitSteps && step !== undefined)) {
            this.config.circ_seq = this.buildCircSeqStr(this.circuitSteps);
            this.renderCircuitStepsTable();
            this.renderFlowVisualizer();
          }
        }
      }
      return;
    }

    if (line.startsWith('TME ') || line.startsWith('OK TME ')) {
      const timeVal = line.replace(/^(OK\s+)?TME\s*/, '').trim();
      this.terminal?.print(`Device Time: ${timeVal}`, 'info');
      return;
    }

    if (line.startsWith('TZ ') || line.startsWith('OK TZ ')) {
      const tzVal = line.replace(/^(OK\s+)?TZ\s*/, '').trim();
      if (tzVal) {
        this.config.tz = tzVal;
        const customInput = document.getElementById('cfg-tz-custom');
        if (customInput) customInput.value = tzVal;
        const presetSelect = document.getElementById('cfg-tz-preset');
        if (presetSelect) {
          const matchOpt = Array.from(presetSelect.options).find(o => o.value === tzVal);
          presetSelect.value = matchOpt ? tzVal : 'custom';
        }
      }
      return;
    }

    if (line.startsWith('RDO ') || line.startsWith('OK RDO ') || line.startsWith('RADIO ') || line.startsWith('OK RADIO ')) {
      const radioVal = line.replace(/^(OK\s+)?(RDO|RADIO)\s*/, '').replace(/—.*/, '').trim();
      const radioSelect = document.getElementById('cfg-radio-mode');
      if (radioSelect) {
        radioSelect.value = (radioVal === '1' || radioVal === 'BLE') ? 'BLE' : 'WIFI';
      }
      return;
    }

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
    if (parts.length < 1) return;

    const code = parseInt(parts[0], 10);
    // New protocol has no timestamp. Skip if it looks like a legacy hex timestamp.
    let argIndex = 1;
    if (parts.length > 2 && /^[0-9a-fA-F]+$/.test(parts[1]) && /^[A-Z]/.test(parts[2])) {
      argIndex = 2;
    }
    const args = this.parseArgs(parts.slice(argIndex), 'E');

    switch (code) {
      case 3: // RACE_START
        this.handleStateChange(0, 6); // RACING
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
      case 12: // DISP_SYNC_START S<state> E<elapsed>
        if (args.S !== undefined) {
          const state = args.S;
          const elapsed = args.E || 0;
          // Standardize behavior for sync start: set flags then let handleStateChange start timer
          if (state === 4) this.pausedInTransition = false;
          this.displayElapsedMs = elapsed;
          this.handleStateChange(0, state);
        } else if (args.M !== undefined) { // Legacy fallback
          const val = args.M; // Already parsed as decimal now, but legacy was hex.
          // If it was hex, this might fail, but user wants decimal anyway.
          const state = val & 0xFF;
          const elapsed = (val >> 8) & 0xFFFFFF;
          this.displayElapsedMs = elapsed;
          this.handleStateChange(0, state);
        }
        break;
      case 13: // DISP_SYNC_STOP S<state> R<result> E<elapsed>
        if (args.S !== undefined) {
          const state = args.S;
          const res = args.R || 0;
          const elapsed = args.E || 0;
          if (state === 9) this.pausedInTransition = !!(res & 0x08);
          this.displayElapsedMs = elapsed;
          this.handleStateChange(0, state);
        } else if (args.M !== undefined) { // Legacy fallback
          const val = args.M;
          const state = val & 0xFF;
          const res = (val >> 8) & 0x0F;
          const elapsed = (val >> 12) & 0xFFFFF;
          if (state === 9) this.pausedInTransition = !!(res & 0x08);
          this.displayElapsedMs = elapsed;
          this.handleStateChange(0, state);
        }
        break;
      case 25: // STATE_CHANGE L<lane> S<state>
        this.handleStateChange(args.L || 0, args.S || 0);
        break;
      case 26: // CONFIG_UPDATED K<type> V<value>
        this.handleConfigUpdate(args.K, args.V);
        break;
      case 15: // DISPLAY_SYNC_MODE M[mode]
        if (args.M !== undefined) {
          const mode = args.M;
          this.config.M = mode;
          this.currentMode = mode;
          this.updateModeUI(mode);
        }
        break;
    }
  }

  handleConfigUpdate(type, val) {
    const mapping = {
      1: 'C', // CFG_TYPE_CLIMB_MS
      2: 'T', // CFG_TYPE_TRANS_MS
      3: 'B', // CFG_TYPE_COUNTDOWN_BEEPS
      4: 'Q', // CFG_TYPE_RUN_MODE
      5: 'X', // CFG_TYPE_SHOW_TENTHS
      6: 'Y', // CFG_TYPE_USE_SYMBOLS
      7: 'theme', // CFG_TYPE_UI_THEME (U)
      8: 'W', // CFG_TYPE_AUDIO_SQUARE
      9: 'V', // CFG_TYPE_AUDIO_VOL
      10: 'H', // CFG_TYPE_LANE_A_EN
      11: 'J', // CFG_TYPE_LANE_B_EN
      12: 'K', // CFG_TYPE_MAINT_EN
      13: 'A', // CFG_TYPE_LANE_ASSIGN
      18: 'N', // CFG_TYPE_INIT_TRANS_MS
      19: 'M', // CFG_TYPE_CLIMB_MODE
      22: 'Z'  // CFG_TYPE_IDLE_VISUALS
    };

    const key = mapping[type];
    if (key) {
      let finalVal = val;
      if (key === 'C' || key === 'T' || key === 'N') finalVal = Math.floor(val / 1000);
      this.config[key] = finalVal;
      if (key === 'Q') this.currentRunMode = finalVal;
      if (key === 'M') this.updateModeUI(finalVal);
      if (key === 'theme') {
        this.config.U = finalVal;
        this.applyTheme();
      }

      this.syncFormWithConfig();
      this.updateTimerPreview();
      this.updateSymbolUI();
      this.renderFlowVisualizer();

      if (key === 'C' || key === 'T' || key === 'N') {
        this.updateTimerTotal(this.systemState);
        this.updateTimerTextFromMs();
      }
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

    if (args.U !== undefined) {
        this.config.theme = args.U;
        this.config.U = args.U;
        this.applyTheme();
    }
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
    if (context === 'G' || args.U !== undefined) this.loadIdlePalette();
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

        // All values are now Decimal in the unified protocol
        args[key] = parseInt(valStr, 10);
    });
    return args;
  }

  static STATE_NAMES = [
    'IDLE', 'PRECONDITION', 'STARTER_WAIT', 'BEEPING', 'TRANSITION',
    'READY', 'RACING', 'FINISHED', 'FALSE_START', 'PAUSED', 'FALL', 'SPLASH'
  ];

  handleStateChange(lane, stateIdx) {
    const stateName = ClimbTimerApp.STATE_NAMES[stateIdx] || `ST(${stateIdx})`;
    this.terminal?.print(`State [L${lane}]: ${stateName}`, 'info');

    if ([3, 4, 6].includes(stateIdx)) {
      // Only reset elapsed if we are NOT resuming from a PAUSED state and it's a NEW state
      if (stateIdx !== this.systemState && this.systemState !== 9) {
        this.pausedInTransition = false;
        this.displayElapsedMs = 0;
      }
      this.startDisplayTimer(this.displayElapsedMs, stateIdx);
    } else if ([7, 8, 10].includes(stateIdx)) {
      this.finishDisplayTimer();
    } else if ([0, 11].includes(stateIdx)) {
      this.resetDisplayTimer();
    } else if (stateIdx === 9) {
      this.pauseDisplayTimer();
    }

    this.systemState = stateIdx;
    this.updateTimerPreview();
    this.updateSymbolUI();
    this.updateTimerTextFromMs();
  }

  updateTimerTotal(stateIdx) {
    if (stateIdx === 4 || (stateIdx === 9 && this.pausedInTransition)) {
      this.timerTotal = this.config.T * 1000;
    } else if (stateIdx === 6 || (stateIdx === 9 && !this.pausedInTransition)) {
      this.timerTotal = this.config.C * 1000;
    } else if (stateIdx === 3) {
      this.timerTotal = 5000;
    }
  }

  startDisplayTimer(elapsed = 0, stateIdx = null) {
    this.clearDisplayInterval();
    this.displayElapsedMs = elapsed;
    this.displayState = 'running';
    if (stateIdx !== null) this.systemState = stateIdx;
    this.updateTimerTotal(this.systemState);

    this.lastTick = Date.now();
    this.updateTimerTextFromMs();
    this.displayInterval = setInterval(() => {
      const now = Date.now();
      const delta = now - this.lastTick;
      this.lastTick = now;
      this.displayElapsedMs += delta;
      this.updateTimerTextFromMs();
    }, 50); // High frequency for better accuracy
  }

  pauseDisplayTimer() {
    this.clearDisplayInterval();
    this.displayState = 'paused';
    this.updateSymbolUI();
  }

  finishDisplayTimer() {
    this.clearDisplayInterval();
    this.displayState = 'finished';
    this.updateSymbolUI();
    this.updateTimerTextFromMs();
  }

  resetDisplayTimer() {
    this.clearDisplayInterval();
    this.displayState = 'idle';
    this.displayElapsedMs = 0;
    this.updateSymbolUI();
    this.updateTimerTextFromMs();
  }

  clearDisplayInterval() {
    if (this.displayInterval) clearInterval(this.displayInterval);
    this.displayInterval = null;
  }

  updateTimerTextFromMs() {
    const el = document.getElementById('timerValue');
    if (!el) return;

    // 1. Handle IDLE state display
    if (this.displayState === 'idle') {
      if (this.currentMode === 0) { // SPEED
        el.textContent = '00.000';
        el.style.color = '#ff4444';
      } else if (this.currentMode === 3) { // CLOCK
        const now = new Date();
        el.textContent = now.toTimeString().split(' ')[0];
        el.style.color = '';
      } else {
        el.textContent = '--';
        el.style.color = '#94a3b8';
      }
      return;
    }

    // 2. Handle special competition states
    if (this.systemState === 8 && this.currentMode !== 0) { // FALSE_START
      el.textContent = 'FALSE';
      el.style.color = '#ff4444';
      return;
    }
    if (this.systemState === 7 && this.currentMode !== 0) { // FINISHED
      el.textContent = 'DONE';
      el.style.color = '#38bdf8';
      return;
    }
    if (this.systemState === 3 && this.currentMode === 0) { // BEEPING (Speed SET)
      el.textContent = 'SET';
      el.style.color = '#ff4444';
      return;
    }

    // 3. Handle running timer logic
    let ms = this.displayElapsedMs;
    let color = '';
    const mode = parseInt(this.config.M, 10);

    if (mode === 1 || mode === 2) { // Boulder/Lead countdown
      ms = Math.max(0, this.timerTotal - this.displayElapsedMs);
      if (this.systemState === 4 || (this.systemState === 9 && this.pausedInTransition)) { // TRANSITION or PAUSED-IN-TRANS
        color = '#fbbf24'; // Orange/Amber
      } else if (ms <= 5000 && (this.systemState === 6 || this.systemState === 9)) { // Final 5s of Racing or PAUSED-IN-RACING
        color = '#ff4444';
      }
    }

    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;

    if (mode === 0) { // SPEED
      if (this.displayState === 'finished') {
        const fraction = ms % 1000;
        el.textContent = `${String(totalSec).padStart(2, '0')}.${String(fraction).padStart(3, '0')}`;
      } else {
        const fraction = Math.floor((ms % 1000) / 10);
        el.textContent = `${String(totalSec).padStart(2, '0')}.${String(fraction).padStart(2, '0')}`;
      }
    } else {
      const tenths = Math.floor((ms % 1000) / 100);
      if (this.config.X) {
        if (min > 0) {
          el.textContent = `${min}:${String(sec).padStart(2, '0')}.${tenths}`;
        } else {
          el.textContent = `${sec}.${tenths}`;
        }
      } else {
        if (min > 0) {
          el.textContent = `${min}:${String(sec).padStart(2, '0')}`;
        } else {
          el.textContent = `${String(sec).padStart(2, '0')}`;
        }
      }
    }
    el.style.color = color;
  }

  async loadIdlePalette() {
    if (!this.transport?.isConnected()) return;
    const theme = parseInt(this.config.theme, 10) || 0;
    await this.sendTerminalCommand(`COLOR ${theme} 7`);
  }

  async saveIdlePalette() {
    if (!this.idlePalette) return;
    const theme = parseInt(this.config.theme, 10) || 0;
    const { text, bar, led, effect } = this.idlePalette;
    await this.sendTerminalCommand(`COLOR ${theme} 7 ${text} ${bar} ${led} ${effect}`);
  }

  renderIdlePalette() {
    if (!this.idlePalette) return;
    document.getElementById('cfg-idle-text-color').value = this.rgb565ToHex(this.idlePalette.text);
    document.getElementById('cfg-idle-bar-color').value = this.rgb565ToHex(this.idlePalette.bar);
    document.getElementById('cfg-idle-led-color').value = this.rgb565ToHex(this.idlePalette.led);
    document.getElementById('cfg-idle-led-effect').value = this.idlePalette.effect;
  }

  rgb565ToHex(value) {
    const red = Math.round(((value >> 11) & 0x1f) * 255 / 31);
    const green = Math.round(((value >> 5) & 0x3f) * 255 / 63);
    const blue = Math.round((value & 0x1f) * 255 / 31);
    return `#${[red, green, blue].map(channel => channel.toString(16).padStart(2, '0')).join('')}`;
  }

  hexToRgb565(value) {
    const hex = value.replace('#', '');
    const red = parseInt(hex.slice(0, 2), 16);
    const green = parseInt(hex.slice(2, 4), 16);
    const blue = parseInt(hex.slice(4, 6), 16);
    return ((red >> 3) << 11) | ((green >> 2) << 5) | (blue >> 3);
  }

  syncFormWithConfig() {
    const mapping = {
        'cfg-climb': 'C',
        'cfg-trans': 'T',
        'cfg-init-trans': 'N',
        'cfg-mode': 'M',
        'cfg-vol': 'V',
        'cfg-symbols': 'Y',
        'cfg-idle-visuals': 'Z',
        'cfg-tenths': 'X',
        'cfg-maintenance': 'K',
        'cfg-assigned-lane': 'A',
        'cfg-countdown': 'B',
        'cfg-lane-a': 'H',
        'cfg-lane-b': 'J',
        'cfg-waveform': 'W'
    };

    Object.keys(mapping).forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        const val = this.config[mapping[id]];
        if (el.type === 'checkbox') el.checked = !!val;
        else el.value = val;
    });

    const autoloopEl = document.getElementById('cfg-autoloop');
    if (autoloopEl) autoloopEl.checked = !!this.config.Q;

    const volDisp = document.getElementById('volDisplay');
    if (volDisp) volDisp.textContent = this.config.V;
    this.updateModeUI(this.config.M);
    this.renderCircuitStepsTable();
    this.renderFlowVisualizer();
  }


  async sendEvent(code, args = '') {
    const cmd = `E${code} ${args}`.trim();
    await this.sendTerminalCommand(cmd);
  }

  async sendConfig(key, val) {
    await this.sendTerminalCommand(`C ${key}${val}`);
  }

  async sendTerminalCommand(cmd = null) {
    const input = cmd || document.getElementById('terminalInput').value.trim();
    if (!input) return;

    if (!this.transport || !this.transport.isConnected()) {
      if (!cmd) {
        this.terminal?.print('Not connected', 'error');
      }
      return;
    }

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
    this.config.M = mode;
    this.currentMode = mode;
    if (mode === 2) {
      this.config.Q = 0;
      const autoLoopCb = document.getElementById('cfg-autoloop');
      if (autoLoopCb) autoLoopCb.checked = false;
    }
    const runModeCfg = document.getElementById('runModeConfig');
    if (runModeCfg) runModeCfg.classList.toggle('hidden', mode === 0 || mode === 2);

    const circStepsSec = document.getElementById('circuitStepsSection');
    if (circStepsSec) circStepsSec.classList.toggle('hidden', mode !== 4);

    this.updateModeDisplay();
    this.updateRunModeDisplay();
    this.renderFlowVisualizer();
  }

  updateModeDisplay() {
    const modesEn = ['IFSC SPEED', 'BOULDER', 'LEAD', 'CLOCK', 'CIRCUIT'];
    const modesFi = ['SPEED', 'BOULDER', 'LEAD', 'KELLO', 'INTERVALLIT'];
    const modes = this.locale === 'fi' ? modesFi : modesEn;
    const modeDisp = document.getElementById('modeDisplay');
    if (modeDisp) modeDisp.textContent = modes[this.currentMode] || '--';

    const modeClass = ['speed', 'boulder', 'lead', 'clock', 'circuit'][this.currentMode] || 'speed';
    document.body.className = `mode-${modeClass}`;

    // Apply button visibility from discipline mapping
    const mapping = DISCIPLINE_BUTTON_MAP[this.currentMode] || DISCIPLINE_BUTTON_MAP[0];
    const abortBtn = document.getElementById('btn-abort');
    if (abortBtn) abortBtn.classList.toggle('hidden', !mapping.abort?.visible);

    const finishBtn = document.getElementById('btn-finish');
    if (finishBtn) finishBtn.classList.toggle('hidden', !mapping.finish?.visible);

    const judgingSection = document.querySelector('.judging-section');
    if (judgingSection) judgingSection.classList.toggle('hidden', !mapping.judging?.visible);

    document.querySelectorAll('.mode-speed-only').forEach(el => el.classList.toggle('hidden', this.currentMode !== 0));
    document.querySelectorAll('.mode-boulder-only').forEach(el => el.classList.toggle('hidden', this.currentMode !== 1));

    this.updateSymbolUI();
  }

  updateRunModeDisplay() {
    const runModeDisp = document.getElementById('runModeDisplay');
    if (runModeDisp) runModeDisp.textContent = this.config.Q ? this.t('loop_on') : this.t('loop_off');
  }

  updateSymbolUI() {
    const mapping = DISCIPLINE_BUTTON_MAP[this.currentMode] || DISCIPLINE_BUTTON_MAP[0];
    const isPaused = this.systemState === 9 || this.displayState === 'paused';
    const isRunning = this.displayState === 'running';

    let startLabelKey = mapping.start?.labelKey || 'btn_start';
    let startIcon = mapping.start?.icon || '▶ ';

    if (mapping.start?.stateAware) {
      if (isRunning) {
        startLabelKey = 'btn_pause';
        startIcon = '⏸ ';
      } else if (isPaused) {
        startLabelKey = 'btn_resume';
        startIcon = '▶ ';
      } else {
        startLabelKey = (this.currentMode === 1 || this.currentMode === 4) ? 'btn_play' : 'btn_start';
        startIcon = '▶ ';
      }
    }

    const startBtn = document.getElementById('btn-start');
    if (startBtn) {
      const prefix = this.config.Y ? startIcon : '';
      startBtn.textContent = `${prefix}${this.t(startLabelKey)}`;
    }

    const resetBtn = document.getElementById('btn-reset');
    if (resetBtn) {
      const resetLabelKey = mapping.reset?.labelKey || 'btn_reset';
      const resetPrefix = this.config.Y ? (mapping.reset?.icon || '⟲ ') : '';
      resetBtn.textContent = `${resetPrefix}${this.t(resetLabelKey)}`;
    }

    const abortBtn = document.getElementById('btn-abort');
    if (abortBtn && mapping.abort?.visible) {
      const abortLabelKey = mapping.abort?.labelKey || 'btn_abort';
      const abortPrefix = this.config.Y ? (mapping.abort?.icon || '⏹ ') : '';
      abortBtn.textContent = `${abortPrefix}${this.t(abortLabelKey)}`;
    }

    const finishBtn = document.getElementById('btn-finish');
    if (finishBtn && mapping.finish?.visible) {
      const finishLabelKey = mapping.finish?.labelKey || 'btn_finish';
      const finishPrefix = this.config.Y ? (mapping.finish?.icon || '🏁 ') : '';
      finishBtn.textContent = `${finishPrefix}${this.t(finishLabelKey)}`;
    }
  }

  async syncDeviceTime() {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const timeStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    await this.sendTerminalCommand(`TME ${timeStr}`);
  }

  updateTimerPreview() {
    const transPrev = document.getElementById('transPreview');
    if (transPrev) transPrev.textContent = `${this.config.T}s`;
    const climbPrev = document.getElementById('climbPreview');
    if (climbPrev) climbPrev.textContent = `${this.config.C}s`;
    const statePrev = document.getElementById('statePreview');
    if (statePrev) statePrev.textContent = this.getDisplayStateLabel();

    const beepsPrev = document.getElementById('beepsPreview');
    if (beepsPrev) beepsPrev.textContent = this.config.B ? 'ON' : 'OFF';
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

  // ============================================================================
  // Circuit Steps & Flow Visualizer Helpers
  // ============================================================================

  parseCircSeqStr(str) {
    if (str === '') return [];
    if (!str) return [{ climb: 30, rest: 15 }];
    const steps = [];
    const parts = str.split(',');
    parts.forEach(p => {
      const pair = p.split('/');
      if (pair.length === 2) {
        const c = parseInt(pair[0], 10) || 30;
        const r = parseInt(pair[1], 10) || 15;
        steps.push({ climb: c, rest: r });
      }
    });
    return steps.length > 0 ? steps : [{ climb: 30, rest: 15 }];
  }

  buildCircSeqStr(steps) {
    return steps.map(s => `${s.climb}/${s.rest}`).join(',');
  }

  renderCircuitStepsTable() {
    const tbody = document.getElementById('circuitStepsTableBody');
    if (!tbody) return;

    if (document.activeElement && tbody.contains(document.activeElement) && document.activeElement.tagName === 'INPUT') {
      const rawEl = document.getElementById('circSeqRaw');
      if (rawEl) rawEl.textContent = this.config.circ_seq;
      return;
    }

    const steps = this.parseCircSeqStr(this.config.circ_seq);
    tbody.innerHTML = '';

    steps.forEach((step, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${this.t('step_prefix')} ${idx + 1}</strong></td>
        <td><input type="number" class="step-climb-input" data-idx="${idx}" min="1" max="3600" value="${step.climb}" /></td>
        <td><input type="number" class="step-rest-input" data-idx="${idx}" min="0" max="3600" value="${step.rest}" /></td>
        <td><button type="button" class="btn btn-sm btn-danger btn-remove-step" data-idx="${idx}">${this.t('btn_remove')}</button></td>
      `;
      tbody.appendChild(tr);
    });

    tbody.querySelectorAll('.step-climb-input, .step-rest-input').forEach(input => {
      input.addEventListener('change', () => this.updateCircuitStepsFromUI());
      input.addEventListener('input', () => this.updateCircuitStepsFromUI());
    });

    tbody.querySelectorAll('.btn-remove-step').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'), 10);
        this.removeCircuitStep(idx);
      });
    });

    const rawEl = document.getElementById('circSeqRaw');
    if (rawEl) rawEl.textContent = this.config.circ_seq;
  }

  updateCircuitStepsFromUI() {
    const tbody = document.getElementById('circuitStepsTableBody');
    if (!tbody) return;

    const climbInputs = tbody.querySelectorAll('.step-climb-input');
    const restInputs = tbody.querySelectorAll('.step-rest-input');

    const steps = [];
    for (let i = 0; i < climbInputs.length; i++) {
      const c = parseInt(climbInputs[i].value, 10) || 30;
      const r = parseInt(restInputs[i].value, 10) || 0;
      steps.push({ climb: c, rest: r });
      this.sendTerminalCommand(`CS ${i} ${c} ${r}`);
    }

    const seq = this.buildCircSeqStr(steps);
    this.config.circ_seq = seq;
    this.circuitSteps = steps;
    this.circuitStepsCount = steps.length;

    const rawEl = document.getElementById('circSeqRaw');
    if (rawEl) rawEl.textContent = seq;

    this.renderFlowVisualizer();
  }

  addCircuitStep() {
    const steps = this.parseCircSeqStr(this.config.circ_seq);
    const lastStep = steps.length > 0 ? steps[steps.length - 1] : { climb: 30, rest: 15 };
    const newIdx = steps.length;
    steps.push({ climb: lastStep.climb, rest: lastStep.rest });
    const seq = this.buildCircSeqStr(steps);
    this.config.circ_seq = seq;
    this.circuitSteps = steps;
    this.circuitStepsCount = steps.length;
    this.sendTerminalCommand(`CS ${newIdx} ${lastStep.climb} ${lastStep.rest}`);
    this.renderCircuitStepsTable();
    this.renderFlowVisualizer();
  }

  removeCircuitStep(idx) {
    const steps = this.parseCircSeqStr(this.config.circ_seq);
    steps.splice(idx, 1);
    this.sendTerminalCommand(steps.length === 0 ? 'CS -1 0 0' : `CS ${idx} 0 0`);
    const seq = this.buildCircSeqStr(steps);
    this.config.circ_seq = seq;
    this.circuitSteps = steps;
    this.circuitStepsCount = steps.length;
    this.renderCircuitStepsTable();
    this.renderFlowVisualizer();
  }

  resetCircuitSteps() {
    this.sendTerminalCommand('CS 0 30 15');
    this.sendTerminalCommand('CS 1 30 15');
    this.sendTerminalCommand('CS 2 0 0');
    const seq = '30/15,30/15';
    this.config.circ_seq = seq;
    this.circuitSteps = [{ climb: 30, rest: 15 }, { climb: 30, rest: 15 }];
    this.circuitStepsCount = 2;
    this.renderCircuitStepsTable();
    this.renderFlowVisualizer();
  }

  renderFlowVisualizer() {
    const container = document.getElementById('flowVisualizer');
    if (!container) return;

    const mode = parseInt(this.config.M, 10);
    const initTrans = parseInt(this.config.N, 10) || (mode === 2 ? 40 : 0);
    const climbTime = parseInt(this.config.C, 10) || (mode === 2 ? 360 : 60);
    const transTime = parseInt(this.config.T, 10) || 15;
    const autoLoop = (mode === 2) ? false : !!parseInt(this.config.Q, 10);

    let html = '<div class="flow-chain flow-chain-grid">';

    if (mode === 4) { // CIRCUIT
      if (initTrans > 0) {
        html += `
          <div class="flow-card flow-prep">
            <span class="flow-card-badge">Once</span>
            <span class="flow-card-title">Init Prep</span>
            <span class="flow-card-time">${initTrans}s</span>
          </div>
          <div class="flow-arrow">──►</div>
        `;
      }
      const steps = this.parseCircSeqStr(this.config.circ_seq);
      steps.forEach((step, idx) => {
        const isLastStep = idx === steps.length - 1;
        const showRest = autoLoop || !isLastStep;

        html += `
          <div class="flow-step-block">
            <div class="flow-card flow-climb">
              <span class="flow-card-badge">Step ${idx + 1}</span>
              <span class="flow-card-title">Climb</span>
              <span class="flow-card-time">${step.climb}s</span>
            </div>
        `;
        if (showRest) {
          html += `
            <div class="flow-arrow">──►</div>
            <div class="flow-card flow-rest">
              <span class="flow-card-badge">Step ${idx + 1}</span>
              <span class="flow-card-title">Rest</span>
              <span class="flow-card-time">${step.rest}s</span>
            </div>
          `;
        }
        html += `</div>`;

        if (idx < steps.length - 1) {
          html += `<div class="flow-arrow">──►</div>`;
        }
      });

      if (autoLoop) {
        html += `
          <div class="flow-arrow">──►</div>
          <div class="flow-card flow-loop">
            <span class="flow-card-badge">Loop</span>
            <span class="flow-card-title">🔄 Step 1 Climb</span>
            <span class="flow-card-time">Repeat</span>
          </div>
        `;
      } else {
        html += `
          <div class="flow-arrow">──►</div>
          <div class="flow-card flow-stop">
            <span class="flow-card-badge">Finish</span>
            <span class="flow-card-title">⏹️ DONE</span>
            <span class="flow-card-time">DONE</span>
          </div>
        `;
      }
    } else if (mode === 1 || mode === 2) { // BOULDER / LEAD
      const prepLabel = (mode === 2) ? 'Prep Time' : 'Init Prep';
      if (initTrans > 0) {
        html += `
          <div class="flow-card flow-prep">
            <span class="flow-card-badge">Once</span>
            <span class="flow-card-title">${prepLabel}</span>
            <span class="flow-card-time">${initTrans}s</span>
          </div>
          <div class="flow-arrow">──►</div>
        `;
      }
      html += `
        <div class="flow-card flow-climb">
          <span class="flow-card-badge">Climb</span>
          <span class="flow-card-title">Climb Time</span>
          <span class="flow-card-time">${climbTime}s</span>
        </div>
      `;
      if (autoLoop) {
        html += `
          <div class="flow-arrow">──►</div>
          <div class="flow-card flow-rest">
            <span class="flow-card-badge">Rest</span>
            <span class="flow-card-title">Rest / Trans</span>
            <span class="flow-card-time">${transTime}s</span>
          </div>
          <div class="flow-arrow">──►</div>
          <div class="flow-card flow-loop">
            <span class="flow-card-badge">Loop</span>
            <span class="flow-card-title">🔄 Climb</span>
            <span class="flow-card-time">Repeat</span>
          </div>
        `;
      } else {
        html += `
          <div class="flow-arrow">──►</div>
          <div class="flow-card flow-stop">
            <span class="flow-card-badge">Finish</span>
            <span class="flow-card-title">⏹️ DONE</span>
            <span class="flow-card-time">DONE</span>
          </div>
        `;
      }
    } else if (mode === 0) { // SPEED
      html += `
        <div class="flow-card flow-prep">
          <span class="flow-card-badge">Pad</span>
          <span class="flow-card-title">On Pad</span>
          <span class="flow-card-time">READY</span>
        </div>
        <div class="flow-arrow">──►</div>
        <div class="flow-card flow-rest">
          <span class="flow-card-badge">Starter</span>
          <span class="flow-card-title">Beep 1-2-3</span>
          <span class="flow-card-time">3.0s</span>
        </div>
        <div class="flow-arrow">──►</div>
        <div class="flow-card flow-climb">
          <span class="flow-card-badge">Racing</span>
          <span class="flow-card-title">Speed Climb</span>
          <span class="flow-card-time">0.000s</span>
        </div>
        <div class="flow-arrow">──►</div>
        <div class="flow-card flow-stop">
          <span class="flow-card-badge">Finish</span>
          <span class="flow-card-title">Pad Touch</span>
          <span class="flow-card-time">WIN</span>
        </div>
      `;
    } else if (mode === 3) { // CLOCK
      html += `
        <div class="flow-card flow-climb">
          <span class="flow-card-badge">Realtime</span>
          <span class="flow-card-title">System Clock</span>
          <span class="flow-card-time">24H</span>
        </div>
      `;
    }

    html += '</div>';
    container.innerHTML = html;
  }
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    window.app = new ClimbTimerApp();
  });
}
