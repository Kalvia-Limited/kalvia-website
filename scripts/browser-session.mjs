import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
export const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
export async function openBrowser() {
  const profile = await mkdtemp(join(tmpdir(), 'kalvia-a11y-'));
  const process = spawn(globalThis.process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--disable-gpu', '--no-first-run', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
  let socket;
  let id = 0;
  const pending = new Map();
  const errors = [];
  const send = (method, params = {}) => new Promise((resolve, reject) => { const key = ++id; pending.set(key, { resolve, reject }); socket.send(JSON.stringify({ id: key, method, params })); });
  const evaluate = async expression => {
    const reply = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (reply.exceptionDetails) throw new Error(JSON.stringify(reply.exceptionDetails));
    return reply.result.value;
  };
  const close = async () => {
    if (socket?.readyState === WebSocket.OPEN) { await send('Browser.close').catch(() => {}); socket.close(); }
    if (process.exitCode === null) process.kill();
    const absolute = resolve(profile);
    if (absolute.startsWith(resolve(tmpdir()) + sep) && absolute.split(sep).at(-1).startsWith('kalvia-a11y-')) { await pause(500); await rm(absolute, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); }
  };
  try {
    let port;
    for (let attempt = 0; attempt < 100; attempt++) { try { port = (await readFile(join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]; break; } catch {} await pause(100); }
    if (!port) throw Error('Chrome startup timed out');
    const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    socket = new WebSocket(targets.find(target => target.type === 'page').webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
    socket.onmessage = ({ data }) => {
      const reply = JSON.parse(data);
      if (reply.method === 'Runtime.exceptionThrown') errors.push(reply.params.exceptionDetails);
      if (reply.method === 'Runtime.consoleAPICalled' && reply.params.type === 'error') errors.push(reply.params.args);
      if (reply.id) { const task = pending.get(reply.id); pending.delete(reply.id); if (reply.error) task.reject(reply.error); else task.resolve(reply.result); }
    };
    await send('Runtime.enable'); await send('Page.enable');
    return { send, evaluate, close, errors };
  } catch (error) { await close(); throw error; }
}
