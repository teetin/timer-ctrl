export class Terminal {
  constructor(terminalElement) {
    this.terminal = terminalElement;
    this.logs = [];
  }

  print(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      message,
      type,
    };
    this.logs.push(logEntry);

    const line = document.createElement('div');
    line.className = `terminal-line ${type}`;

    const timestampSpan = document.createElement('span');
    timestampSpan.className = 'timestamp';
    timestampSpan.textContent = `[${timestamp}]`;

    const messageText = document.createTextNode(` ${message}`);

    line.appendChild(timestampSpan);
    line.appendChild(messageText);
    this.terminal.appendChild(line);
    this.terminal.scrollTop = this.terminal.scrollHeight;
  }

  clear() {
    this.terminal.innerHTML = '';
    this.logs = [];
  }

  async saveLogs() {
    const logText = this.logs
      .map((log) => {
        const typeLabel = log.type.toUpperCase();
        const prefix = `${log.type.charAt(0).toUpperCase() + log.type.slice(1)}: `;
        let message = log.message;
        if (message.startsWith(prefix)) {
          message = message.slice(prefix.length);
        }
        return `[${log.timestamp}] ${typeLabel}: ${message}`;
      })
      .join('\n');

    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `ble_uart_logs_${new Date().toISOString().slice(0, 19).replace(/[:]/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
