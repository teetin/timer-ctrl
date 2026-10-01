import { test, expect, beforeEach } from 'bun:test';
import { JSDOM } from 'jsdom';
import { ClimbTimerApp } from '../public/app.js';

let dom;
let window;
let document;

beforeEach(() => {
  dom = new JSDOM(`
    <!DOCTYPE html>
    <html>
      <body>
        <div id="terminal"></div>
        <select id="cfg-mode"></select>
        <select id="cfg-theme"></select>
        <select id="cfg-radio-mode"></select>
        <select id="cfg-tz-preset"></select>
        <input id="cfg-tz-custom" />
        <input type="checkbox" id="cfg-console" />
        <div id="terminalPanel"></div>
        <div id="circuitStepsSection"></div>
        <table id="circuitStepsTable">
          <tbody id="circuitStepsTableBody"></tbody>
        </table>
        <span id="circSeqRaw"></span>
        <div id="flowVisualizer"></div>
      </body>
    </html>
  `, { url: "http://localhost" });

  window = dom.window;
  document = window.document;
  global.window = window;
  global.document = document;
  global.navigator = window.navigator;
  global.HTMLElement = window.HTMLElement;
});

test('parseCircSeqStr and buildCircSeqStr parse correctly', () => {
  const app = new ClimbTimerApp();
  const parsed = app.parseCircSeqStr('30/15,45/20,60/30');
  expect(parsed).toEqual([
    { climb: 30, rest: 15 },
    { climb: 45, rest: 20 },
    { climb: 60, rest: 30 },
  ]);

  const str = app.buildCircSeqStr(parsed);
  expect(str).toBe('30/15,45/20,60/30');
});

test('addCircuitStep copies climb and rest duration from previous step', () => {
  const app = new ClimbTimerApp();
  app.config.circ_seq = '45/20';

  app.addCircuitStep();

  expect(app.config.circ_seq).toBe('45/20,45/20');
});

test('renderCircuitStepsTable does not re-render DOM when input is focused', () => {
  const app = new ClimbTimerApp();
  app.config.circ_seq = '30/15,30/15';
  app.renderCircuitStepsTable();

  const tbody = document.getElementById('circuitStepsTableBody');
  const climbInput = tbody.querySelector('.step-climb-input');
  expect(climbInput).not.toBeNull();

  climbInput.focus();
  expect(document.activeElement).toBe(climbInput);

  climbInput.value = '50';

  // Trigger renderCircuitStepsTable while input is focused
  app.config.circ_seq = '50/15,30/15';
  app.renderCircuitStepsTable();

  // Input should retain focus and user value
  expect(document.activeElement).toBe(climbInput);
  expect(climbInput.value).toBe('50');
});

test('removeCircuitStep and resetCircuitSteps update sequence', () => {
  const app = new ClimbTimerApp();
  app.config.circ_seq = '30/15,45/20,60/30';

  app.removeCircuitStep(1);
  expect(app.config.circ_seq).toBe('30/15,60/30');

  app.resetCircuitSteps();
  expect(app.config.circ_seq).toBe('30/15,30/15');
});
