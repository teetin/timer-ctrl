import { test, expect } from 'bun:test';
import { JSDOM } from 'jsdom';
import { Terminal } from '../public/terminal.js';

test('Terminal clear removes logs and DOM nodes', () => {
  const dom = new JSDOM("<!DOCTYPE html><div id='terminal'></div>");
  global.document = dom.window.document;
  const terminalElement = dom.window.document.getElementById('terminal');
  const terminal = new Terminal(terminalElement);

  terminal.print('hello');
  terminal.print('world', 'error');
  expect(terminal.logs.length).toBe(2);
  expect(terminalElement.children.length).toBe(2);

  terminal.clear();

  expect(terminal.logs.length).toBe(0);
  expect(terminalElement.innerHTML).toBe('');
});

test('Terminal saveLogs strips duplicate prefixes', async () => {
  const dom = new JSDOM("<!DOCTYPE html><body><div id='terminal'></div></body>");
  global.document = dom.window.document;

  const originalBlob = global.Blob;
  const originalCreate = global.URL.createObjectURL;
  const originalRevoke = global.URL.revokeObjectURL;

  const createdBlobs = [];
  global.Blob = class {
    constructor(parts, options) {
      this.parts = parts;
      this.options = options;
      createdBlobs.push(this);
    }
  };
  global.URL.createObjectURL = () => 'blob:mock';
  global.URL.revokeObjectURL = () => {};

  const terminalElement = dom.window.document.getElementById('terminal');
  const terminal = new Terminal(terminalElement);

  const ts = '2025-06-05T04:59:48.865Z';
  terminal.logs = [
    { timestamp: ts, message: 'Sent: stop_twai', type: 'sent' },
    { timestamp: ts, message: 'Received: TWAI stop initiated', type: 'received' },
  ];

  await terminal.saveLogs();

  expect(createdBlobs).toHaveLength(1);
  expect(createdBlobs[0].parts[0]).toBe(
    `[${ts}] SENT: stop_twai\n[${ts}] RECEIVED: TWAI stop initiated`
  );

  global.Blob = originalBlob;
  global.URL.createObjectURL = originalCreate;
  global.URL.revokeObjectURL = originalRevoke;
});
