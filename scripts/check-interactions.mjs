import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, sep } from "node:path";

const origin = process.env.TEST_ORIGIN || "http://127.0.0.1:3000";
const chromePath = process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const profile = await mkdtemp(join(tmpdir(), "kalvia-interactions-"));
const browser = spawn(chromePath, ["--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "about:blank"], { windowsHide: true, stdio: "ignore" });
const errors = [];
const checks = [];
const requests = [];
let contactMock = null;
let documentMock = null;
let contactRequests = 0;
let socket;
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(fn, label) {
  for (let i = 0; i < 100; i++) { if (await fn()) return; await pause(100); }
  throw new Error(`Timed out: ${label}`);
}
try {
  let port;
  await until(async () => { try { port = (await readFile(join(profile, "DevToolsActivePort"), "utf8")).split("\n")[0]; return port; } catch { return false; } }, "Chrome startup");
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  socket = new WebSocket(targets.find(target => target.type === "page").webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let id = 0;
  const pending = new Map();
  socket.onmessage = ({ data }) => {
    const reply = JSON.parse(data);
    if (reply.method === "Runtime.exceptionThrown") errors.push(reply.params.exceptionDetails);
    if (reply.method === "Runtime.consoleAPICalled" && reply.params.type === "error") errors.push(reply.params.args);
    if (reply.method === "Network.requestWillBeSent") requests.push({ type: reply.params.type, url: reply.params.request.url, method: reply.params.request.method });
    if (reply.method === "Fetch.requestPaused") {
      if (documentMock && reply.params.resourceType === 'Document') {
        void send('Fetch.fulfillRequest', { requestId: reply.params.requestId, responseCode: 200, responseHeaders: documentMock.headers, body: Buffer.from(documentMock.html).toString('base64') });
        return;
      }
      contactRequests++;
      const mock = contactMock;
      setTimeout(() => {
        if (mock.fail) void send('Fetch.failRequest', { requestId: reply.params.requestId, errorReason: 'Failed' });
        else void send('Fetch.fulfillRequest', { requestId: reply.params.requestId, responseCode: mock.status, responseHeaders: [{ name: 'Content-Type', value: 'application/json' }], body: Buffer.from(JSON.stringify(mock.body)).toString('base64') });
      }, mock.delay || 0);
    }
    if (reply.id) { const task = pending.get(reply.id); pending.delete(reply.id); if (reply.error) task.reject(reply.error); else task.resolve(reply.result); }
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => { const key = ++id; pending.set(key, { resolve, reject }); socket.send(JSON.stringify({ id: key, method, params })); });
  const evaluate = async expression => {
    const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  const check = async (name, expression) => { assert.equal(await evaluate(expression), true, name); checks.push(name); };
  const click = async selector => { await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`); await pause(100); };
  const scroll = async selector => { await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center',behavior:'instant'})`); await pause(200); };
  const key = async (key, code = key) => {
    await send("Input.dispatchKeyEvent", { type: "keyDown", key, code, ...(key === "Enter" ? { text: "\r" } : {}), windowsVirtualKeyCode: ({ Enter: 13, " ": 32, Escape: 27, Tab: 9, ArrowRight: 39, Home: 36, End: 35 })[key] });
    await send("Input.dispatchKeyEvent", { type: "keyUp", key, code });
    await pause(100);
  };
  await send("Runtime.enable");
  await send("Page.enable");
  await send("Network.enable");
  if (process.env.SECURITY_CHECK === 'true') await send('Page.addScriptToEvaluateOnNewDocument', { source: `window.__cspViolations = []; document.addEventListener('securitypolicyviolation', e => window.__cspViolations.push({ directive: e.effectiveDirective, disposition: e.disposition, blocked: e.blockedURI }));` });
  await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await send("Page.navigate", { url: origin });
  await until(() => evaluate(`document.readyState === 'complete' && !!document.querySelector('[data-cycle="after"]')`), "page load");
  await pause(700);
  await click('[data-cycle="after"]');
  await until(() => evaluate(`document.querySelector('#cycle').classList.contains('after')`), "hydration and comparison switch");
  await check("Comparison after state", `document.querySelector('[data-cycle="after"]').getAttribute('aria-pressed') === 'true' && !document.querySelector('.cycle-center .v-after').hidden`);
  await click('[data-cycle="before"]');
  await check("Comparison before state", `!document.querySelector('#cycle').classList.contains('after') && document.querySelector('.cycle-center .v-after').hidden`);
  await evaluate(`scrollTo({top:0,behavior:'instant'})`);
  const firstHeadline = await evaluate(`document.querySelector('.rotator .on').textContent`);
  await pause(2700);
  await check("Desktop headline rotates", `document.querySelector('.rotator .on').textContent !== ${JSON.stringify(firstHeadline)}`);
  await click('footer a[data-brand="market"]');
  await pause(900);
  await check("Marketplace navigation selects panel", `!document.querySelector('#panel-market').hidden && document.querySelector('#panel-academy').hidden`);
  await check("Active section navigation", `document.querySelector('.nav-links a[data-brand="market"]').getAttribute('aria-current') === 'location'`);
  await evaluate(`document.querySelector('#tab-market').focus()`);
  await key("ArrowRight");
  await check("Offering keyboard wrap", `document.activeElement.id === 'tab-academy' && !document.querySelector('#panel-academy').hidden`);
  await key("End");
  await check("Offering End key", `document.activeElement.id === 'tab-market' && !document.querySelector('#panel-market').hidden`);
  await key("Home");
  await check("Offering Home key", `document.activeElement.id === 'tab-academy'`);
  for (const offering of ["academy", "market"]) {
    await click(`#tab-${offering}`);
    for (let i = 0; i < 3; i++) {
      await click(`#${offering}-audience-tab-${i}`);
      await check(`${offering} audience ${i + 1}`, `!document.querySelector('#${offering}-audience-${i}').hidden && document.querySelector('#${offering}-audience-tab-${i}').getAttribute('aria-selected') === 'true'`);
    }
    await evaluate(`document.querySelector('#${offering}-audience-tab-2').focus()`);
    await key("ArrowRight");
    await check(`${offering} audience keyboard wraps`, `document.activeElement.id === '${offering}-audience-tab-0' && !document.querySelector('#${offering}-audience-0').hidden`);
    await key("End");
    await check(`${offering} audience End key`, `document.activeElement.id === '${offering}-audience-tab-2'`);
    await key("Home");
    await check(`${offering} audience Home key`, `document.activeElement.id === '${offering}-audience-tab-0'`);
  }
  await scroll('#ripple-stage');
  await pause(2800);
  await check("Prosperity autoplay advances in view", `document.querySelectorAll('.ripple-label')[0].getAttribute('aria-pressed') === 'false'`);
  for (let i = 0; i < 4; i++) {
    await click(`.ripple-label:nth-of-type(${i + 1})`);
    await check(`Prosperity stage ${i + 1}`, `document.querySelectorAll('.ripple-label')[${i}].getAttribute('aria-pressed') === 'true' && document.querySelectorAll('.ring.lit').length === ${i + 1}`);
  }
  await click('.ripple-label:nth-of-type(2)');
  await pause(2800);
  await check("Manual prosperity selection stops autoplay", `document.querySelectorAll('.ripple-label')[1].getAttribute('aria-pressed') === 'true'`);
  for (const [persona, interest] of [["student", "Academy"], ["sponsor", "Sponsoring"], ["tech", "Marketplace"], ["org", "Partnership"]]) {
    await click(`[data-persona="${persona}"]`);
    await check(`${persona} recommendation`, `document.querySelector('[data-persona="${persona}"]').getAttribute('aria-pressed') === 'true' && document.querySelector('#finder-out a').dataset.interest === '${interest}'`);
    await click('#finder-out a');
    await check(`${persona} contact prefill`, `document.querySelector('input[name="interest"]:checked').value === '${interest}'`);
  }
  await evaluate(`document.querySelector('#f-name').value = 'Preserved name'`);
  await click('[data-interest="Academy"]');
  await check("Prefill preserves form entries", `document.querySelector('#f-name').value === 'Preserved name' && document.querySelector('input[name="interest"]:checked').value === 'Academy'`);
  for (let i = 0; i < 3; i++) {
    await scroll(`.j-step:nth-child(${i + 1})`);
    await check(`Journey step ${i + 1}`, `document.querySelector('#step-num').textContent === '${String(i + 1).padStart(2, "0")}' && document.querySelectorAll('.j-step')[${i}].classList.contains('active')`);
  }
  await scroll('#soat');
  await pause(1300);
  await check("Counter finishes at 12", `document.querySelector('.soat-facts b').textContent === '12'`);
  await check("SOAT form is labelled as a demonstration", `document.querySelector('label[for="soat-id"]').textContent.includes('demo') && document.querySelector('#soat-hint').textContent.includes('no live register is queried')`);
  const demoRequestStart = requests.length;
  for (const [id, expected] of [["KA17/A", "valid"], ["KA09/C", "Expired"]]) {
    await click(`[data-try="${id}"]`);
    await check(`SOAT local sample ${id}`, `document.querySelector('#verify-result').textContent.includes('${expected}')`);
  }
  await evaluate(`document.querySelector('#soat-id').focus()`);
  await send("Input.insertText", { text: "unknown" });
  await key("Enter");
  await check("SOAT unknown ID stays on page", `document.querySelector('#verify-result').textContent.includes("couldn't find") && location.pathname === '/'`);
  const enterId = async value => {
    await evaluate(`document.querySelector('#soat-id').focus(); document.querySelector('#soat-id').select()`);
    await send("Input.insertText", { text: value });
    await key("Enter");
  };
  await enterId('  ka17 / a  ');
  await check("SOAT normalizes sample ID casing and whitespace", `document.querySelector('#verify-result .badge').textContent === 'SOAT valid (demo)'`);
  for (const id of ['constructor', '__proto__', 'toString']) {
    await enterId(id);
    await check(`SOAT rejects non-sample ID ${id}`, `!document.querySelector('#verify-result .tech-card') && document.querySelector('#verify-result').textContent.includes("couldn't find")`);
  }
  await enterId('<img src=x onerror=alert(1)>');
  await check("SOAT treats unknown input as text", `!document.querySelector('#verify-result img') && document.querySelector('#verify-result strong').textContent.includes('<IMG')`);
  await evaluate(`document.querySelector('#soat-id').focus(); document.querySelector('#soat-id').select()`);
  await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Backspace", code: "Backspace", windowsVirtualKeyCode: 8 });
  await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Backspace", code: "Backspace" });
  await key("Enter");
  await check("SOAT empty ID shows guidance", `document.querySelector('#verify-result').textContent === 'Enter a sample technician ID.'`);
  assert.deepEqual(requests.slice(demoRequestStart).filter(request => ['Fetch', 'XHR', 'Document'].includes(request.type)), [], 'SOAT makes no verification or navigation requests');
  checks.push('SOAT makes no verification or navigation requests');
  await check("All links have existing same-page targets", `[...document.querySelectorAll('a')].every(a => {const href=a.getAttribute('href'); return href?.startsWith('#') && href.length > 1 && document.getElementById(href.slice(1)) && !a.target && !a.hasAttribute('download');})`);
  await check("Contact email and address are informational", `!document.querySelector('.contact-list a') && document.querySelector('.contact-list').textContent.includes('hello@kalvia.one') && document.querySelector('footer').textContent.includes('hello@kalvia.one') && ![...document.querySelectorAll('a')].some(a=>/^(mailto:|tel:|https?:)/.test(a.getAttribute('href')))`);
  const anchors = await evaluate(`[...document.querySelectorAll('a')].map(a=>({href:a.getAttribute('href'),text:a.textContent.trim() || a.getAttribute('aria-label')}))`);
  const documentRequests = requests.filter(request => request.type === 'Document').length;
  for (let index = 0; index < anchors.length; index++) {
    await evaluate(`document.querySelectorAll('a')[${index}].click()`);
    await pause(80);
    await check(`Same-page action: ${anchors[index].text}`, `location.origin === ${JSON.stringify(origin)} && location.pathname === '/' && location.hash === ${JSON.stringify(anchors[index].href)}`);
  }
  assert.equal(requests.filter(request => request.type === 'Document').length, documentRequests, 'Anchor actions do not load another page');
  checks.push('Anchor actions do not load another page');
  await scroll('.seal-wrap');
  const seal = await evaluate(`(() => { const r=document.querySelector('.seal-wrap').getBoundingClientRect();return {x:r.left+r.width*.65,y:r.top+r.height*.6}; })()`);
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", ...seal });
  await pause(250);
  await check("Seal responds to mouse movement", `document.querySelector('.seal-wrap').style.getPropertyValue('--seal-transform') !== 'rotateY(0deg) rotateX(0deg)'`);
  await scroll('.value');
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 1, y: 900 });
  await evaluate(`document.querySelector('.value').focus()`);
  await key("Enter");
  await check("Value keyboard expands", `document.querySelector('.value').getAttribute('aria-expanded') === 'true' && document.querySelector('#value-description-0').getAttribute('aria-hidden') === 'false'`);
  await key(" ", "Space");
  await check("Value keyboard collapses", `document.querySelector('.value').getAttribute('aria-expanded') === 'false'`);
  await check("Scroll progress and header update", `document.querySelector('.site-header').classList.contains('scrolled') && document.querySelector('.progress').style.transform !== 'scaleX(0)'`);
  await check("No desktop horizontal overflow", `document.documentElement.scrollWidth <= innerWidth`);
  await mkdir('docs/interactions', { recursive: true });
  for (const width of [390, 768]) {
    await send("Emulation.setDeviceMetricsOverride", { width, height: 844, deviceScaleFactor: 1, mobile: false });
    await evaluate(`scrollTo({top:0,behavior:'instant'})`);
    await pause(250);
    await click('.nav-toggle');
    await check(`${width}px mobile menu opens`, `document.querySelector('.nav-toggle').getAttribute('aria-expanded') === 'true' && document.querySelector('.nav-links').classList.contains('open')`);
    await evaluate(`document.querySelector('.nav-links a').focus()`);
    await key("Escape");
    await check(`${width}px Escape closes and restores focus`, `document.querySelector('.nav-toggle').getAttribute('aria-expanded') === 'false' && document.activeElement.matches('.nav-toggle')`);
    await key("Enter");
    await check(`${width}px keyboard menu opening focuses first link`, `document.activeElement.matches('.nav-links a') && document.activeElement.textContent === 'Academy'`);
    await key("Tab");
    await check(`${width}px Tab reaches next menu link`, `document.activeElement.dataset.brand === 'market'`);
    await key("Escape");
    await check(`${width}px closed menu excludes links from focus`, `[...document.querySelectorAll('.nav-links a')].every(link => link.getClientRects().length === 0)`);
    await click('.nav-toggle');
    await send("Input.dispatchMouseEvent", { type: "mousePressed", x: width / 2, y: 600, button: "left", clickCount: 1 });
    await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: width / 2, y: 600, button: "left", clickCount: 1 });
    await pause(100);
    await check(`${width}px outside click closes menu`, `document.querySelector('.nav-toggle').getAttribute('aria-expanded') === 'false'`);
    await click('.nav-toggle');
    await click('.nav-links a[data-brand="market"]');
    await check(`${width}px menu link closes and selects Marketplace`, `!document.querySelector('#panel-market').hidden && document.querySelector('.nav-toggle').getAttribute('aria-expanded') === 'false'`);
    await pause(300);
    await check(`${width}px headline stays stable`, `document.querySelector('.rotator .on').textContent === 'technical professionals'`);
    await check(`${width}px no horizontal overflow`, `document.documentElement.scrollWidth <= innerWidth`);
  }
  await send("Emulation.setTouchEmulationEnabled", { enabled: true });
  await scroll('.value');
  const card = await evaluate(`(() => {const r=document.querySelector('.value').getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};})()`);
  await send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [card] });
  await send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await pause(350);
  await check("Touch tap expands value card", `document.querySelector('.value').getAttribute('aria-expanded') === 'true'`);
  await send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [card] });
  await send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await pause(350);
  await check("Second touch tap collapses value card", `document.querySelector('.value').getAttribute('aria-expanded') === 'false'`);
  await send("Emulation.setTouchEmulationEnabled", { enabled: false });
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  await pause(300);
  await check("Reduced motion keeps content and headline readable", `[...document.querySelectorAll('.reveal')].filter(el=>el.getClientRects().length).every(el=>getComputedStyle(el).opacity === '1' && getComputedStyle(el).transform === 'none') && document.querySelector('.rotator .on').textContent === 'technical professionals'`);
  await check("Reduced motion disables parallax and seal movement", `document.querySelector('.site-interactions').style.getPropertyValue('--py') === '0px' && document.querySelector('.seal-wrap').style.getPropertyValue('--seal-transform') === 'none'`);
  await check("Reduced motion disables animation", `getComputedStyle(document.querySelector('.cycle-ring')).animationName === 'none'`);
  await scroll('#contact-form');
  await evaluate(`document.querySelector('#contact-form').reset()`);
  await click('#contact-form button[type="submit"]');
  await check('Contact validation identifies empty required fields', `document.querySelector('#f-name').getAttribute('aria-invalid') === 'true' && document.querySelector('#f-email').getAttribute('aria-invalid') === 'true' && document.querySelector('#f-msg').getAttribute('aria-invalid') === 'true' && document.activeElement.id === 'f-name'`);
  await send('Fetch.enable', { patterns: [{ urlPattern: '*/api/contact', requestStage: 'Request' }] });
  const fillContact = async () => evaluate(`document.querySelector('#f-name').value='Browser Test'; document.querySelector('#f-email').value='browser@example.com'; document.querySelector('#f-msg').value='A browser test enquiry.'; document.querySelector('#f-website').value=''`);
  await fillContact();
  contactMock = { status: 201, delay: 800, body: { message: 'Your enquiry has been received.' } };
  await click('#contact-form button[type="submit"]');
  await check('Contact pending state disables repeated clicks', `document.querySelector('#contact-form').getAttribute('aria-busy') === 'true' && document.querySelector('#contact-form button[type="submit"]').disabled && document.querySelector('#contact-status').textContent.includes('Saving')`);
  await evaluate(`document.querySelector('#contact-form').requestSubmit()`);
  await until(() => evaluate(`document.querySelector('#contact-status').textContent === 'Your enquiry has been received.'`), 'saved contact state');
  assert.equal(contactRequests, 1, 'Duplicate submit is prevented');
  checks.push('Contact pending state sends only one request');
  await check('Contact success clears fields and keeps an interest selected', `document.querySelector('#f-name').value === '' && !!document.querySelector('input[name="interest"]:checked') && document.querySelector('#contact-status').getAttribute('role') === 'status'`);
  for (const mock of [
    { status: 422, body: { errors: { email: 'Enter a valid email address.' } }, expected: 'highlighted fields' },
    { status: 429, body: { error: 'Rate limited' }, expected: 'Too many enquiries' },
    { status: 503, body: { error: 'Unavailable' }, expected: "couldn't save" },
    { fail: true, expected: "couldn't confirm" },
  ]) {
    await fillContact();
    contactMock = mock;
    await click('#contact-form button[type="submit"]');
    await until(() => evaluate(`document.querySelector('#contact-status').textContent.includes(${JSON.stringify(mock.expected)})`), 'contact error state');
    await check(`Contact ${mock.status || 'network failure'} preserves entries`, `document.querySelector('#f-name').value === 'Browser Test' && document.querySelector('#f-msg').value === 'A browser test enquiry.' && !document.querySelector('#contact-form button[type="submit"]').disabled && !document.querySelector('#contact-status').classList.contains('success')`);
    if (mock.status === 422) await check('Contact server validation links field errors', `document.querySelector('#f-email').getAttribute('aria-describedby') === 'email-error' && document.querySelector('#email-error').textContent === 'Enter a valid email address.'`);
  }
  await send('Fetch.disable');
  if (process.env.SECURITY_CHECK === 'true') {
    await fillContact();
    await click('#contact-form button[type="submit"]');
    await until(() => evaluate(`document.querySelector('#contact-status').textContent === 'Your enquiry has been received.'`), 'real contact insert under CSP');
    await check('CSP permits a real same-origin contact submission', `document.querySelector('#contact-status').classList.contains('success') && location.origin === ${JSON.stringify(origin)}`);
    await evaluate('document.fonts.ready');
    await check('CSP permits self-hosted fonts', `[...document.fonts].filter(font => font.status === 'loaded').length >= 2`);
    await check('CSP permits page images', `[...document.images].filter(image => image.getClientRects().length).every(image => image.complete && image.naturalWidth > 0)`);
    await check('Framework script tags carry a nonce', `[...document.scripts].filter(script => script.type !== 'application/json').every(script => !!script.nonce)`);
    await check('No CSP violations during page interactions or contact submission', `window.__cspViolations.length === 0`);
  }
  await check('Contact requests target only the same-origin endpoint', `${JSON.stringify(requests.filter(request => request.type === 'Fetch' || request.type === 'XHR').every(request => request.url === new URL('/api/contact', origin).href && request.method === 'POST'))}`);
  await check('Contact privacy notice describes collected fields and retention', `document.querySelector('#contact-privacy').textContent.includes('180 days') && document.querySelector('#contact-privacy').textContent.includes('name, email, enquiry interest and message')`);
  for (const width of [390, 768, 1440]) {
    await send("Emulation.setDeviceMetricsOverride", { width, height: 1000, deviceScaleFactor: 1, mobile: false });
    await evaluate(`scrollTo({top:0,behavior:'instant'})`);
    await pause(250);
    const shot = await send("Page.captureScreenshot", { format: "png" });
    await writeFile(`docs/interactions/${width}.png`, Buffer.from(shot.data, "base64"));
    await scroll('#contact-form');
    const formShot = await send('Page.captureScreenshot', { format: 'png' });
    await mkdir('docs/contact', { recursive: true });
    await writeFile(`docs/contact/form-${width}.png`, Buffer.from(formShot.data, 'base64'));
  }
  assert.deepEqual(errors, [], "No browser exceptions or console errors");
  checks.push("No browser exceptions or console errors");
  if (process.env.SECURITY_CHECK === 'true') {
    const mode = process.env.SECURITY_CSP_MODE;
    // A parser-inserted script is a reliable negative control; DevTools-created scripts
    // can inherit debugger execution privileges and do not represent an HTML injection.
    const original = await fetch(origin, { headers: { 'accept-encoding': 'identity' } });
    documentMock = { html: (await original.text()).replace('</body>', '<script>window.__untrustedScriptRan = true</script></body>'), headers: [...original.headers].filter(([name]) => !['content-encoding', 'content-length', 'transfer-encoding'].includes(name)).map(([name, value]) => ({ name, value })) };
    await send('Fetch.enable', { patterns: [{ urlPattern: `${origin}/*`, resourceType: 'Document', requestStage: 'Request' }] });
    await send('Page.navigate', { url: `${origin}/?csp-negative-control=1` });
    await until(() => evaluate(`document.readyState === 'complete'`), 'CSP negative control load');
    await pause(300);
    await check(`CSP ${mode} behavior for an untrusted inline script`, mode === 'report-only' ? `window.__untrustedScriptRan === true && window.__cspViolations.some(v => v.directive === 'script-src-elem' && v.disposition === 'report')` : `window.__untrustedScriptRan !== true && window.__cspViolations.some(v => v.directive === 'script-src-elem' && v.disposition === 'enforce')`);
  }
  await writeFile(process.env.BROWSER_REPORT_PATH || 'docs/interactions/check-report.json', JSON.stringify({ origin, checks, errors }, null, 2) + '\n');
  console.log(`${checks.length} production browser checks passed.`);
  await send("Browser.close");
} finally {
  socket?.close();
  if (browser.exitCode === null) browser.kill();
  // Remove only the temporary directory created for this test run.
  const absolute = resolve(profile);
  if (absolute.startsWith(resolve(tmpdir()) + sep) && absolute.split(sep).at(-1).startsWith('kalvia-interactions-')) {
    await pause(500);
    await rm(absolute, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  }
}
