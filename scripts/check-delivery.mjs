import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { openBrowser, pause } from './browser-session.mjs';
const origin = process.env.TEST_ORIGIN || 'http://127.0.0.1:3300';
const checks = [];
const check = (name, condition) => { assert.ok(condition, name); checks.push(name); };
await mkdir('docs/delivery', { recursive: true });
const html = await (await fetch(origin)).text();
check('Canonical uses confirmed HTTPS domain', html.includes('rel="canonical" href="https://kalvia.one"'));
check('Site title and description present', html.includes('Kalvia | Enabling Prosperity') && html.includes('name="description"'));
check('Theme colour and SVG favicon present', html.includes('name="theme-color" content="#170C79"') && html.includes('/assets/favicon.svg'));
for (const route of ['opengraph-image', 'twitter-image']) {
  check(`${route} metadata points to production`, html.includes(`https://kalvia.one/${route}`));
  const response = await fetch(`${origin}/${route}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  check(`${route} returns 1200 by 630 PNG`, response.ok && response.headers.get('content-type').includes('image/png') && bytes.readUInt32BE(16) === 1200 && bytes.readUInt32BE(20) === 630);
  if (route === 'opengraph-image') await writeFile('docs/delivery/social-preview.png', bytes);
}
const robots = await (await fetch(`${origin}/robots.txt`)).text();
check('Robots points to production sitemap', robots.includes('Sitemap: https://kalvia.one/sitemap.xml'));
const sitemap = await (await fetch(`${origin}/sitemap.xml`)).text();
check('Sitemap contains homepage only', sitemap.includes('<loc>https://kalvia.one/</loc>') && (sitemap.match(/<loc>/g) || []).length === 1);
const browser = await openBrowser();
const samples = [];
try {
  await browser.send('Network.enable');
  await browser.send('Network.setCacheDisabled', { cacheDisabled: true });
  await browser.send('Page.addScriptToEvaluateOnNewDocument', { source: 'window.deliveryShifts=[];new PerformanceObserver(list=>{for(const entry of list.getEntries())if(!entry.hadRecentInput)window.deliveryShifts.push({value:entry.value,sources:entry.sources.map(s=>s.node?.className)});}).observe({type:"layout-shift",buffered:true});' });
  for (const width of [390, 768, 1440]) {
    await browser.send('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: width < 600 });
    await browser.send('Page.navigate', { url: origin });
    await pause(1500);
    await browser.evaluate('document.fonts.ready');
    const read = () => browser.evaluate(`(()=>{const hero=document.querySelector('.hero-photo'),headline=document.querySelector('h1');const rect=e=>{const r=e.getBoundingClientRect();return {width:r.width,height:r.height}};return {hero:rect(hero),headline:rect(headline),loaded:hero.complete&&hero.naturalWidth>0,preload:!!document.querySelector('link[rel="preload"][as="image"]'),gallery:[...document.querySelectorAll('.frame img')].every(i=>i.loading==='lazy'&&i.decoding==='async'&&i.width>0&&i.height>0),shifts:window.deliveryShifts,overflow:document.documentElement.scrollWidth>innerWidth}})()`);
    const before = await read();
    await pause(5300);
    const after = await read();
    check(`${width}px hero loaded and preloaded`, after.loaded && after.preload);
    check(`${width}px gallery deferred with reserved dimensions`, after.gallery);
    check(`${width}px image and rotating headline dimensions stable`, JSON.stringify(before.hero) === JSON.stringify(after.hero) && JSON.stringify(before.headline) === JSON.stringify(after.headline));
    check(`${width}px no horizontal overflow`, !after.overflow);
    const score = after.shifts.reduce((total, shift) => total + shift.value, 0);
    check(`${width}px layout shift below 0.1`, score < 0.1);
    samples.push({ width, score, ...after });
  }
  check('No browser errors', browser.errors.length === 0);
} finally { await browser.close(); }
await writeFile('docs/delivery/check-report.json', JSON.stringify({ checks, samples }, null, 2) + '\n');
console.log(`${checks.length} delivery checks passed`);
